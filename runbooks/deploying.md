# Deploying

- [Prerequisites](#prerequisites)
- [AWS / SES](#aws)
- [CloudFlare](#cloudflare) - Make sure to create a CLOUDFLARE_DNS_TOKEN with the `Zone:Edit, DNS:Edit` permissions
- TODO add CLOUDFLARE_R2_ADMIN_TOKEN - https://dash.cloudflare.com/?to=/:account/r2/api-tokens
- [Initializing Nodes](#initialize-the-nodes)
- [Linkerd (Optional)](#install-linkerd)
- [Sealed Secrets](#sealed-secrets)
- [Datasources](#create-our-data-sources)
  - [MySQL](#mysql)
- [Services](#deploy-the-services)
- [Monitoring (Axiom - Optional)](#monitoring)

## Prerequisites

Plutomi runs on Kubernetes, specifically [K3S](https://k3s.io). The web and API TODO consumer note are both dockerized and the images can be found on [Docker Hub](https://hub.docker.com/u/plutomi). We will do our best to keep **x86** and **ARM** versions up to date but x86 will take priority this is the only architecture we have available in the US at this time.

For the datastores, we use [MySQL](https://www.mysql.com/) as our primary OLTP store and TODO plan to add redis in a bit for rate limiting on API Keys

Plutomi has _not_ been tested to run on a VPS with networked storage like EC2 & EBS, although this shouldn't be a blocker as K3S can and does work with it. We run on multiple nodes with local SSD storage on Hetzner. If you'd like some free credits to get started with Hetzner, but can be run on just one node without issue. Please use [our referral link](https://hetzner.cloud/?ref=7BufEUOAUm8x) if you'd like some free credits :D

### Prerequisites

- 3 nodes with Ubuntu 20.04 installed and SSH access

This is how we encrypt secrets in the cluster AND allows us to commit them into this repository.

- Open these ports on each of the nodes so they can talk back and forth to each other:

  - 2379-2380 - Required for high availability etcd
  - 6443 - K3S Supervisor and for the API server
  - 10250 - Kubelet metrics

  - 30000-32767 - NodePort Services
  - 8472 - Required for Flannel VXLAN

- Open these ports INBOUND on the nodes so that the internet can talk to the cluster:

  - 80 - HTTP - Required if using cert-manager / LetsEncrypt for HTTPS
  <!-- - 443 - HTTPS -->
  - 6443 - Your home IP to access the K3S API server

### Initialize the nodes

> Note: We swap out containerd with docker

Install Docker , enable it, and run it on boot:

```bash
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

Install the AWS ECR credential helper:

```bash
sudo yum install -y amazon-ecr-credential-helper
```

Edit the docker config file to use the credential helper:

```bash
TODO update this
```

Restart Docker:

```bash
sudo systemctl restart docker
```

---

Install K3S with that token

```bash
# Create a K3S_TOKEN secret

export K3S_TOKEN=$(openssl rand -base64 50 | tr -d '\n/=+')

# Get the IP of the node
export NODE_IP=$(hostname -i)

# Install K3S with docker runtime
curl -sfL https://get.k3s.io | K3S_TOKEN=$K3S_TOKEN K3S_KUBECONFIG_MODE="644" sh -s - server --docker --cluster-init  --node-ip $NODE_IP --advertise-address $NODE_IP  --tls-san $NODE_IP

# Copy the new secret token that was created so other nodes can join
export SERVER_NODE_TOKEN=$(sudo cat /var/lib/rancher/k3s/server/node-token)

echo $SERVER_NODE_TOKEN
```

Install the K3S agent on the second and third nodes using the `$SERVER_NODE_TOKEN`:

```bash
# Second Node
export NODE_IP=$(hostname -i)

export SERVER_NODE_TOKEN=YOUR_SERVER_NODE_TOKEN_FROM_FIRST_NODE
curl -sfL https://get.k3s.io | K3S_TOKEN=$SERVER_NODE_TOKEN K3S_KUBECONFIG_MODE="644" sh -s - server --docker  --server https://IP_FROM_THE_FIRST_NODE:6443  --node-ip $NODE_IP --advertise-address $NODE_IP --tls-san $NODE_IP

# Third Node
export NODE_IP=$(hostname -i)
export SERVER_NODE_TOKEN=YOUR_SERVER_NODE_TOKEN_FROM_FIRST_NODE


curl -sfL https://get.k3s.io | K3S_TOKEN=$SERVER_NODE_TOKEN K3S_KUBECONFIG_MODE="644" sh -s - server  --docker --server https://IP_FROM_THE_FIRST_NODE:6443  --node-ip $NODE_IP --advertise-address $NODE_IP --tls-san $NODE_IP

```

Your control plane is now set up!

You'd do the same thing for the agent/worker nodes, but you'd omit the `--cluster-init` and `--server` flags.

```bash
export NODE_IP=$(hostname -i)
export SERVER_NODE_TOKEN=(YOUR_SERVER_NODE_TOKEN)


curl -sfL https://get.k3s.io | K3S_URL=https://IP_FROM_THE_FIRST_NODE:6443 K3S_TOKEN=$SERVER_NODE_TOKEN  K3S_KUBECONFIG_MODE="644" sh -s - --node-ip $NODE_IP --advertise-address $NODE_IP  --tls-san $NODE_IP
```

Verify all the nodes are connected:

```bash
kubectl get nodes
```

Now confirm we are using the correct KUBECCONFIG in one of the nodes:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)

<!-- # TODO remove

Sealed secrets allow us to safely store encrypted secrets in the public repo.

Install it:

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets

helm install sealed-secrets -n kube-system --set-string fullnameOverride=sealed-secrets-controller sealed-secrets/sealed-secrets
``` -->

<!-- Copy the KUBECONFIG file to your local machine: -->
<!--
```bash
scp -i ~/.ssh/YOUR_SSH_KEY root@YOUR_SERVER_IP:/etc/rancher/k3s/k3s.yaml ~/.kube/YOUR_CONFIG_NAME
```

Edit the file, and change the IP the master node that has the **sealed-secrets-controller** on it. You can find this node with:

```bash
kubectl get pods -o wide --all-namespaces | grep sealed-secrets-controller
``` -->

<!-- Then, ensure you're using it: -->

<!-- ```bash
export KUBECONFIG=~/.kube/YOUR_CONFIG_NAME
``` -->

<!-- If using Cloudflare for DNS, we need a token for cert-manager to use. We need to store it in a secret as well: -->

<!-- Create other global secrets shared by most of the backend: -->

<!-- # TODO MYSQL


Transfer the files over to your server in the `/k8s` directory and apply the secrets:

```bash
cd k8s && kubectl apply -f secrets/
``` -->

For MySQL, we are still deciding on how to handle this. We are considering using [Vitess](https://vitess.io/) to manage our MySQL cluster.

## [Linkerd](https://linkerd.io/)

We're using linkerd for mTLS mostly. It allows us to encrypt traffic between services and also provides a nice dashboard for us to see what's going on.

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

```bash
linkerd viz dashboard &
```

## AWS / SES

# TODO update for terraform

---

## Create our data sources

Since other services depend on these, we will deploy them first.

### MySQL

TBD - we are still deciding on how to handle this. We are considering using [Vitess](https://vitess.io/) to manage our MySQL cluster.

## Deploy the Services

````bash
# Web
helm upgrade --install web-deploy . -f values/values.yaml -f values/web.yaml -f values/production.yaml

# API
helm upgrade --install api-deploy . -f values/values.yaml  -f values/api.yaml -f values/production.yaml


### Traefik

Now we need to allow traffic to our applications with Traefik ingress

```bash
helm upgrade --install traefik-deploy . -f values/ingress.yaml
````

### Monitoring

We use [Axiom](https://axiom.co/) for logging instead of keeping everything in the cluster. You can sign up and add your secrets like normal. This merges the secrets into the global.yaml file if you already created it previously:
TODO note about terraform creating this
