# Deploying

- [AWS (SES + SNS + SQS)](#aws)
- [Rest of the App](#rest-of-the-app)
  - [Prerequisites](#prerequisites)
  - [Initializing Nodes](#initialize-the-nodes)
  - [Linkerd (Optional)](#install-linkerd)
  - [Sealed Secrets](#sealed-secrets)
  - [Create our Services](#create-our-services)
  - [MongoDB](#mongodb-replication)
  - [NATS + Jetstream](#NATS-Jetstream)
  - [Monitoring (Axiom)](#monitoring)

#### AWS

To deploy to AWS, make sure you have [configured SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) correctly. Update the `AWS_PROFILE` variable in [deploy.sh](deploy.sh) to match the profile names you want to use. Update the subdomain you want to use for sending emails in [configure-ses.ts](./services/aws/lib/configure-ses.ts).

Change directories into `/aws`, install dependencies with `npm i` and set up the environment variables in the `.env`. There is an `.env.example` file that you can copy to get started.

Once that's done, you can go back to the root and deploy using `./scripts/deploy.sh <development|staging|production>`.

After running the deploy script, most of your environment will be setup but you'll need to add a few records to your DNS provider. Your SES dashboard should look something like this with the records you need to add:

![SES DNS Records](./images/ses-setup.png)

At the end of it you should have (for each environment)

3 DNS records for DKIM

> Key: XXXXXXXXXXXXX Value: XXXXXXXXXXXXX

1 MX Record for custom mail from

> Key: notifications.plutomi.com Value: feedback-smtp.us-east-1.amazonses.com Priority: 10

1 TXT Record for SPF

> Key notifications.plutomi.com "v=spf1 include:amazonses.com ~all"

1 TXT Record for DMARC.
This is a TXT record with the name `_dmarc.yourMAILFROMdomain.com` and value `v=DMARC1; p=none; rua=mailto:you@adomainwhereyoucanreceiveemails.com`
See [this link](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html) for more information.

Then after all of that is done, make sure to beg aws to get you out of sandbox since you now have a way to handle complaints.

## Rest of the App

Plutomi runs on Kubernetes, specifically [K3S](https://k3s.io). The web and API are both dockerized and the images can be found on [Docker Hub](https://hub.docker.com/u/plutomi). We will do our best to keep **x86** and **ARM** versions up to date but x86 will take priority this is the only architecture we have available in the US at this time.

For the datastores, we use [MongoDB](https://mongodb.com/) and [NATS](https://nats.io/). We use the official [MongoDB docker image](https://hub.docker.com/_/mongo/tags?page=&page_size=&ordering=&name=7.0.8) with our own StatefulSet and are debating doing the same thing for NATS soon, although they recommend installing the [Helm chart directly](https://docs.nats.io/running-a-nats-service/nats-kubernetes). We have _not_ explored using alternative MongoDB Helm charts but are considering it, like those from Bitnami or Percona.

Plutomi has _not_ been tested to run on a VPS with networked storage like EC2, although this shouldn't be a blocker as K3S can and does work with it. We run on multiple nodes with local SSD storage on Hetzner. If you'd like some free credits to get started with Hetzner, please use [our referral link](https://hetzner.cloud/?ref=7BufEUOAUm8x).

### Prerequisites

- 3 nodes with Ubuntu 20.04 installed and SSH access

- Install [SealedSecrets](https://sealed-secrets.netlify.app/) locally on your machine

```bash
brew install kubeseal
```

This is how we encrypt secrets in the cluster AND allows us to commit them into this repository.

- Open these ports on each of the nodes so they can talk back and forth to each other:

  - 2379-2380 - Required for high availability etcd
  - 6443 - K3S Supervisor and for the API server
  - 10250 - Kubelet metrics
  - 8080 - [Kubeseal port](https://github.com/bitnami-labs/sealed-secrets/issues/1447#issuecomment-2022217031)

  - 30000-32767 - NodePort Services
  - 8472 - Required for Flannel VXLAN

- Open these ports INBOUND on the nodes so that the internet can talk to the cluster:

  - 80 - HTTP - Required if using cert-manager / LetsEncrypt for HTTPS
  - 443 - HTTPS
  - 6443 - Your home IP to access the K3S API server

#### Initialize the nodes

> If installing on a single node, you can simply do:
>
> **curl -sfL https://get.k3s.io | sh -**
>
> And skip most of the steps below as they deal with replication and high availability.

---

Create a K3S_TOKEN secret

```bash
openssl rand -base64 50 | tr -d '\n/=+'
```

Install K3S with that token

```bash
curl -sfL https://get.k3s.io | K3S_TOKEN=TOKEN_YOU_GENERATED K3S_KUBECONFIG_MODE="644" K3S_NODE_NAME=YOUR_APP-production-0 sh -s - server  --cluster-init  --node-ip PRIVATE_NETWORKING_PORT --advertise-address PRIVATE_NETWORKING_PORT --node-external-ip PUBLIC_IP --tls-san PRIVATE_NETWORKING_PORT --tls-san PUBLIC_IP
```

Copy the new secret token that was created

```bash
cat /var/lib/rancher/k3s/server/node-token
```

Install the K3S agent on the second node

```bash
curl -sfL https://get.k3s.io | K3S_TOKEN=TOKEN_EXTRACTED_FROM_NODE_1 K3S_KUBECONFIG_MODE="644" K3S_NODE_NAME=YOUR_APP-production-1 sh -s - server  --server https://PRIVATE_IP_OF_NODE_1:6443 K3S_KUBECONFIG_MODE="644"   --node-ip PRIVATE_IP_OF_THE_SECOND_NODE--advertise-address PRIVATE_IP_OF_THE_SECOND_NODE--node-external-ip PUBLIC_IP_OF_THE_SECOND_NODE --tls-san PRIVATE_IP_OF_THE_SECOND_NODE --tls-san PUBLIC_IP_OF_THE_SECOND_NODE
```

...and repeat the process for the third node.

Veriy all the nodes are connected:

```bash
sudo k3s kubectl get nodes
```

Then, label each node for pod spreading. Run this command, and change the label for each node:

```bash
kubectl label nodes plutomi-production-0 plutomi-role=plutomi-production-0
```

Now confirm we are using the correct KUBECCONFIG in one of the nodes:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Install Sealed Secrets

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets

helm install sealed-secrets -n kube-system --set-string fullnameOverride=sealed-secrets-controller sealed-secrets/sealed-secrets
```

Install cert-manager for the TLS certificate

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
```

This one will take a minute:

```bash
helm install \
 cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

### Sealed Secrets

Copy the KUBECONFIG file to your local machine:

```bash
scp -i ~/.ssh/YOUR_SSH_KEY root@YOUR_SERVER_IP:/etc/rancher/k3s/k3s.yaml ~/.kube/YOUR_CONFIG_NAME
```

Edit the file, and change the IP the master node that has the **sealed-secrets-controller** on it. You can find this node with:

```bash
kubectl get pods -o wide --all-namespaces | grep sealed-secrets-controller
```

```bash
vim ~/.kube/YOUR_CONFIG_NAME
```

Then, ensure you're using it:

```bash
export KUBECONFIG=~/.kube/YOUR_CONFIG_NAME
```

Then on your own PC, create the secrets. First the MongoDB init credentials:

```bash
kubectl create secret generic mongodb-init-secret --dry-run=client --from-literal=MONGO_INITDB_ROOT_USERNAME=LONG_USERNAME  --from-literal=MONGO_INITDB_ROOT_PASSWORD=LONG_PASSWORD -o yaml | kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --format yaml > ./k8s/secrets/mongodb.yaml
```

If using Cloudflare for DNS, we need a token for cert-manager to use. We need to store it in a secret as well:

```bash
kubectl create secret generic cloudflare-token --dry-run=client --from-literal=CLOUDFLARE_TOKEN=TOKEN_HERE -n cert-manager -o yaml | kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --format yaml > ./k8s/secrets/cloudflare.yaml
```

Create other global secrets shared by most of the backend:

```bash
kubectl create secret generic global-config-secret --dry-run=client --from-literal=MONGODB_URL=mongodb://USERNAMEdifferentfromINITDB_ROOT:PASSWORDdifferentfromINITDB_ROOT@mongodb.default.svc.cluster.local:27017/plutomi -o yaml | kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --format yaml > ./k8s/secrets/global.yaml
```

Transfer the files over to your server in the `/k8s` directory and apply the secrets:

```bash
cd k8s && kubectl apply -f secrets/
```

Install the Cluster Issuer for cert-manager:

```bash
helm upgrade --install cluster-issuer . -f values/issuer.yaml
```

### Install [Linkerd](https://linkerd.io/)

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://run.linkerd.io/install-edge | sh
```

```bash
export PATH=$PATH:$HOME/.linkerd2/bin
```

Check the progress:

```bash
linkerd check --pre
```

Then install the CRDs:

```bash
linkerd install --crds | kubectl apply -f -

linkerd install | kubectl apply -f -
```

Do another check:

```bash
linkerd check
```

Ensure Linkerd sidecar gets attached to our pods when we spin them up:

```bash
kubectl annotate namespace default linkerd.io/inject=enabled
kubectl annotate namespace kube-system linkerd.io/inject=enabled
```

> This next part is optional, but allows you to visualize the traffic between your services.
> https://linkerd.io/2.15/getting-started/#step-5-explore-linkerd

Install the Linkerd viz extension:

```bash
linkerd viz install | kubectl apply -f -
```

And check it things are working

```bash
linkerd viz check

linkerd viz edges pod
```

or open the dashboard:

````bash
linkerd

### Create our Services

```bash
helm upgrade --install web-service . -f values/services/web.yaml
helm upgrade --install api-service . -f values/services/api.yaml
helm upgrade --install mongodb-service . -f values/services/mongodb.yaml
````

Deploy the web pod:

```bash
helm upgrade --install web-deploy . -f values/deployments/web.yaml -f values/deployments/_production.yaml
```

Allow traffic in, this will make a request for a TLS certificate if you are using those settings at the ingress. It might take a few minutes:

```bash
helm upgrade --install traefik-deploy . -f values/ingress.yaml -f values/deployments/_production.yaml
```

It is here where you want to update your DNS to point to your nodes.

#### MongoDB

Deploy the MongoDB Pods:

```bash
helm upgrade --install mongodb-deploy . -f values/stateful-sets/mongodb.yaml
```

Exec into one...

```bash
kubectl exec -it mongodb-0 -c mongodb -- mongosh "mongodb://mongodb.default.svc.cluster.local:27017/test"
```

...and let's link them up! Make sure this matches the values in the StatefulSet:

```bash
rs.initiate({ _id: "rs0", version: 1, members: [ { _id: 0, host : "mongodb-0.mongodb.default.svc.cluster.local:27017" }, { _id: 1, host : "mongodb-1.mongodb.default.svc.cluster.local:27017" },{ _id: 2, host : "mongodb-2.mongodb.default.svc.cluster.local:27017" }]})
```

> NOTE: `rs.status()` will show 3 SECONDARY nodes until they reach a quorum and elect one as primary. This takes ~10 seconds. If deploying a single replica, you can remove the other nodes. It's still a good idea to initialize the replica set incase you add more pods in the future.

Test that replication is working:

```bash
db.test.insertOne({ name: "Jose"});
```

Exec into another pod, and see the item there hopefully :D

```bash
kubectl exec -it mongodb-1 -c mongodb -- mongosh
db.test.findOne()
```

Ok back to the other pod:

```bash
kubectl exec -it mongodb-0 -c mongodb -- sh
```

Create an admin user:

```bash
mongosh admin --eval "db.createUser({ user: '$MONGO_INITDB_ROOT_USERNAME', pwd: '$MONGO_INITDB_ROOT_PASSWORD', roles: [{ role: 'root', db: 'admin' }] })"
```

Then, login to the DB with the new user:

```bash
mongosh --username ADMIN_USER_CREDENTIALS --password ADMIN_USER_PASSWORD
```

Use the `plutomi` database and create a user for the app. Make sure it has _readWrite_ permissions on the `plutomi` database AND that the credentials match what you put in the MONGODB_URL secret.

```bash
use plutomi
db.createUser({
  user: "MONGODB_URL_USERNAME",
  pwd: "MONGODB_URL_PASSWORD",
  roles: [{ role: "readWrite", db: "plutomi" }]
})
```

Now deploy the API/Consumers:

```bash
helm upgrade --install api-deploy . -f values/deployments/api.yaml -f values/deployments/_production.yaml
```

### NATS Jetstream

Because we are using the official NATS Helm chart, installation is pretty easy. However, [Linkerd needs a small workaround](https://github.com/linkerd/linkerd2/issues/1715#issuecomment-760311524) to work with NATS which is setting port 4222 as opaque. This is already handled in the `values/nats.yaml` file by setting this annotation.

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
helm upgrade --install nats nats/nats -f values/nats.yaml
```

### Monitoring

We use the [Axiom](https://axiom.co/) for logging instead of keeping everything in the cluster. You can sign up and add your secrets like normal. This merges the secrets into the global.yaml file if you already created it previously:

```bash
kubectl create secret generic global-config-secret --dry-run=client --from-literal=AXIOM_DATASET=DATASET_NAME_HERE --from-literal=AXIOM_ORG_ID=ORG_ID_HERE --from-literal=AXIOM_TOKEN=TOKEN_HERE -o yaml | kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --format yaml --merge-into ./k8s/secrets/global.yaml
```
