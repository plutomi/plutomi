## Having issues?

Here we will document any issues that we have run into and how we resolved them. This is a living document and will be updated as we run into more issues.

### Linkerd

```console
× can initialize the client

    error configuring Kubernetes API client: invalid configuration: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
    see https://linkerd.io/2/checks/#k8s-api for hints

Failed to run extensions checks: error configuring Kubernetes API client: invalid configuration: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
```

Make sure to `export KUBECONFIG=/etc/rancher/k3s/k3s.yaml` in your node first.
