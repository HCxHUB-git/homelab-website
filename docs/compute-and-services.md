# Compute and services

## Virtualization inventory

The verified management-plane inventory contained:

- one Proxmox VE node;
- multiple Linux service containers, with the active set reconciled against management-plane inventory;
- an additional virtual machine, stopped during discovery;
- multi-container application stacks distributed across dedicated Linux guests.

The public inventory uses service roles rather than internal guest IDs or addresses.

## Service map

| Service boundary | Runtime | Main components | State dependency | Verified health layer |
|---|---|---|---|---|
| Media automation | Docker | Jellyseerr, Recyclarr, Sonarr, Radarr, Prowlarr, Bazarr, qBittorrent, Gluetun, FlareSolverr, changedetection | NFS media | All active containers running; Gluetun healthy |
| Media server | Native systemd service | Jellyfin with Intel QSV | NFS media | Service active; HTTP health endpoint returned success |
| Private cloud | Docker | Nextcloud, MariaDB, Redis | NFS application data | Stack running; status endpoint returned success |
| DNS and DHCP | Native systemd service | Pi-hole FTL | Local SQLite databases | Service active; DNS and DHCP listeners observed |
| Remote access | Native systemd service | WireGuard | Local configuration | Interface present and active at review time |
| Service portal | Docker | Homarr | Local application data | Current container running |
| Monitoring | Docker | Prometheus, Grafana | Local metric data | Configured Prometheus targets healthy; Grafana database OK |
| HTTP ingress | Docker | Nginx Proxy Manager | Local proxy configuration | Container running; HTTP listener responded |
| Photo management | Docker | Immich server, PostgreSQL, Valkey, machine-learning worker | NFS photo library | All application components reported healthy; API ping succeeded |
| Password vault | Docker Compose | Vaultwarden with SQLite | Persistent data on the guest's local root disk; included in Proxmox guest backup | Container running; HTTPS through LAN proxy and `/alive` returned success; account enrollment not yet verified |
| Automation agent | Native services | Hermes Agent and an SSH tunnel service | Local agent state | Guest running; no failed systemd units observed |

## Why LXC and Docker are both used

LXC creates an operating-system boundary with explicit CPU, memory, filesystem and boot behavior. Docker then provides application-level composition where a workload naturally consists of several components.

This produces two useful scales of isolation:

- **LXC boundary:** limits the operational blast radius of a service domain.
- **Docker boundary:** keeps application components replaceable and independently observable.

Native services are used when direct host-device integration or a small single-purpose appliance is clearer than another container layer. Jellyfin, Pi-hole and WireGuard are examples.

The password vault uses a dedicated unprivileged LXC, but nested Docker required an explicit AppArmor exception on that guest and a container-scoped AppArmor exception. This weakens that boundary; it is not a blanket configuration for the service fleet. The application data is local to the guest rather than on an NFS mount. Initial guest-backup creation was verified, but vault-data restore and post-enrollment backup recovery have not been tested.

## Hardware acceleration

The media server receives the Intel render device rather than broad host-device access. A Proxmox pre-start hook corrects device ownership before the guest starts. This solves a common reboot failure mode: the configuration may be valid while the device permissions are not.

The design principle is that reboot recovery must be deterministic. A manual permission fix is not considered a stable deployment.

## Resource posture observed during discovery

CPU and memory pressure were low across the running guests. Filesystem headroom was the more relevant constraint:

- the monitoring appliance was above 80% root usage;
- the DNS appliance was at 80%, largely because a SQLite history database retained free pages internally;
- the media-automation appliance was in the mid-70% range.

These values are operational observations, not public endpoints or credentials. They are documented because capacity management is part of service ownership.
