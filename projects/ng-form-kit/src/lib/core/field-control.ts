import { forwardRef, InjectionToken } from '@angular/core'
import type { Provider, Signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import type { AbstractControl } from '@angular/forms'
import { of, switchMap } from 'rxjs'

/**
 * A field as seen by what it contains: its control, from the field's `control` input. Lets
 * content inside a field (e.g. `nfk-rule-checklist`) follow the field's control without being
 * handed it again.
 */
export interface FieldControlHost {
  control: Signal<AbstractControl>
}

export const FIELD_CONTROL = new InjectionToken<FieldControlHost>('FIELD_CONTROL')

/**
 * Registers a field as the `FIELD_CONTROL` for its content:
 * `providers: [provideFieldControl(() => MyField)]`.
 */
export const provideFieldControl = (field: () => unknown): Provider => ({
  provide: FIELD_CONTROL,
  useExisting: forwardRef(field),
})

/**
 * A signal that changes on every value, status, touched or pristine change of `control`, and when
 * `control` itself is swapped. Read it inside a `computed` to recompute on those changes, since a
 * `FormControl`'s state isn't a signal. Call it in an injection context.
 */
export const controlChanges = (control: Signal<AbstractControl | null>): Signal<unknown> =>
  toSignal(toObservable(control).pipe(switchMap((target) => (target ? target.events : of(null)))), {
    initialValue: null,
  })
