---
title: 'Authenticating'
description: 'Authenticating with the Datum Cloud API.'
order: 2
---

The Datum Cloud platform supports users authenticating with the API with
short-lived Bearer tokens. Bearer tokens can be created by creating a Personal
Access Token in the Datum Cloud Portal and using the
`https://api.datum.net/datum-os/oauth/token/exchange` API endpoint to exchange
the Personal Access Token for a short-lived bearer token.

```shell
▶ curl https://api.datum.net/datum-os/oauth/token/exchange \
   -H "Authorization: Bearer $PAT" -sS | jq
{
  "access_token": "[[redacted]]",
  "token_type": "Bearer"
}
```

Use the returned API token to authenticate with the [Datum Cloud control
planes](./connecting-to-the-api.md). The token should be refreshed every hour.

{{% alert title="Tip" color="info" %}}
Use `datumctl auth get-token` command to quickly grab a short-lived
access token that can be used to authenticate with the Datum Cloud API.
{{% /alert %}}

## Authentication Errors

Invalid authentication tokens or unauthorized requests will result in the same
**403 Forbidden** error.

```
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "forbidden: User \"system:anonymous\" cannot get path \"/openapi/v3\"",
  "reason": "Forbidden",
  "details": {},
  "code": 403
}
```
