# Storage and backup

## Storage model

The lab uses two storage tiers with different responsibilities.

### Local NVMe

The Proxmox host uses NVMe-backed local storage for:

- the hypervisor system filesystem;
- swap and EFI partitions;
- an LVM-thin pool for local LXC and VM disks.

Local storage minimizes latency and keeps core compute available without making every guest root dependent on the network.

### TrueNAS and ZFS

A separate TrueNAS SCALE appliance provides shared storage. Read-only API discovery verified:

- one healthy, online ZFS pool;
- one four-disk RAIDZ1 data vdev built from 8 TB-class HDDs;
- a separate SSD system device;
- LZ4 dataset compression;
- no pool read, write or checksum errors in the observed topology;
- a completed scrub with zero reported errors;
- NFS and SMB services running;
- node and SMART exporters running for external monitoring.

The ZFS datasets support media, private-cloud data, photo-library data, selected virtual disks and Proxmox backup archives. Dataset names, paths, disk models, serial numbers and stable identifiers are intentionally excluded.

The datasets were not encrypted at rest at review time. This is documented as a security characteristic rather than hidden behind a generic storage claim.

## Why ZFS

The storage requirements were: integrity of personal data over years, point-in-time rollback, one pool managed as a unit, and operational visibility into disk and pool health. ZFS was chosen because it answers those requirements in one layer rather than across separate tools:

- **End-to-end checksumming** detects and, where redundancy allows, repairs silent corruption; scrubs turn that into periodic verified evidence.
- **Snapshots** are cheap, consistent and integrated — the daily recursive policy below is a ZFS-native feature, not a bolt-on script.
- **Integrated pool management** means capacity, redundancy and health are observable from one place and feed the monitoring stack.
- **Compression (LZ4)** reduces physical writes and capacity pressure with negligible overhead on this hardware class.
- **RAIDZ** provides parity-based redundancy without a separate hardware controller.

**Trade-offs:** ZFS wants memory and stable power; a pool is not portable like a plain filesystem; and none of this replaces backups — see Recovery boundaries.

## Why RAIDZ1

With four disks, RAIDZ1 tolerates a single disk failure while keeping three disks' worth of usable capacity. Higher-parity layouts (RAIDZ2/3) would trade meaningful capacity for redundancy this environment does not currently require; mirroring would halve usable capacity.

**RAID IS NOT BACKUP.** RAIDZ1 improves availability against a disk failure. It does not protect against accidental deletion, corruption of live data, ransomware, controller/pool loss or site-level events. Snapshots cover some logical errors with rollback points; backups cover different failure scenarios entirely. The three mechanisms are documented separately below for that reason.

## Snapshots, scrubs and SMART — operational roles

- **Snapshots** are the short-term recovery layer: rollback points for accidental changes or deletions in supported scenarios. Configured as a daily recursive task with four-week retention.
- **Scrubs** are periodic ZFS integrity verification: they read the pool against its checksums so latent corruption is found by the system, not by a user.
- **SMART tests** are drive-health monitoring: weekly short and quarterly long tests across all disks surface degrading hardware before it becomes a pool event.

Each mechanism is scheduled on the appliance and observed through monitoring; none of them is treated as sufficient on its own.

## Data protection policy

TrueNAS had an enabled recursive snapshot task with:

- daily execution;
- four-week retention;
- hundreds of snapshot records present at review time.

Storage maintenance was also configured:

- periodic ZFS scrub task;
- weekly short SMART tests across all disks;
- quarterly long SMART tests across all disks.

The observed pool was online and the last scrub completed without errors. This is evidence of current maintenance state, not a guarantee of future disk health.

## Network storage path

The appliance uses two active 2.5 GbE physical links joined in a software load-balancing bond. That supplies the storage path used by NFS and SMB.

The upstream switch configuration was not inspected. Compatibility, traffic distribution and failover behavior of the load-balancing bond therefore remain review items rather than assumed capabilities.

## Why shared data is separate

Media and personal-data collections grow differently from an operating-system root. Separating them provides:

- clearer capacity ownership;
- simpler service rebuilds;
- a consistent data path for more than one consumer;
- fewer large application datasets inside guest backups.

The trade-off is an explicit runtime dependency on the NAS and network. Monitoring a process alone is insufficient; mount availability, pool state and disk-health telemetry must also be checked.

## Proxmox guest-backup policy

A Proxmox backup job was verified with these properties:

```yaml
mode: snapshot
frequency: daily
compression: zstd
scope: active_linux_service_guests
retention:
  keep_last: 7
destination: nfs_backup_storage
```

The discovery audit verified backup artifacts, retained generations and successful recent task history.

The Vaultwarden guest is now included in this daily job. Its Docker Compose data directory, including the SQLite database, resides inside the guest root, so it is in the guest-backup scope; an initial archive was created and observed. That initial archive predates any verified user enrollment. An application-aware restore of real vault data and independent/off-site protection are still outstanding.

## Recovery boundaries

The TrueNAS API confirmed that no replication, cloud-sync or rsync tasks were configured at review time. No active UPS service was observed. Consequently:

- application-consistent database coordination was not verified;
- restore completion and boot validation were not tested;
- NFS-mounted datasets are not automatically covered by every guest archive;
- primary data and backup archives share the TrueNAS failure domain;
- no independent off-site, offline or immutable copy was verified;
- power-loss resilience beyond normal ZFS behavior was not verified.

The next recovery milestones are a documented restore drill, an independent backup copy and a reviewed power-protection strategy.
