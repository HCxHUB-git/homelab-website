# Security policy for this portfolio

## Scope

This private repository contains static website source for future hosting. It does not contain deployable production credentials or direct access to the homelab.

## Disclosure rules

Do not commit:

- credentials, tokens, cookies, session data or `.env` files;
- SSH, VPN or certificate private keys;
- internal addresses, MAC addresses, hostnames or routes;
- storage export paths, filesystem identifiers or VM UUIDs;
- exact firewall, NAT or port-forwarding policy;
- unredacted system inventories or diagnostic bundles.

Raw discovery evidence belongs only in `.audit/`, which is ignored by Git.

## Reporting a problem

If a published file reveals sensitive infrastructure detail, remove it from the working tree and Git history before publishing another revision. Rotate any exposed credential; deleting it from the latest commit is not sufficient.
