import { InjectionToken, makeEnvironmentProviders } from '@angular/core'
import type { EnvironmentProviders, Signal } from '@angular/core'

/**
 * Turns a message into the text shown, e.g. through the app's i18n:
 * `(key, params) => translate.instant(key, params)`.
 *
 * `message` is a key or plain text: one set with `withMessage`, one from `messages`, or a rule's
 * label. `params` are the validator's own values (`requiredLength`, `min`, …).
 */
export type TranslateFn = (message: string, params: Record<string, unknown>) => string

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
  /**
   * Message for each error key when the validator has none of its own (no `withMessage`). Set the
   * ones you want to change; the rest keep the English defaults (`DEFAULT_MESSAGES`). With i18n,
   * map them to your translation keys: `{ required: 'ERRORS.REQUIRED' }`.
   */
  messages: Record<string, string>
  /**
   * Turns a message into text. Default: the message itself with `{{param}}` filled in. With i18n,
   * your translate function (call `provideFormKit` with a factory to `inject()` it).
   */
  translate: TranslateFn
  /**
   * Read every time a message is built, so messages update when it changes. Pass the app's active
   * language (e.g. `toSignal(translate.onLangChange)`) to re-translate on a language switch.
   */
  language?: Signal<unknown>
  /** Default for every field's `appearance`. */
  appearance: FieldAppearance
  /** Default for every field's `hintPosition`. */
  hintPosition: HintPosition
  /** Default locale for formatting numbers and money, e.g. `th-TH`. */
  locale: string
  /** Default ISO 4217 currency of money fields, e.g. `THB`. */
  currency: string
}

/**
 * English message for each error key the kit knows, used when the app doesn't set its own (the
 * `{{…}}` are the validator's params), and the kit's few words of its own (`ruleMet`,
 * `showPassword`, …). Map any of them to translation keys in `provideFormKit({ messages })`.
 */
export const DEFAULT_MESSAGES: Readonly<Record<string, string>> = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  minlength: 'Enter at least {{requiredLength}} characters.',
  maxlength: 'Enter at most {{requiredLength}} characters.',
  min: 'Must be {{min}} or more.',
  max: 'Must be {{max}} or less.',
  pattern: 'The format is not valid.',
  rules: 'Does not meet all the requirements.',
  moneyMin: 'Must be at least {{minText}}.',
  moneyMax: 'Must be at most {{maxText}}.',
  invalid: 'This value is not valid.',
  // The kit's own words, read by screen readers or shown on buttons.
  ruleMet: 'met',
  ruleUnmet: 'not met',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
}

/** Fills `{{name}}` placeholders from `params`; leaves unknown ones as they are. */
export const interpolate: TranslateFn = (message, params) =>
  message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )

const DEFAULT_CONFIG: FormKitConfig = {
  messages: DEFAULT_MESSAGES,
  translate: interpolate,
  appearance: 'floating',
  hintPosition: 'end',
  locale: 'th-TH',
  currency: 'THB',
}

export const FORM_KIT_CONFIG = new InjectionToken<FormKitConfig>('FORM_KIT_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_CONFIG,
})

/**
 * App-wide settings for the kit, in `app.config.ts`. Pass an object, or a factory when you need
 * `inject()` (e.g. your translate service):
 *
 * ```ts
 * provideFormKit(() => {
 *   const translate = inject(TranslateService)
 *   return {
 *     messages: { required: 'ERRORS.REQUIRED', minlength: 'ERRORS.MIN_LENGTH' },
 *     translate: (key, params) => translate.instant(key, params),
 *     language: toSignal(translate.onLangChange),
 *   }
 * })
 * ```
 *
 * `messages` merges with the defaults, so you only list the ones you change.
 */
export const provideFormKit = (
  config: Partial<FormKitConfig> | (() => Partial<FormKitConfig>)
): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: FORM_KIT_CONFIG,
      useFactory: (): FormKitConfig => {
        const given = typeof config === 'function' ? config() : config
        return {
          ...DEFAULT_CONFIG,
          ...given,
          messages: { ...DEFAULT_MESSAGES, ...given.messages },
        }
      },
    },
  ])
