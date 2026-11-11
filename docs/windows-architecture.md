# Native Windows Application Architecture (.NET 10 LTS)

## Overview

Narendra Software's native Windows utilities (such as the planned **Windows Disk & USB Utility**) are engineered in C# on **.NET 10 LTS** inside `dotnet/NarendraSoftware.slnx`.

## Why Native .NET 10 Is Isolated from `pnpm`

- `pnpm-workspace.yaml` strictly scopes the JavaScript workspace to `apps/web/*` and `packages/*`.
- `dotnet/` has its own `global.json` SDK pin (`10.0.100`) and `.slnx` solution file.
- `pnpm` never invokes MSBuild or NuGet, and `dotnet` never traverses `node_modules`.

## Planned Application Principles

### 1. Explicit Privilege & Elevation Boundaries
- Inspection, drive enumeration, and ISO checksum verification run under standard user privileges whenever possible.
- Destructive disk operations (partitioning, formatting, boot sector writes) require explicit UAC elevation and a dedicated privileged worker or explicit confirmation boundary.

### 2. Hardware & Data Safety
- System/OS drives and fixed internal disks are guarded and excluded from accidental selection by default.
- Target drive identifiers, serial numbers, and capacity must be confirmed before any write operation begins.
- Cryptographic checksum verification (SHA-256) is a first-class step before flashing bootable media.

### 3. Planned Solution Structure (Future Milestone)

When implementation of the first Windows utility begins, projects will be added cleanly under `dotnet/src/` and `dotnet/tests/`:

```text
dotnet/
  global.json
  NarendraSoftware.slnx
  src/
    Narendra.DiskUtility.App/       # WinUI 3 / WPF desktop UI (future)
    Narendra.DiskUtility.Core/      # Drive inspection, ISO verification, formatting abstractions (future)
  tests/
    Narendra.DiskUtility.Core.Tests/
```

No empty placeholder `.csproj` projects are created until active feature development begins.
