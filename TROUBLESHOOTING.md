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

### rust-analyzer

"FetchWorkspaceError: rust-analyzer failed to load workspace: Failed to load the project at $DIRECTORY"

Make sure your `.vscode/.settings.json` file has the correct path to your workspace. For example:

```json
{
  "rust-analyzer.linkedProjects": [
    "services/api/Cargo.toml",
    "services/consumers/template/Cargo.toml",
    "services/shared/Cargo.toml"
  ]
}
```

### proc-macro crate is missing it's build data

TBD

### "You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license' from within a Terminal window to review and agree to the Xcode and Apple SDKs license"

```
sudo xcodebuild -license
```

Then (if needed):

```
sudo xcodebuild -license
```
