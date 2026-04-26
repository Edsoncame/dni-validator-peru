/**
 * dni-validator-peru
 * Validación offline de DNI y RUC peruanos.
 *
 * Mantenido por Securex (https://securex.pe).
 */

/** Resultado estructurado de una validación. */
export interface ValidationResult {
  valid: boolean;
  type: 'DNI' | 'RUC' | null;
  value: string;
  error?: string;
}

/**
 * Valida formato + dígito verificador de un DNI peruano.
 *
 * Reglas SUNAT:
 * - 8 dígitos numéricos exactos.
 * - Sin dígito verificador en el DNI estándar (a diferencia del RUC).
 *   Si el documento incluye dígito de control (formato 8+1 = 9), se valida
 *   contra el módulo 11 para autocompletar correo SUNAT.
 *
 * @example
 * isValidDNI('47034508');     // true
 * isValidDNI('470345080');    // true (8+1, valida dígito de control)
 * isValidDNI('1234567');      // false (7 dígitos)
 * isValidDNI('12345678X');    // false (caracter no numérico)
 */
export function isValidDNI(input: string): boolean {
  return validateDNI(input).valid;
}

/** Versión que devuelve detalle del resultado. */
export function validateDNI(input: string): ValidationResult {
  const cleaned = String(input ?? '').trim();
  // El DNI puede ser 8 dígitos puros, o 8 dígitos + 1 dígito/letra de control (K)
  if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
    return { valid: true, type: 'DNI', value: cleaned };
  }
  if (cleaned.length === 9 && /^\d{8}[\dK]$/i.test(cleaned)) {
    const dni = cleaned.slice(0, 8);
    const checkDigit = cleaned.slice(8).toUpperCase();
    const expected = computeDNICheckDigit(dni);
    if (expected === checkDigit) {
      return { valid: true, type: 'DNI', value: dni };
    }
    return { valid: false, type: 'DNI', value: cleaned, error: `Dígito de control inválido (esperado ${expected})` };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, type: 'DNI', value: cleaned, error: 'Caracteres no numéricos' };
  }
  return { valid: false, type: 'DNI', value: cleaned, error: `Longitud inválida (${cleaned.length}, esperado 8 o 9)` };
}

/**
 * Calcula el dígito de control de un DNI usando el algoritmo módulo 11
 * publicado en el portal del MTPE / SUNAT (mismo algoritmo).
 *
 * Pesos: [3, 2, 7, 6, 5, 4, 3, 2] aplicados de izquierda a derecha.
 * Resultado: 11 - (suma % 11). Casos especiales: 11 → 0, 10 → 'K'.
 */
export function computeDNICheckDigit(dni8: string): string {
  if (!/^\d{8}$/.test(dni8)) {
    throw new Error('DNI debe ser 8 dígitos numéricos');
  }
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  const sum = dni8.split('').reduce((acc, c, i) => acc + parseInt(c, 10) * weights[i], 0);
  const mod = sum % 11;
  const v = 11 - mod;
  if (v === 11) return '0';
  if (v === 10) return 'K';
  return v.toString();
}

/**
 * Valida formato + dígito verificador de un RUC peruano.
 *
 * Reglas SUNAT:
 * - 11 dígitos numéricos exactos.
 * - Comienza con prefijo válido (10, 15, 16, 17, 20).
 * - Dígito 11 debe coincidir con el módulo-11 de los primeros 10.
 *
 * @example
 * isValidRUC('20603678524');  // true (Securex)
 * isValidRUC('10470345087');  // true (persona natural con negocio)
 * isValidRUC('21603678524');  // false (prefijo inválido)
 */
export function isValidRUC(input: string): boolean {
  return validateRUC(input).valid;
}

/** Versión que devuelve detalle del resultado. */
export function validateRUC(input: string): ValidationResult {
  const cleaned = String(input ?? '').trim();
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, type: 'RUC', value: cleaned, error: 'No numérico' };
  }
  if (cleaned.length !== 11) {
    return { valid: false, type: 'RUC', value: cleaned, error: `Longitud inválida (${cleaned.length}, esperado 11)` };
  }
  const validPrefixes = ['10', '15', '16', '17', '20'];
  const prefix = cleaned.slice(0, 2);
  if (!validPrefixes.includes(prefix)) {
    return { valid: false, type: 'RUC', value: cleaned, error: `Prefijo inválido (${prefix}, válidos: ${validPrefixes.join(', ')})` };
  }
  const expected = computeRUCCheckDigit(cleaned.slice(0, 10));
  const actual = cleaned[10];
  if (expected !== actual) {
    return { valid: false, type: 'RUC', value: cleaned, error: `Dígito verificador inválido (esperado ${expected}, recibido ${actual})` };
  }
  return { valid: true, type: 'RUC', value: cleaned };
}

/**
 * Calcula el dígito verificador de un RUC usando el algoritmo módulo 11 SUNAT.
 *
 * Pesos: [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] aplicados de izquierda a derecha.
 * Resultado: 11 - (suma % 11). Casos: 11 → 0, 10 → 1.
 */
export function computeRUCCheckDigit(ruc10: string): string {
  if (!/^\d{10}$/.test(ruc10)) {
    throw new Error('RUC base debe ser 10 dígitos numéricos');
  }
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = ruc10.split('').reduce((acc, c, i) => acc + parseInt(c, 10) * weights[i], 0);
  const mod = sum % 11;
  const v = 11 - mod;
  if (v === 11) return '0';
  if (v === 10) return '1';
  return v.toString();
}

/**
 * Detecta y valida automáticamente si un input es DNI o RUC.
 * Útil cuando recibís un número y no sabés cuál es.
 */
export function validateDocumento(input: string): ValidationResult {
  const cleaned = String(input ?? '').trim();
  if (cleaned.length === 8 || cleaned.length === 9) return validateDNI(cleaned);
  if (cleaned.length === 11) return validateRUC(cleaned);
  return { valid: false, type: null, value: cleaned, error: `Longitud ${cleaned.length} no es DNI (8/9) ni RUC (11)` };
}

/**
 * Determina el tipo de contribuyente desde el prefijo del RUC.
 * - 10: Persona natural sin negocio (DNI + dígito)
 * - 15: Empresa con sucursal del exterior
 * - 16: Empresa con sucursal del exterior (variante)
 * - 17: Persona natural domiciliada en el exterior con representante en Perú
 * - 20: Persona jurídica peruana
 */
export function tipoContribuyente(ruc: string): string | null {
  if (!isValidRUC(ruc)) return null;
  const prefix = ruc.slice(0, 2);
  const map: Record<string, string> = {
    '10': 'Persona natural con negocio',
    '15': 'Empresa con sucursal del exterior',
    '16': 'Empresa con sucursal del exterior',
    '17': 'Persona natural domiciliada en el exterior',
    '20': 'Persona jurídica',
  };
  return map[prefix] ?? null;
}

export const VERSION = '0.1.0';
