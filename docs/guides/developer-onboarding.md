# Developer Onboarding: @vitechgroup/base-factory

## 1. Tổng quan dự án

`@vitechgroup/base-factory` là một thư viện module (library) cung cấp **Provider Pattern** cho các dự án của VitechGroup. Thư viện cho phép consumer chọn và sử dụng các provider khác nhau (Automated, Scripted, Direct API) thông qua một Facade duy nhất, giúp tách biệt logic xử lý theo kiểu provider mà không ảnh hưởng đến code gọi.

**Vấn đề giải quyết**: Thay vì viết logic riêng cho từng kiểu provider trong mỗi dự án, `base-factory` cung cấp một kiến trúc chuẩn (Factory + Registry + Facade) để các dự án downstream chỉ cần gọi `LabsProviderFacade.getProvider()` và nhận về provider tương ứng.

**Tech stack**: TypeScript strict, Vite (ESM + CJS dual output), Vitest, ESLint (@antfu), Prettier, Commitlint + Husky.

---

## 2. Bắt đầu

### Yêu cầu hệ thống

- Node.js >= 20
- Yarn 1.22.22 (`corepack enable && corepack prepare yarn@1.22.22`)
- Git (hỗ trợ submodule)

### Cài đặt và chạy

```bash
# Clone repo (bao gồm submodule)
git clone --recurse-submodules <repo-url>
cd base-factory

# Cài đặt dependencies
yarn install

# Build
npm run build        # tsc + vite build -> dist/

# Chạy test
yarn test

# Dev mode (Vite dev server)
npm run dev
```

---

## 3. Cấu trúc dự án

```
src/
├── core/                          # Lớp lõi của thư viện
│   ├── LabsProviderFacade.ts      # Điểm vào duy nhất (Facade)
│   ├── LabsPluginLoader.ts        # Dynamic import provider theo ID
│   └── LabsProviderRegistry.ts    # Map lưu các factory đã đăng ký
│
├── interfaces/                    # Type definitions
│   └── providers/
│       ├── factory.ts             # ILabsProviderFactory interface
│       └── types.ts               # IPayloadProvider, ProviderTypeMap, PayloadConfigMap
│
├── providers/                     # Các provider cụ thể
│   ├── automated/                 # Provider: Automated (reference implementation)
│   │   ├── index.ts               # register() - đăng ký factory vào Registry
│   │   ├── factory.ts             # AutomatedFactory implements ILabsProviderFactory
│   │   ├── provider.ts            # AutomatedProvider implements IAutomatedProvider
│   │   └── services/
│   │       └── actions/
│   │           └── action-example.ts  # Action cụ thể, kế thừa LabsBaseClass
│   ├── scripted/                  # Provider: Scripted (cấu trúc tương tự)
│   ├── direct_api/                # Provider: Direct API (cấu trúc tương tự)
│   └── shared/
│       └── base.ts                # LabsBaseClass - base class cho mọi action
│
├── locales/                       # Đa ngôn ngữ (EN, VI, KO)
│   ├── en.json
│   ├── vi.json
│   └── ko.json
│
├── utils/
│   ├── enum.ts                    # EnumLabsProvider (SCRIPTED, AUTOMATED, DIRECT_API)
│   └── private/http/              # HTTP client, proxy, fingerprint (nội bộ)
│
└── index.ts                       # Public API - re-export core, interfaces, locales, utils
```

---

## 4. Kiến trúc - Provider Pattern

Luồng dữ liệu khi consumer gọi `getProvider()`:

```
Consumer
  │
  ▼
LabsProviderFacade.getProvider(payload)
  │
  ├──► LabsPluginLoader.loadPlugin(type)
  │       │
  │       └──► dynamic import(`../providers/${type}/index.ts`)
  │              │
  │              └──► register()  →  LabsProviderRegistry.register(type, factory)
  │
  └──► LabsProviderRegistry.getFactory(type)
          │
          └──► factory.create(payload)  →  Provider instance
                                              │
                                              └──► provider.start()
                                                      │
                                                      └──► action.start()  (logic thực thi)
```

**3 thành phần chính**:

| Thành phần | Class | Vai trò |
|---|---|---|
| **Registry** | `LabsProviderRegistry` | Lưu trữ Map<type, factory>. Mỗi provider tự đăng ký vào đây. |
| **Plugin Loader** | `LabsPluginLoader` | Dynamic import provider theo `EnumLabsProvider`, gọi `register()`. |
| **Facade** | `LabsProviderFacade` | Điểm vào duy nhất. Gọi Loader -> lấy Factory từ Registry -> tạo Provider. |

---

## 5. Thêm một Provider mới (Quan trọng nhất)

Ví dụ: thêm provider `custom` mới.

### Bước 1: Thêm enum

Trong `src/utils/enum.ts`, thêm giá trị mới:

```typescript
export enum EnumLabsProvider {
  SCRIPTED = 'scripted',
  AUTOMATED = 'automated',
  DIRECT_API = 'direct_api',
  CUSTOM = 'custom',              // <-- Thêm dòng này
}
```

### Bước 2: Thêm interface

Trong `src/interfaces/providers/types.ts`:

```typescript
// Thêm interface mới
export interface ICustomProvider {
  start: () => Promise<void>
}

// Cập nhật ProviderTypeMap
export interface ProviderTypeMap {
  // ... các entry cũ
  [EnumLabsProvider.CUSTOM]: ICustomProvider
}

// Cập nhật PayloadConfigMap
export interface PayloadConfigMap {
  // ... các entry cũ
  [EnumLabsProvider.CUSTOM]: { customConfig: { apiKey: string } }
}
```

Cập nhật `ILabsProviderFactory` trong `factory.ts` để return type bao gồm `ICustomProvider`.

### Bước 3: Tạo thư mục provider

Tạo cấu trúc thư mục theo chuẩn:

```
src/providers/custom/
├── index.ts                       # register()
├── factory.ts                     # CustomFactory
├── provider.ts                    # CustomProvider
└── services/
    ├── index.ts                   # re-export actions
    └── actions/
        ├── index.ts               # re-export từng action
        └── action-example.ts      # Action cụ thể
```

### Bước 4: Viết các file

**`src/providers/custom/index.ts`** - Đăng ký factory:

```typescript
import { LabsProviderRegistry } from '../../core/LabsProviderRegistry'
import { EnumLabsProvider } from '../../utils'
import { CustomFactory } from './factory'

export function register(): void {
  LabsProviderRegistry.register(EnumLabsProvider.CUSTOM, new CustomFactory())
}
```

**`src/providers/custom/factory.ts`** - Tạo provider từ payload:

```typescript
import type { ICustomProvider, ILabsProviderFactory, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { CustomProvider } from './provider'

export class CustomFactory implements ILabsProviderFactory {
  create(payload: IPayloadProvider<EnumLabsProvider>): ICustomProvider {
    return new CustomProvider(payload as IPayloadProvider<EnumLabsProvider.CUSTOM>)
  }
}
```

**`src/providers/custom/provider.ts`** - Khởi tạo và chạy các action:

```typescript
import type { ICustomProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { ActionExample } from './services'

export class CustomProvider implements ICustomProvider {
  private actionExample: ActionExample

  constructor(private payload: IPayloadProvider<EnumLabsProvider.CUSTOM>) {
    this.actionExample = new ActionExample(this.payload)
  }

  public async start(): Promise<void> {
    await this.actionExample.start()
  }
}
```

**`src/providers/custom/services/actions/action-example.ts`** - Logic thực thi:

```typescript
import type { IPayloadProvider } from '../../../../interfaces'
import type { EnumLabsProvider } from '../../../../utils'
import { LabsBaseClass } from '../../../shared'

export class ActionExample extends LabsBaseClass {
  constructor(payload: IPayloadProvider<EnumLabsProvider.CUSTOM>) {
    super(payload, 'custom.action_example')
  }

  public async start(): Promise<void> {
    await this.logUpdate('start', [123])
    // Logic chính ở đây
    await this.logUpdate('end', [456])
  }
}
```

### Bước 5: Thêm locale

Trong mỗi file locale (`en.json`, `vi.json`, `ko.json`), thêm key tương ứng:

```json
{
  "log_process_run": {
    "custom": {
      "action_example": {
        "start": "Start action example for custom {{1}} | Key target: {{0}}",
        "end": "End action example for custom {{1}} | Key target: {{0}}"
      }
    }
  }
}
```

### Bước 6: Viết test

Trong `test/provider.test.ts`:

```typescript
it('cUSTOM', async () => {
  const provider = await LabsProviderFacade.getProvider({
    keyTarget: '0367370371',
    type: EnumLabsProvider.CUSTOM,
    logUpdate,
    customConfig: { apiKey: 'test-key' },
  })
  await provider.start()
})
```

---

## 6. Thêm một Action mới vào Provider đã có

Ví dụ: thêm `ActionLogin` vào provider `automated`.

1. Tạo file `src/providers/automated/services/actions/action-login.ts`:

```typescript
import type { IPayloadProvider } from '../../../../interfaces'
import type { EnumLabsProvider } from '../../../../utils'
import { LabsBaseClass } from '../../../shared'

export class ActionLogin extends LabsBaseClass {
  constructor(payload: IPayloadProvider<EnumLabsProvider.AUTOMATED>) {
    super(payload, 'automated.action_login')
  }

  public async start(): Promise<void> {
    await this.logUpdate('start')
    // Logic login
    await this.logUpdate('end')
  }
}
```

2. Export trong `src/providers/automated/services/actions/index.ts`:

```typescript
export * from './action-example'
export * from './action-login'
```

3. Sử dụng trong `provider.ts`:

```typescript
import { ActionExample, ActionLogin } from './services'

export class AutomatedProvider implements IAutomatedProvider {
  private actionExample: ActionExample
  private actionLogin: ActionLogin

  constructor(private payload: IPayloadProvider<EnumLabsProvider.AUTOMATED>) {
    this.actionExample = new ActionExample(this.payload)
    this.actionLogin = new ActionLogin(this.payload)
  }

  public async start(): Promise<void> {
    await this.actionLogin.start()
    await this.actionExample.start()
  }
}
```

4. Thêm locale key `automated.action_login` vào các file JSON.

---

## 7. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Thư mục provider | snake_case (theo enum value) | `direct_api/`, `automated/` |
| Thư mục khác | kebab-case | `services/`, `actions/` |
| File TypeScript | kebab-case | `action-example.ts`, `tls-config.ts` |
| Class | PascalCase | `AutomatedProvider`, `LabsBaseClass` |
| Interface | `I` prefix + PascalCase | `IAutomatedProvider`, `IPayloadProvider` |
| Enum | `Enum` prefix + PascalCase | `EnumLabsProvider` |
| Enum value | UPPER_SNAKE_CASE | `DIRECT_API`, `AUTOMATED` |
| Action key (logUpdate) | `provider.action_name` | `'automated.action_example'` |

---

## 8. Tiêu chuẩn code

- **TypeScript strict mode** — Không tắt bất kỳ strict option nào
- **Không dùng `any`** — Sử dụng `unknown` + type narrowing nếu cần
- **Không dùng `console.log`** — Sử dụng `CoreLogger` hoặc `logUpdate`
- **Error handling** — Mỗi async function phải có try/catch hoặc để error propagate có chủ đích
- **Barrel exports** — Mỗi thư mục có `index.ts` để re-export
- **Lint trước khi commit** — Husky tự động chạy `prettier --write` và `eslint --fix`

---

## 9. Các script có sẵn

| Script | Lệnh | Mô tả |
|---|---|---|
| `dev` | `npm run dev` | Chạy Vite dev server |
| `build` | `npm run build` | tsc + vite build (ESM + CJS output) |
| `typecheck` | `npm run typecheck` | Kiểm tra type (`tsc --noEmit`) |
| `lint` | `npm run lint` | ESLint --fix |
| `lint:check` | `npm run lint:check` | ESLint chỉ kiểm tra, không fix |
| `format` | `npm run format` | Prettier --write |
| `format:check` | `npm run format:check` | Prettier chỉ kiểm tra |
| `flint` | `npm run flint` | Format + Lint (chạy cả hai) |
| `test` | `yarn test` | Vitest chạy 1 lần |
| `test:watch` | `npm run test:watch` | Vitest watch mode |
| `test:coverage` | `npm run test:coverage` | Vitest với coverage |
| `test:ui` | `npm run test:ui` | Vitest UI |
| `release` | `npm run release` | Test + Build + Changelogen + Push |
| `clean` | `npm run clean` | Xóa dist và cache |
| `nuke` | `npm run nuke` | Xóa node_modules + dist, cài lại |
| `submodule` | `npm run submodule` | Cập nhật git submodule |

---

## 10. Testing

Test được viết trong thư mục `test/` và chạy bằng Vitest.

```bash
yarn test                  # Chạy tất cả test
npm run test:watch         # Watch mode
npm run test:coverage      # Báo cáo coverage
```

File `test/setup.ts` chạy `beforeAll`/`afterAll` cho toàn bộ test suite (cấu hình trong `vite.config.ts` > `test.setupFiles`).

Khi viết test cho provider, pattern chuẩn:

```typescript
import { describe, it } from 'vitest'
import { EnumLabsProvider, LabsProviderFacade } from '../src'

describe('provider', () => {
  it('tên_provider', async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: 'test-target',
      type: EnumLabsProvider.AUTOMATED,
      logUpdate: async (payload) => { console.warn('logUpdate', payload); return true },
      example: { example1: 'value', example2: 1 },
    })
    await provider.start()
  })
})
```

---

## 11. Git Workflow

### Đặt tên branch

- Feature: `feat/tên-feature`
- Fix: `fix/tên-bug`
- Chore: `chore/mô-tả`

### Commit messages

Dự án sử dụng **Conventional Commits** (enforced bởi `@commitlint/config-conventional`):

```
feat: add custom provider
fix: resolve registry lookup error
chore: update dependencies
docs: add onboarding guide
refactor: simplify plugin loader
test: add coverage for direct-api provider
```

### Pre-commit hook (Husky + lint-staged)

Mỗi khi commit, tự động chạy:
1. `prettier --write` trên các file `*.ts`, `*.tsx`
2. `eslint --fix` trên các file `*.ts`, `*.tsx`
3. `prettier --write` trên các file `*.json`, `*.md`, `*.yml`, `*.yaml`

### Kiểm tra trước khi tạo PR

```bash
npm run flint          # Format + Lint
npm run typecheck      # Type check
yarn test              # Test
```

---

## 12. Đa ngôn ngữ (i18n)

Locale files nằm tại `src/locales/` với 3 ngôn ngữ: `en.json`, `vi.json`, `ko.json`.

**Cấu trúc key**: `log_process_run.{provider}.{action}.{step}`

**Tham số**: Sử dụng `{{0}}`, `{{1}}`, ... tương ứng với các params truyền vào `logUpdate()`.

Ví dụ trong `vi.json`:

```json
{
  "log_process_run": {
    "automated": {
      "action_example": {
        "start": "Bắt đầu thực hiện action example cho automated {{1}} | Key target: {{0}}",
        "end": "Kết thúc thực hiện action example cho automated {{1}} | Key target: {{0}}"
      }
    }
  }
}
```

Khi thêm action hoặc provider mới, **bắt buộc** cập nhật cả 3 file locale.

Locale được export qua public API (`import { EN, VI, KO } from '@vitechgroup/base-factory'`) để consumer sử dụng cho hiển thị log.
