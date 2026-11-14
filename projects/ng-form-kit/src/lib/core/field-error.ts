import { computed, inject } from '@angular/core'
import type { Signal } from '@angular/core'
import type { ValidationErrors, ValidatorFn } from '@angular/forms'
import type { BrnField } from '@spartan-ng/brain/field'
import { FORM_KIT_CONFIG } from './form-kit-config'
import type { ErrorMessageFn } from './form-kit-config'

/** Text for the first error in `errors`, or `''` when there is none. */
export const firstErrorMessage = (
  errors: ValidationErrors | null,
  errorMessage: ErrorMessageFn
): string => {
  const first = errors ? Object.entries<unknown>(errors)[0] : undefined
  return first ? errorMessage(first[0], first[1]) : ''
}

/**
 * The error text of a spartan field, kept up to date with the control and the app's language.
 * Call it in a field initializer (it needs an injection context).
 */
export const fieldErrorMessage = (field: Signal<BrnField>): Signal<string> => {
  const config = inject(FORM_KIT_CONFIG)
  return computed(() => {
    config.language?.()
    return firstErrorMessage(field().errors(), config.errorMessage)
  })
}

/**
 * Gives a validator's errors a custom message while keeping their keys:
 * `withMessage(Validators.required, 'NAME_REQUIRED')`. The message reaches `errorMessage` as the
 * error's value, so an app with i18n can treat it as a translation key.
 */
export const withMessage =
  (validator: ValidatorFn, message: string): ValidatorFn =>
  (control) => {
    const errors = validator(control)
    return errors ? Object.fromEntries(Object.keys(errors).map((key) => [key, message])) : null
  }
