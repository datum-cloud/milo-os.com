---
title: OpenFga
---

# OpenFGA Integration

The integration with OpenFGA is heavily inspired by the [custom roles] modeling
guide. Please read the custom roles document and read the basic concepts
involved in OpenFGA.

[custom roles]: https://openfga.dev/docs/modeling/custom-roles

## Authorization Model

The IAM system will dynamically manage the OpenFGA Authorization Model based on
the resources that are registered by services. A new Type Definition will be
created for every resource defined in the system using the fully qualified
resource name format (e.g. **iam.miloapis.com/Role**).

> **Note**: The OpenFGA schema language does **not** support using the `/` or
> `.` character in type definitions or relationships. OpenFGA **does** support
> using these characters when creating types and relationships using the API.

The IAM system will integrate with the already existing Datum OS OpenFGA model
by merging the dynamically managed Authorization Model created by the IAM system
with the Authorization Model created from the OpenFGA schema. This is done by
taking the existing Authorization Model and overwriting any type definitions
that are using the fully qualified resource name format (e.g.
iam.miloapis.com/Role).

The `iam.miloapis.com/Role` type definition will have a relation for every
permission that may be potentially added to the role by a user. Resources
dynamically created by service registrations will have permission relations
created for any permissions the resource supports along with any permissions
supported by child resources. Resources that have parent relationships defined
will be configured to have permission relations that are bound directly or
granted through a parent relationship.

Below is a simple example showing a single resource defining its own permissions
that may be granted directly through a role binding or inherited through a
parent relationship.

```yaml
type resourcemanager.miloapis.com/Project # module: resourcemanager.miloapis.com, file: dynamically_managed_iam_datumapis_com.fga
  relations
    define granted: [iam.miloapis.com/RoleBinding]
    define parent: [resourcemanager.miloapis.com/Organization]
    define resourcemanager.miloapis.com/projects.create: resourcemanager.miloapis.com/projects.create from granted or resourcemanager.miloapis.com/projects.create from parent
    define resourcemanager.miloapis.com/projects.delete: resourcemanager.miloapis.com/projects.delete from granted or resourcemanager.miloapis.com/projects.delete from parent
    define resourcemanager.miloapis.com/projects.get: resourcemanager.miloapis.com/projects.get from granted or resourcemanager.miloapis.com/projects.get from parent
    define resourcemanager.miloapis.com/projects.list: resourcemanager.miloapis.com/projects.list from granted or resourcemanager.miloapis.com/projects.list from parent
    define resourcemanager.miloapis.com/projects.update: resourcemanager.miloapis.com/projects.update from granted or resourcemanager.miloapis.com/projects.update from parent
```

## Creating Custom Roles

A set of tuples will be created for every Role to create a relationship between
the Role and each permission that's included. The relationship will be made
available to all users.

```yaml
tuples:
- object: iam.miloapis.com/Role:services/resourcemanager.miloapis.com/roles/projectAdmin
  relation: resourcemanager.miloapis.com/projects.list
  user: iam.miloapis.com/User:*
...
```

These relationships being available to all user's won't be used until the role
is bound to a specific user.

## Binding roles through policies

When an IAM policy is created for a resource, tuples are created to bind the
role binding to the resource and all of the members to the appropriate role.
These tuples will create the necessary relationships to grant a subject a
permission on a resource.

Below is an example of a role binding being created on an organization resource
to provide a user with the project admin role.

```yaml
tuples:
- object: resourcemanager.miloapis.com/Organization:organizations/example-org
  relation: iam.miloapis.com/RoleBinding
  user: iam.miloapis.com/RoleBinding:{{ role_binding_hash }}
- object: iam.miloapis.com/RoleBinding:{{ role_binding_hash }}
  relation: iam.miloapis.com/Role
  user: iam.miloapis.com/Role:services/resourcemanager.miloapis.com/roles/projectAdmin
- object: iam.miloapis.com/RoleBinding:{{ role_binding_hash }}
  relation: iam.miloapis.com/User
  user: iam.miloapis.com/User:project-admin@datum.net
```
