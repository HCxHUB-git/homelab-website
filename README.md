# HC x Hub — website source

A public, security-sanitized portfolio describing a real homelab built around Proxmox VE, Linux containers, Docker, TrueNAS-backed NFS storage, private remote access, DNS, reverse proxying, monitoring and scheduled backups.

This repository holds the static website source. The public [Homelab documentation](https://github.com/HCxHUB-git/Homelab) is maintained separately.

**Live website:** https://hcxhub-git.github.io/homelab-website/ — temporarily hosted on GitHub Pages until a separate host is ready.

## Highlights

- Compact Proxmox VE host with an Intel hybrid-core CPU, 32 GiB memory class and NVMe storage
- Multiple Linux service containers and multi-container application stacks
- Dedicated service boundaries for DNS/DHCP, VPN access, reverse proxying, media, private cloud, photo management and observability
- Banana Pi R4/OpenWrt edge with a verified 10 GbE SFP WAN path, subscriber VLAN 100, DHCP IPv4, NAT and a 10 GbE LAN uplink
- Pi-hole as the verified LAN DNS/DHCP authority; OpenWrt Wi-Fi disabled in favor of an external managed AP
- Owner-supplied physical map: UGREEN CM753 unmanaged switch downstream of OpenWrt, with Proxmox/GEEKOM, TrueNAS, a TP-Link Omada AP and other clients attached
- External TrueNAS appliance with a verified four-disk RAIDZ1 pool, NFS/SMB sharing, recursive snapshots, scrubs and scheduled SMART tests
- TrueNAS uses two verified 2.5 GbE interfaces in a host-side `LOADBALANCE` software bond; no 5 Gb/s single-client or switch-side aggregation claim is made
- Prometheus and Grafana with verified healthy storage and disk-health telemetry targets
- Daily compressed guest snapshots with a seven-generation retention policy
- Intel graphics passthrough for hardware-accelerated media transcoding

## Site

The static site is plain HTML and CSS with a tiny optional JavaScript enhancement (active-section highlighting). Architecture is shown as plain-text ASCII diagrams in `<pre>` blocks — no framework, Mermaid runtime or analytics. The in-page wordmark loads Sora from Google Fonts, with a system-font fallback.

The portfolio homepage (`index.html`) is the concise showcase; `docs/*.html` are generated technical deep-dives built from the Markdown sources in `docs/` by `.audit/build_docs.py` (private tooling, not published).

Preview the public-only build locally (never serve the repository root on a network; it contains private `.audit/` material):

```bash
cd ~/homelab-portfolio
python3 .audit/build_public.py
cd _site
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/`.

## Documentation

- [Architecture](docs/architecture.md)
- [Compute and services](docs/compute-and-services.md)
- [Storage and backup](docs/storage-and-backup.md)
- [Networking and security](docs/networking-and-security.md)
- [Operations and lessons](docs/operations-and-lessons.md)
- [Hardware and specifications](docs/hardware.md)
- [Verification and scope](docs/verification-and-scope.md)

## Publication policy

This public version excludes credentials, keys, cookies, tokens, internal addresses, MAC addresses, host identifiers, exact routes, certificate material, storage export paths and secret-bearing configuration. The raw read-only audit is stored under `.audit/` and is excluded from Git.

## Current limitations

- The portfolio does not claim policy-enforced LAN segmentation.
- The current router policy has a flat LAN without service VLANs; management listeners and password-based root SSH remain broader than necessary even though WAN input is now reject-by-default.
- Backup artifacts and recent job success were verified; a restore drill was not.
- No independent replication, cloud-sync or off-site recovery copy was configured at review time.
- The TrueNAS storage-network bond is verified on the appliance, but upstream switch behavior is not.
- TrueNAS dataset encryption and active UPS integration were not present at review time.
- Internet-side router exposure, downstream switch behavior and external AP/controller policy were not tested.

No infrastructure was changed during discovery.
