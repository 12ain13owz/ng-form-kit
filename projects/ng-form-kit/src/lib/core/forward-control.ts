import { inject } from '@angular/core'
import { FormControl, NgControl } from '@angular/forms'
import type { ControlValueAccessor } from '@angular/forms'

/** Does nothing: the field's inner control talks to the form instead. */
const NOOP_VALUE_ACCESSOR: ControlValueAccessor = {
  writeValue: () => undefined,
  registerOnChange: () => undefined,
  registerOnTouched: () => undefined,
}

/**
 * Lets a field component be used like a native input (`formControlName`, `[formControl]`,
 * `ngModel`) while its inner `<input>` binds to the very same `FormControl`.
 *
 * Instead of copying value, touched and disabled state through a `ControlValueAccessor`, the field
 * takes the `NgControl` on its own element, gives it a no-op accessor, and hands its control to the
 * inner element. Validation, `markAsTouched()`, `disable()` and spartan's error state then work
 * exactly as on a plain input.
 *
 * Call it in a field initializer. Returns a getter, because a `formControlName` control only exists
 * once the parent form has registered it.
 */
export const forwardControl = (): (() => FormControl) => {
  const ngControl = inject(NgControl, { self: true, optional: true })
  if (!ngControl) {
    throw new Error(
      'ng-form-kit: a field needs formControlName, [formControl] or ngModel on its element.'
    )
  }

  ngControl.valueAccessor = NOOP_VALUE_ACCESSOR
  return () => {
    const control = ngControl.control
    if (!(control instanceof FormControl)) {
      throw new Error('ng-form-kit: a field must be bound to a FormControl.')
    }
    return control
  }
}
