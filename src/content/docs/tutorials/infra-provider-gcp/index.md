---
title: 'Set up a Datum managed Location backed by GCP'
description: 'Set up a Datum managed Location backed by GCP.'
order: 2
---

## Before you begin

This tutorial assumes you have already
[registered an account](/docs/get-started),
[installed and configured the necessary tools](/docs/tasks/tools.md) to
interact with Datum, and have [created a Datum project](/docs/tasks/create-project).

### Grant Datum Cloud access to your GCP project

Datum requires the following roles to be granted to a Datum managed service
account which is specific to each Datum project:

- `roles/compute.admin`
- `roles/secretmanager.admin`
- `roles/iam.serviceAccountAdmin`
- `roles/iam.serviceAccountUser`

The service account email will be in the following format:

`PROJECT_NAME@datum-cloud-project.iam.gserviceaccount.com`

Use the gcloud tool to grant IAM Roles to your Datum service account, replacing
`GCP_PROJECT_ID` and `PROJECT_NAME` with their respective values:

```shell
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="serviceAccount:PROJECT_NAME@datum-cloud-project.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="serviceAccount:PROJECT_NAME@datum-cloud-project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="serviceAccount:PROJECT_NAME@datum-cloud-project.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="serviceAccount:PROJECT_NAME@datum-cloud-project.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

For guidance on granting roles via Google's Console, see [Manage access to projects, folders, and organizations][gcp-iam-role-admin].

<span class="alert alert-info">Note: You may encounter the following error if your GCP organization was created on or after May 3, 2024. See GCP's documentation on [restricting identities by domain](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-domains) for instructions on how to permit service accounts from the `datum-cloud-project` project.

> The 'Domain Restricted Sharing' organization policy
> (constraints/iam.allowedPolicyMemberDomains) is enforced. Only principals in
> allowed domains can be added as principals in the policy. Correct the
> principal emails and try again. Learn more about domain restricted sharing.
>
> Request ID: 8499485408857027732</span>

[gcp-iam-role-admin]: https://cloud.google.com/iam/docs/granting-changing-revoking-access

## Register a Datum Managed Location

Before creating a workload, a Location must be registered.

Use the following example manifest to create a location which Datum's control
plane will be responsible for managing, replacing `GCP_PROJECT_ID` with
your GCP project id:

```yaml
apiVersion: networking.datumapis.com/v1alpha
kind: Location
metadata:
  name: my-gcp-us-south1-a
spec:
  locationClassName: datum-managed
  topology:
    topology.datum.net/city-code: DFW
  provider:
    gcp:
      projectId: GCP_PROJECT_ID
      region: us-south1
      zone: us-south1-a
```

1. Replace `topology.datum.net/city-code`'s value (`DFW`) with the desired city
   code for your workloads.
2. Update the `gcp` provider settings to reflect your GCP project ID, desired
   region, and zone.

Apply the manifest:

```shell
kubectl apply -f <path-to-location-manifest>
```

List Locations:

```shell
kubectl get locations
```

```shell
NAME                 AGE
my-gcp-us-south1-a   5s
```

## Create a Network

Before creating a workload, a Network must be created. You can use the following
manifest to do this:

<span class="alert alert-info">Note: In the future, a default network may automatically be created in a namespace.</span>

```yaml
apiVersion: networking.datumapis.com/v1alpha
kind: Network
metadata:
  name: default
spec:
  ipam:
    mode: Auto
```

Apply the manifest:

```shell
kubectl apply -f <path-to-network-manifest>
```

List Networks:

```shell
kubectl get networks
```

```shell
NAME      AGE
default   5s
```

## Create a Workload

<span class="alert alert-warning">Caution: These actions will result in billable resources being created in the GCP project for the target location. Destroy any resources which are not needed to avoid unnecessary costs.</span>

Create a manifest for a sandbox based workload, for example:

```yaml
apiVersion: compute.datumapis.com/v1alpha
kind: Workload
metadata:
  name: my-container-workload
spec:
  template:
    spec:
      runtime:
        resources:
          instanceType: datumcloud/d1-standard-2
        sandbox:
          containers:
            - name: httpbin
              image: mccutchen/go-httpbin
              ports:
                - name: http
                  port: 8080
      networkInterfaces:
        - network:
            name: default
          networkPolicy:
            ingress:
              - ports:
                  - port: 8080
                from:
                  - ipBlock:
                      cidr: 0.0.0.0/0
  placements:
    - name: us
      cityCodes: ['DFW']
      scaleSettings:
        minReplicas: 1
```

Apply the manifest:

```shell
kubectl apply -f <path-to-workload-manifest>
```

### Check the state of the workload

```shell
kubectl get workloads
```

The output is similar to:

```shell
NAME                    AGE   AVAILABLE   REASON
my-container-workload   9s    False       NoAvailablePlacements
```

The `REASON` field will be updated as the system progresses with attempting to
satisfy the workload's intent.

### Check Workload Deployments

A Workload will result in one or more WorkloadDeployments being created, one for
each unique CityCode per placement.

```shell
kubectl get workloaddeployments
```

The output is similar to:

```shell
NAME                           AGE   LOCATION NAMESPCE   LOCATION NAME        AVAILABLE   REASON
my-container-workload-us-dfw   58s   default             my-gcp-us-south1-a   False       LocationAssigned
```

Similar to workloads, the `REASON` field will be updated as the system
progresses with attempting to satisfy the workload's intent. In this case, the
`infra-provider-gcp` operator is responsible for these actions.

### Check Instances

```shell
kubectl -n default get instances -o wide
```

The output is similar to:

```shell
NAME                             AGE   AVAILABLE   REASON              NETWORK IP   EXTERNAL IP
my-container-workload-us-dfw-0   24s   True        InstanceIsRunning   10.128.0.2   34.174.154.114
```

Confirm that the go-httpbin application is running:

```shell
curl -s http://34.174.154.114:8080/uuid
```

```json
{
  "uuid": "8244205b-403e-4472-8b91-728245e99029"
}
```

### Delete the workload

Delete the workload when testing is complete:

```shell
kubectl delete workload my-container-workload
```
