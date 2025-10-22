# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@vitechgroup/base-factory` is a TypeScript library that implements a plugin-based provider system using the Factory, Registry, Facade, and Plugin Loader patterns. The library enables dynamic loading and execution of different provider types (Scripted, Automated, Direct API) through a unified interface.

## Build & Development Commands

```bash
# Development
yarn dev                 # Start Vite dev server
yarn build              # TypeScript compile + Vite build (outputs to dist/)
yarn test               # Run all tests once with Vitest
yarn test:watch         # Run tests in watch mode
yarn test:coverage      # Run tests with coverage report

# Code Quality
yarn lint               # ESLint with auto-fix
yarn format             # Prettier format src/**/*.{ts,tsx}
yarn flint              # Run format then lint (used by pre-commit hook)

# Release (runs tests, builds, generates changelog, and publishes)
yarn release
```

## Architecture Overview

This is a **plugin-based provider factory system** with the following core components:

### Core Patterns

1. **Facade Pattern** (`LabsProviderFacade`): Single entry point for creating providers
   - `getProvider<T>(payload)` - Returns type-safe provider instance

2. **Registry Pattern** (`LabsProviderRegistry`): Central registry mapping provider types to factories
   - Stores `Map<EnumLabsProvider, ILabsProviderFactory>`
   - Factories register themselves via `register(type, factory)`

3. **Plugin Loader** (`LabsPluginLoader`): Dynamic module loading
   - Dynamically imports `../providers/{providerId}/index.ts`
   - Calls exported `register()` function to register factory

4. **Factory Pattern**: Each provider has its own factory
   - `ScriptedFactory`, `AutomatedFactory`, `DirectApiFactory`
   - Each factory's `create()` method instantiates the provider

### Provider Flow

```
Client Code
    ↓
LabsProviderFacade.getProvider(payload)
    ↓
LabsPluginLoader.loadPlugin(payload.type)
    ↓ (dynamic import)
providers/{type}/index.ts → register()
    ↓
LabsProviderRegistry.register(type, factory)
    ↓
LabsProviderRegistry.getFactory(type).create(payload)
    ↓
Provider Instance (IScriptedProvider | IAutomatedProvider | IDirectApiProvider)
```

### Type Safety

The system uses TypeScript generics for compile-time type safety:

- `ProviderTypeMap`: Maps `EnumLabsProvider` to specific provider interfaces
- `PayloadConfigMap`: Maps `EnumLabsProvider` to specific payload configs
- `IPayloadProvider<T>`: Generic payload type combining provider type, logUpdate function, and config

Example:
```typescript
const provider = await LabsProviderFacade.getProvider({
  type: EnumLabsProvider.SCRIPTED,
  logUpdate: async (msg, type) => true,
  data: 'config data',
})
// TypeScript knows provider is IScriptedProvider
```

## Adding a New Provider

To add a new provider type (e.g., `'webhook'`):

1. Add enum value to `src/utils/enum.ts`:
   ```typescript
   export enum EnumLabsProvider {
     SCRIPTED = 'scripted',
     AUTOMATED = 'automated',
     DIRECT_API = 'direct_api',
     WEBHOOK = 'webhook', // ← Add this
   }
   ```

2. Update type maps in `src/interfaces/providers/types.ts`:
   ```typescript
   export interface ProviderTypeMap {
     [EnumLabsProvider.WEBHOOK]: IWebhookProvider // ← Add interface
   }

   export interface PayloadConfigMap {
     [EnumLabsProvider.WEBHOOK]: { webhookUrl: string } // ← Add config
   }

   export interface IWebhookProvider {
     start: () => Promise<void>
   }
   ```

3. Create provider folder: `src/providers/webhook/`
   - `provider.ts`: Provider implementation
   - `factory.ts`: Factory implementation
   - `index.ts`: Export `register()` function

4. Pattern for `index.ts`:
   ```typescript
   import { LabsProviderRegistry } from '../../core'
   import { EnumLabsProvider } from '../../utils'
   import { WebhookFactory } from './factory'

   export function register(): void {
     LabsProviderRegistry.register(EnumLabsProvider.WEBHOOK, new WebhookFactory())
   }
   ```

The plugin loader will automatically discover and load the provider when requested.

## Project Structure

```
src/
├── core/                       # Core management classes
│   ├── LabsProviderFacade.ts  # Main API entry point
│   ├── LabsProviderRegistry.ts # Factory registry
│   └── LabsPluginLoader.ts    # Dynamic module loader
│
├── interfaces/                 # TypeScript interfaces
│   └── providers/
│       ├── types.ts           # Provider interfaces & type maps
│       └── factory.ts         # Factory interface
│
├── providers/                  # Provider implementations
│   ├── automated/             # Browser automation provider
│   ├── scripted/              # Script execution provider
│   └── direct_api/            # Direct API provider
│   # Each provider folder has: provider.ts, factory.ts, index.ts
│
├── utils/
│   └── enum.ts               # EnumLabsProvider definition
│
└── locales/                   # i18n translations (EN, KO, VI)
```

## Testing

- Test files: `test/**/*.test.ts`
- Test setup: `test/setup.ts`
- Framework: Vitest with very long timeouts (999999ms) for integration tests
- Test pattern: Create providers via `LabsProviderFacade.getProvider()` and call methods

## Git Hooks

Pre-commit hook runs `yarn flint` (format + lint) and stages changes automatically.

## Build Output

- Target: Node 18+
- Formats: ESM (`dist/base-factory.js`) and CJS (`dist/base-factory.cjs`)
- Type declarations: `dist/base-factory.d.ts` (rolled up types)
- External dependencies: `@vitechgroup/*` packages and Node.js built-ins
- Dynamic imports are inlined in the output bundle

## Dependencies

- **Runtime**: None (zero runtime dependencies)
- **Dev**: Uses `@vitechgroup/mkt-elec-core` from GitHub (dev branch) for `CoreLogger` and `ITypeLogUpdate` types

## Key Implementation Notes

1. **Plugin Loading**: Each provider's `index.ts` must export a `register()` function that registers the factory with `LabsProviderRegistry`

2. **Type Casting**: Factories currently use type assertion (`as IPayloadProvider<EnumLabsProvider.SPECIFIC>`) due to generic factory interface accepting `IPayloadProvider<EnumLabsProvider>`

3. **Provider State**: Current providers only implement `start()` method - consider adding lifecycle methods (stop, pause, resume) and state management in future iterations

4. **Error Handling**: `LabsPluginLoader` logs errors via `CoreLogger` before rethrowing - ensure provider implementations handle errors appropriately

5. **No Caching**: Plugin loader re-imports modules on each call - consider adding cache to prevent duplicate registrations
