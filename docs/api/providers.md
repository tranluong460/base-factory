# Provider API Reference

> Tài liệu tham khảo cho consumer sử dụng `@vitechgroup/base-factory`.

## Cài đặt

```bash
yarn add @vitechgroup/base-factory
```

## Import

```typescript
import {
  // Core
  LabsProviderFacade,

  // Enum
  EnumLabsProvider,

  // Types
  type IPayloadProvider,
  type ProviderTypeMap,
  type PayloadConfigMap,
  type IAutomatedProvider,
  type IScriptedProvider,
  type IDirectApiProvider,

  // Locales
  EN, VI, KO,
} from '@vitechgroup/base-factory'
```

---

## Sử dụng cơ bản

```typescript
const provider = await LabsProviderFacade.getProvider({
  type: EnumLabsProvider.AUTOMATED,
  keyTarget: 'target-id',
  logUpdate: async (payload) => {
    // Xử lý log từ provider (hiển thị UI, lưu DB, ...)
    console.log(payload.mess)
    return true
  },
  example: { example1: 'value', example2: 1 },
})

await provider.start()
```

---

## API

### `LabsProviderFacade.getProvider<T>(payload)`

Điểm vào duy nhất — tạo và trả về provider instance theo type.

```typescript
static async getProvider<T extends EnumLabsProvider>(
  payload: IPayloadProvider<T>
): Promise<ProviderTypeMap[T]>
```

**Luồng nội bộ**:
1. `LabsPluginLoader.loadPlugin(type)` — dynamic import provider module, gọi `register()`
2. `LabsProviderRegistry.getFactory(type)` — lấy factory đã đăng ký
3. `factory.create(payload)` — tạo provider instance

**Lỗi có thể xảy ra**:

| Lỗi | Nguyên nhân |
|---|---|
| `No register in {provider}` | Provider module không export hàm `register()` |
| `No factory registered for '{type}'` | Plugin chưa được load hoặc `register()` không được gọi |
| `Failed to load {provider}` | Dynamic import thất bại (thư mục provider không tồn tại) |

---

## Providers có sẵn

| Provider | Enum | Mô tả |
|---|---|---|
| Automated | `EnumLabsProvider.AUTOMATED` | Tự động hóa qua browser |
| Scripted | `EnumLabsProvider.SCRIPTED` | Thực thi theo script |
| Direct API | `EnumLabsProvider.DIRECT_API` | Gọi API trực tiếp |

Tất cả provider đều implement interface chung:

```typescript
interface IProvider {
  start(): Promise<void>
}
```

---

## Types

### `EnumLabsProvider`

```typescript
enum EnumLabsProvider {
  SCRIPTED = 'scripted',
  AUTOMATED = 'automated',
  DIRECT_API = 'direct_api',
}
```

### `IPayloadProvider<T>`

Payload truyền vào `getProvider()`. Bao gồm các field chung + config riêng theo provider type.

```typescript
type IPayloadProvider<T extends EnumLabsProvider> = {
  type: T                              // Loại provider
  keyTarget: string                    // ID đối tượng xử lý
  logUpdate: ITypeLogUpdate<'mkt_labs'> // Callback nhận log từ action
} & PayloadConfigMap[T]                // Config riêng theo provider type
```

### `PayloadConfigMap`

Config riêng cho từng provider type. Consumer truyền kèm trong payload.

```typescript
interface PayloadConfigMap {
  [EnumLabsProvider.SCRIPTED]:   { example: { example1: string, example2: number } }
  [EnumLabsProvider.AUTOMATED]:  { example: { example1: string, example2: number } }
  [EnumLabsProvider.DIRECT_API]: { example: { example1: string, example2: number } }
}
```

> **Lưu ý**: Hiện tại config của 3 provider giống nhau (placeholder). Khi provider phát triển thêm, mỗi entry sẽ có config riêng.

### `ProviderTypeMap`

Map từ enum → interface provider tương ứng. Đảm bảo type-safe khi gọi `getProvider()`.

```typescript
interface ProviderTypeMap {
  [EnumLabsProvider.SCRIPTED]:   IScriptedProvider
  [EnumLabsProvider.AUTOMATED]:  IAutomatedProvider
  [EnumLabsProvider.DIRECT_API]: IDirectApiProvider
}
```

### `ITypeLogUpdate<'mkt_labs'>`

Callback function mà consumer cung cấp để nhận log từ provider. Được gọi mỗi khi action thực hiện một bước.

```typescript
// Payload nhận được trong logUpdate callback
{
  action: string      // Action key, ví dụ: 'automated.action_example'
  key: string         // Bước hiện tại, ví dụ: 'start', 'end'
  mess: string        // Message đầy đủ, ví dụ: 'automated.action_example.start|target-id|123'
  success?: boolean   // Trạng thái thành công (nếu có)
  uidTarget: string   // keyTarget từ payload
}
```

---

## Log Message Format

Mỗi action gọi `logUpdate()` với format:

```
{action_key}.{step}|{keyTarget}|{param1}|{param2}|...
```

**Ví dụ**: `automated.action_example.start|target-id|123`

### Locale keys

Consumer sử dụng locale objects (`EN`, `VI`, `KO`) để dịch message sang ngôn ngữ tương ứng.

```typescript
import { EN, VI, KO } from '@vitechgroup/base-factory'

// Cấu trúc locale
EN.log_process_run.automated.action_example.start
// → "Start action example for automated {{1}} | Key target: {{0}}"
```

**Tham số trong locale**: `{{0}}` = `keyTarget`, `{{1}}`, `{{2}}`, ... = các params bổ sung.

### Locale có sẵn

| Ngôn ngữ | Import | File |
|---|---|---|
| English | `EN` | `src/locales/en.json` |
| Tiếng Việt | `VI` | `src/locales/vi.json` |
| 한국어 | `KO` | `src/locales/ko.json` |

---

## Ví dụ đầy đủ

### Sử dụng với log handler

```typescript
import { LabsProviderFacade, EnumLabsProvider, EN } from '@vitechgroup/base-factory'

// Hàm xử lý log — consumer tự định nghĩa
async function handleLog(payload: {
  action: string
  key: string
  mess: string
  success?: boolean
  uidTarget: string
}) {
  // Lấy template từ locale
  const keys = `${payload.action}.${payload.key}`.split('.')
  let template: any = EN.log_process_run
  for (const k of keys) {
    template = template?.[k]
  }

  // Thay thế tham số {{0}}, {{1}}, ...
  if (typeof template === 'string') {
    const params = payload.mess.split('|').slice(1) // bỏ action.key prefix
    let message = template
    params.forEach((p, i) => {
      message = message.replace(`{{${i}}}`, p)
    })
    console.log(`[${payload.uidTarget}] ${message}`)
  }

  return true
}

// Khởi tạo và chạy provider
const provider = await LabsProviderFacade.getProvider({
  type: EnumLabsProvider.AUTOMATED,
  keyTarget: 'user-123',
  logUpdate: handleLog,
  example: { example1: 'test', example2: 42 },
})

await provider.start()
// Output: [user-123] Start action example for automated 123 | Key target: user-123
// Output: [user-123] End action example for automated 456 | Key target: user-123
```

### Sử dụng nhiều provider

```typescript
const types = [
  EnumLabsProvider.AUTOMATED,
  EnumLabsProvider.SCRIPTED,
  EnumLabsProvider.DIRECT_API,
]

for (const type of types) {
  const provider = await LabsProviderFacade.getProvider({
    type,
    keyTarget: 'batch-target',
    logUpdate: handleLog,
    example: { example1: 'batch', example2: 0 },
  })
  await provider.start()
}
```
