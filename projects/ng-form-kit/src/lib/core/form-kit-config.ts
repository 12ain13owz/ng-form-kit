import { InjectionToken, makeEnvironmentProviders } from '@angular/core'
import type { EnvironmentProviders, Signal } from '@angular/core'

/**
 * Turns one validation error into the text shown under a field.
 *
 * `key` is the validator's error key (`required`, `minlength`, …) and `value` is what the
 * validator returned for it (Angular's error object, or a string set with `withMessage`).
 */
export type ErrorMessageFn = (key: string, value: unknown) => string

/**
 * How a field shows its label:
 * - `floating`: inside the box like a placeholder; it moves up onto the top border on focus or once
 *   the field has a value.
 * - `stacked`: above the box.
 */
export type FieldAppearance = 'floating' | 'stacked'

/** Which side of the row under the box the hint sits on. The error always starts on the left. */
export type HintPosition = 'start' | 'end'

export interface FormKitConfig {
  errorMessage: ErrorMessageFn
  /** Default for every field's `appearance`. */
  appearance: FieldAppearance
  /** Default for every field's `hintPosition`. */
  hintPosition: HintPosition
  /**
   * Read every time a message is built, so messages update when it changes. Pass the app's active
   * language (e.g. `toSignal(translate.onLangChange)`) to re-translate errors on a language switch.
   */
  language?: Signal<unknown>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** English defaults, used when the app doesn't call `provideFormKit`. */
export const defaultErrorMessage: ErrorMessageFn = (key, value) => {
  if (typeof value === 'string') {
    return value
  }

  const params = isRecord(value) ? value : {}
  switch (key) {
    case 'required':
      return 'This field is required.'
    case 'email':
      return 'Enter a valid email address.'
    case 'minlength':
      return `Enter at least ${String(params['requiredLength'])} characters.`
    case 'maxlength':
      return `Enter at most ${String(params['requiredLength'])} characters.`
    case 'min':
      return `Must be ${String(params['min'])} or more.`
    case 'max':
      return `Must be ${String(params['max'])} or less.`
    case 'pattern':
      return 'The format is not valid.'
    default:
      return 'This value is not valid.'
  }
}

const DEFAULT_CONFIG: FormKitConfig = {
  errorMessage: defaultErrorMessage,
  appearance: 'floating',
  hintPosition: 'end',
}

export const FORM_KIT_CONFIG = new InjectionToken<FormKitConfig>('FORM_KIT_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_CONFIG,
})

/**
 * App-wide settings for the kit. Call once in `app.config.ts`:
 *
 * ```ts
 * provideFormKit({
 *   appearance: 'floating',
 *   hintPosition: 'end',
 *   errorMessage: (key, value) =>
 *     typeof value === 'string' ? translate.instant(value) : translate.instant(`ERRORS.${key}`, value),
 * })
 * ```
 */
export const provideFormKit = (config: Partial<FormKitConfig>): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: FORM_KIT_CONFIG,
      useValue: { ...DEFAULT_CONFIG, ...config } satisfies FormKitConfig,
    },
  ])
