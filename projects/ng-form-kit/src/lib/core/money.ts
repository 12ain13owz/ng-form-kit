import type { ValidatorFn } from '@angular/forms'

/**
 * Money is held in **minor units**, as an integer: satang for THB (฿12.50 → 1250), cents for USD,
 * whole yen for JPY. Never floats, so sums and splits stay exact.
 */
export type MinorUnits = number

/** Largest whole amount the field accepts (13 digits), well inside a safe integer in minor units. */
const MAX_INTEGER_DIGITS = 13

/** Digits after the decimal point for `currency` (2 for THB, 0 for JPY). */
export const minorDigits = (currency: string, locale: string): number =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits ?? 2

/** The currency's symbol in `locale`, e.g. `฿` for THB in `th-TH`. */
export const currencySymbol = (currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? currency

/**
 * Text for an amount: `1,234.50` (grouped, for display) or `1234.50` (`grouped: false`, for
 * editing). No currency symbol; the field shows it beside the number.
 */
export const formatMinorUnits = (
  value: MinorUnits,
  currency: string,
  locale: string,
  grouped = true
): string => {
  const digits = minorDigits(currency, locale)
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: grouped,
    numberingSystem: 'latn',
  }).format(value / 10 ** digits)
}

/** An amount with its symbol, for messages: `฿1,234.50`. */
export const formatMoney = (value: MinorUnits, currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    value / 10 ** minorDigits(currency, locale)
  )

/**
 * Cleans what the user typed so it can only become a valid amount: digits, one decimal point, at
 * most `digits` decimals, at most 13 whole digits, and a leading `-` only if `allowNegative`.
 * Thousands separators and spaces are dropped.
 */
export const sanitizeMoneyText = (text: string, digits: number, allowNegative: boolean): string => {
  const negative = allowNegative && text.trimStart().startsWith('-')
  const [whole = '', ...rest] = text.replace(/[^\d.]/g, '').split('.')
  const fraction = rest.join('')
  const wholeDigits = whole.slice(0, MAX_INTEGER_DIGITS)
  const withPoint =
    digits > 0 && text.includes('.') ? `${wholeDigits}.${fraction.slice(0, digits)}` : wholeDigits
  return (negative ? '-' : '') + withPoint
}

/** Minor units from cleaned text, or `null` when there is no number yet (`''`, `-`, `.`). */
export const parseMoneyText = (text: string, digits: number): MinorUnits | null => {
  if (!/\d/.test(text)) {
    return null
  }
  const negative = text.startsWith('-')
  const [whole = '0', fraction = ''] = text.replace('-', '').split('.')
  const units = Number(whole || '0') * 10 ** digits + Number(fraction.padEnd(digits, '0') || '0')
  return negative && units !== 0 ? -units : units
}

/**
 * Fails with `{ moneyMin: { min, actual, minText } }` when the amount is below `min` (minor units).
 * `minText` is the formatted amount (`฿1.00`) for the message. An empty value passes.
 */
export const moneyMin =
  (min: MinorUnits, currency = 'THB', locale = 'th-TH'): ValidatorFn =>
  (control) => {
    const value = control.value as MinorUnits | null
    return value !== null && value < min
      ? { moneyMin: { min, actual: value, minText: formatMoney(min, currency, locale) } }
      : null
  }

/**
 * Fails with `{ moneyMax: { max, actual, maxText } }` when the amount is above `max` (minor units).
 * An empty value passes.
 */
export const moneyMax =
  (max: MinorUnits, currency = 'THB', locale = 'th-TH'): ValidatorFn =>
  (control) => {
    const value = control.value as MinorUnits | null
    return value !== null && value > max
      ? { moneyMax: { max, actual: value, maxText: formatMoney(max, currency, locale) } }
      : null
  }
