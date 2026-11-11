# Narendra Software — .NET 10 Native Windows Solution

This directory houses the native Windows engineering workspace for Narendra Software, intentionally isolated from the JavaScript/TypeScript `pnpm` workspace.

## Target Platform

- **SDK**: .NET 10 LTS (`10.0.100`, pinned via `global.json`)
- **Primary Target**: Windows 10 / Windows 11 (x64 & arm64)
- **Solution**: `NarendraSoftware.slnx`

## Planned Native Applications

1. **Narendra Disk & USB Utility** (Planned)
   - Safe, verified bootable USB creation and disk diagnostic/formatting tool with explicit elevation boundaries and hardware safety confirmations.
2. **Narendra System Diagnostics** (Planned)
   - Lightweight native Windows inspection and environment verification utilities.

## Separation from `pnpm`

- `pnpm-workspace.yaml` only includes `apps/web/*` and `packages/*`.
- All `.NET` builds, restores, and tests are run exclusively with the `dotnet` CLI inside `dotnet/`.
- See `../docs/windows-architecture.md` for full architectural guidelines.
