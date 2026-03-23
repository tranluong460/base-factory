# @vitechgroup/base-factory

> Plugin-based provider system for VitechGroup, built on a Factory / Registry / Facade pattern.

<!-- [![npm version](https://img.shields.io/npm/v/@vitechgroup/base-factory)](https://www.npmjs.com/package/@vitechgroup/base-factory) -->
<!-- [![build status](https://img.shields.io/github/actions/workflow/status/VitechGroup/base-factory/ci.yml)](https://github.com/VitechGroup/base-factory/actions) -->

## Features

- **Provider pattern** -- register, resolve, and run providers through `LabsProviderFacade`
- **Three built-in providers** -- Automated, Scripted, and Direct API
- **Dual output** -- ESM and CJS builds via Vite lib mode
- **HTTP utilities** -- Axios-based client with HTTP/HTTPS/SOCKS proxy support
- **i18n ready** -- English, Vietnamese, and Korean locale bundles included

## Prerequisites

| Tool    | Version  |
| ------- | -------- |
| Node.js | >= 20    |
| Yarn    | 1.22.22  |

## Getting Started

### Installation

```bash
yarn install
```

### Build

```bash
yarn build        # TypeScript check + Vite build
```

The build outputs to `dist/` with both ESM (`base-factory.js`) and CJS (`base-factory.cjs`) entry points plus type declarations.

### Development

```bash
yarn dev           # Vite dev server
yarn typecheck     # tsc --noEmit
```

## Quick Start

```typescript
import { LabsProviderFacade, EnumLabsProvider } from '@vitechgroup/base-factory'

const provider = await LabsProviderFacade.getProvider({
  keyTarget: 'target-id',
  type: EnumLabsProvider.AUTOMATED,
  logUpdate: async (payload) => {
    console.log(payload)
    return true
  },
  example: { example1: 'value', example2: 1 },
})

await provider.start()
```

### Available Providers

| Provider   | Enum value                    | Description      |
| ---------- | ----------------------------- | ---------------- |
| Automated  | `EnumLabsProvider.AUTOMATED`  | Browser-driven   |
| Scripted   | `EnumLabsProvider.SCRIPTED`   | Script-based     |
| Direct API | `EnumLabsProvider.DIRECT_API` | Direct API calls |

## Project Structure

```
src/
├── index.ts                       # Public API barrel
├── core/                          # LabsPluginLoader, LabsProviderRegistry, LabsProviderFacade
├── interfaces/providers/          # ILabsProviderFactory, IPayloadProvider, ProviderTypeMap
├── providers/
│   ├── shared/base.ts             # LabsBaseClass (shared base for all actions)
│   ├── automated/                 # factory, provider, services/actions
│   ├── scripted/                  # same structure
│   └── direct_api/                # same structure
├── utils/
│   ├── enum.ts                    # EnumLabsProvider
│   └── private/http/              # HttpClient, proxy, fingerprint (internal)
└── locales/                       # en.json, vi.json, ko.json
```

## Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `dev`           | Start Vite dev server                   |
| `build`         | Type-check then build with Vite         |
| `typecheck`     | Run `tsc --noEmit`                      |
| `lint`          | Lint and auto-fix with ESLint           |
| `lint:check`    | Lint without fixing                     |
| `format`        | Format source files with Prettier       |
| `format:check`  | Check formatting without writing        |
| `flint`         | Run format then lint in sequence        |
| `test`          | Run Vitest (single run)                 |
| `test:watch`    | Run Vitest in watch mode                |
| `test:coverage` | Run tests with V8 coverage              |
| `test:ui`       | Open Vitest UI                          |
| `release`       | Test, build, then release via changelogen |
| `clean`         | Remove `dist/` and Vite cache           |
| `nuke`          | Remove `node_modules/` and `dist/`, reinstall |

## Testing

```bash
yarn test              # Single run
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
yarn test:ui           # Interactive UI
```

## Documentation

- [Developer Onboarding Guide](docs/guides/developer-onboarding.md) — Hướng dẫn cho developer mới
- [Provider API Reference](docs/api/providers.md) — Tài liệu API cho consumer

## License

[MIT](LICENSE)
