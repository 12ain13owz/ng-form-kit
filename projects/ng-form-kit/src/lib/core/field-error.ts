import { computed, inject } from '@angular/core'
import type { Signal } from '@angular/core'
import { Validators } from '@angular/forms'
import type { ValidationErrors, ValidatorFn } from '@angular/forms'
import type { BrnField } from '@spartan-ng/brain/field'
import { FORM_KIT_CONFIG } from './form-kit-config'
import type { FormKitConfig } from './form-kit-config'

/**
 * The value `withMessage` gives an error: a message (translation key or text) and the validator's
 * params. Validators written this way by hand work too, e.g. `{ min: { key: 'ERRORS.MIN', params:
 * { min: 100 } } }`.
 */
export interface ErrorMessage {
  key: string
  params?: Record<string, unknown>
}

type Params = Record<string, unknown>

const isRecord = (value: unknown): value is Params => typeof value === 'object' && value !== null

/**
 * The message and params for one error, from whatever the validator put there:
 * - `{ key, params }` (from `withMessage`, or a validator that sets it): that message
 * - a non-empty string: that message
 * - Angular's own value (`true`, `{ requiredLength: 8, … }`): the app's message for the error key,
 *   with that object as params
 */
export const resolveError = (
  errorKey: string,
  value: unknown,
  messages: Readonly<Record<string, string>>
): { message: string; params: Params } => {
  if (isRecord(value) && typeof value['key'] === 'string' && value['key']) {
    return { message: value['key'], params: isRecord(value['params']) ? value['params'] : {} }
  }
  if (typeof value === 'string' && value) {
    return { message: value, params: {} }
  }
  return {
    message: messages[errorKey] ?? messages['invalid'] ?? errorKey,
    params: isRecord(value) ? value : {},
  }
}

/** Text for the first error in `errors`, or `''` when there is none. */
export const errorText = (
  errors: ValidationErrors | null,
  config: Pick<FormKitConfig, 'messages' | 'translate'>
): string => {
  const first = errors ? Object.entries<unknown>(errors)[0] : undefined
  if (!first) {
    return ''
  }
  const { message, params } = resolveError(first[0], first[1], config.messages)
  return config.translate(message, params)
}

/**
 * The error text of a spartan field, kept up to date with the control and the app's language.
 * Call it in an injection context.
 */
export const fieldErrorMessage = (field: Signal<BrnField>): Signal<string> => {
  const config = inject(FORM_KIT_CONFIG)
  return computed(() => {
    config.language?.()
    return errorText(field().errors(), config)
  })
}

/**
 * Gives any validator (Angular's, the kit's or your own) your message, keeping its error key and
 * its params:
 *
 * ```ts
 * withMessage(Validators.required, 'CARD.NAME_REQUIRED')
 * withMessage(Validators.minLength(8), 'AUTH.PASSWORD_MIN')       // params: requiredLength, actualLength
 * withMessage([Validators.required, Validators.email], {          // several validators,
 *   required: 'AUTH.EMAIL_REQUIRED',                              // one message per error key;
 *   email: 'AUTH.EMAIL_INVALID',                                  // keys left out keep the default
 * })
 * ```
 *
 * The message is a translation key or plain text; `{{param}}` placeholders are filled from the
 * validator's params (by the app's translate function, or the kit's default).
 */
export const withMessage = (
  validators: ValidatorFn | readonly ValidatorFn[],
  message: string | Readonly<Record<string, string>>
): ValidatorFn => {
  const validator = Array.isArray(validators)
    ? (Validators.compose([...validators]) ?? (() => null))
    : (validators as ValidatorFn)

  return (control) => {
    const errors = validator(control)
    if (!errors) {
      return null
    }

    return Object.fromEntries(
      Object.entries(errors).map(([key, value]) => {
        const custom = typeof message === 'string' ? message : message[key]
        return custom
          ? [key, { key: custom, params: isRecord(value) ? value : {} } satisfies ErrorMessage]
          : [key, value]
      })
    )
  }
}
