# dni-validator-peru

Offline validator for Peruvian DNI and RUC documents. TypeScript, ESM, no external dependencies, MIT.

## Installation

```bash
npm install dni-validator-peru
```

## Usage

```ts
import { isValidDNI, isValidRUC, validateDocumento, tipoContribuyente } from 'dni-validator-peru';

isValidDNI('72345678');           // true
isValidRUC('20602431216');        // true
tipoContribuyente('20602431216'); // 'juridica'

validateDocumento('72345678');    // { tipo: 'DNI', valid: true }
```

## API

| Function | Description |
|---|---|
| `isValidDNI(dni)` | Format check for Peruvian DNI. |
| `isValidRUC(ruc)` | Format check for Peruvian RUC. |
| `tipoContribuyente(ruc)` | Returns contribuyente type. |
| `validateDocumento(doc)` | Detects DNI vs RUC and returns unified result. |

## License

[MIT](LICENSE)
