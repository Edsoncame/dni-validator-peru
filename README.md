# dni-validator-peru

Validación offline de **DNI** y **RUC** peruanos con el algoritmo módulo-11 oficial de SUNAT.
Zero dependencies. TypeScript ESM. MIT.

Mantenido por [Securex](https://securex.pe), casa de cambio digital regulada por SBS en Perú.

## Por qué existe

Si construís cualquier flujo KYC en Perú, vas a necesitar validar DNI y RUC sin llamar a SUNAT en cada keystroke. Las dos opciones tradicionales:

1. **Llamar a SUNAT/RENIEC en cada validación** — lento, costoso, rate-limit, requiere convenio.
2. **Reescribir el algoritmo módulo-11 cada vez** — todos los devs peruanos hicimos esto al menos una vez. Y lo escribimos mal la primera vez.

Esta lib hace la opción 3: validación local instantánea con el algoritmo correcto. Después llamás a SUNAT solo cuando ya pasó la validación de checksum (ahorra ~80% de llamadas inútiles).

## Instalación

```bash
npm install dni-validator-peru
```

## Uso

```ts
import {
  isValidDNI,
  isValidRUC,
  validateDocumento,
  tipoContribuyente,
} from 'dni-validator-peru';

// DNI: 8 dígitos
isValidDNI('47034508');     // true
isValidDNI('1234567');      // false (7 dígitos)

// RUC: 11 dígitos con prefijo válido (10/15/16/17/20)
isValidRUC('20603678524');  // true
isValidRUC('21603678524');  // false (prefijo 21 inválido)

// Detección automática (cuando no sabés cuál es)
const r = validateDocumento('20603678524');
// → { valid: true, type: 'RUC', value: '20603678524' }

// Tipo de contribuyente desde el RUC
tipoContribuyente('20603678524');  // 'Persona jurídica'
tipoContribuyente('10470345087');  // 'Persona natural con negocio'
```

## API

### `isValidDNI(input: string): boolean`

Valida formato (8 dígitos numéricos exactos). Acepta también 9 dígitos donde el último es el dígito de control módulo-11.

### `isValidRUC(input: string): boolean`

Valida formato (11 dígitos), prefijo (10/15/16/17/20) y dígito verificador módulo-11.

### `validateDNI(input)` / `validateRUC(input): ValidationResult`

Versiones que devuelven detalle del error si la validación falla:

```ts
{ valid: false, type: 'RUC', value: '21603678524', error: 'Prefijo inválido (21, válidos: 10, 15, 16, 17, 20)' }
```

### `validateDocumento(input): ValidationResult`

Detecta el tipo (DNI vs RUC) por longitud y valida.

### `tipoContribuyente(ruc): string | null`

Devuelve descripción del tipo de contribuyente según el prefijo SUNAT:

| Prefijo | Tipo |
|---|---|
| 10 | Persona natural con negocio |
| 15 / 16 | Empresa con sucursal del exterior |
| 17 | Persona natural domiciliada en el exterior |
| 20 | Persona jurídica peruana |

### `computeDNICheckDigit(dni8) / computeRUCCheckDigit(ruc10)`

Acceso directo al algoritmo módulo-11 si necesitás generar dígitos verificadores (por ejemplo, autocompletar el campo "DNI con dígito" en correos formales SUNAT).

## Fuentes del algoritmo

- [SUNAT — Validación de RUC](https://www.sunat.gob.pe) (módulo 11)
- [Documentación oficial del algoritmo módulo-11 RENIEC](https://www.reniec.gob.pe)

Si encontrás un caso edge donde la lib se equivoque, abrí un issue con el documento real (anonimizado) y lo parchamos.

## Por qué Securex mantiene este repo

Securex valida miles de DNI y RUC al día durante onboarding KYC. Tener la validación local nos ahorra latencia y costo de llamadas a SUNAT. Liberar el wrapper como MIT es nuestro aporte al ecosistema.

Si necesitás cambiar dólares con TC competitivo y operación en feriados, [securex.pe](https://securex.pe) es nuestra app.

## Roadmap

- [x] v0.1: validación DNI y RUC con módulo-11
- [ ] v0.2: validación de carné de extranjería (CE) y pasaporte
- [ ] v0.3: detección de DNI/RUC en cadenas largas (regex match con confianza)
- [ ] v0.4: validación de placas vehiculares peruanas
- [ ] v0.5: paridad en Python

## Licencia

[MIT](LICENSE) © Edson Camé / Securex 2026
