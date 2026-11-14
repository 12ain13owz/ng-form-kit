import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  viewChild,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { BrnField } from '@spartan-ng/brain/field'
import { fieldErrorMessage } from '../../core/field-error'
import { forwardControl } from '../../core/forward-control'
import { HlmFieldImports } from '../../ui/field/src'
import { HlmInput } from '../../ui/input/src'

export type InputFieldType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'

let nextId = 0

/**
 * A labelled text input with hint and error text, bound like a native input:
 *
 * ```html
 * <nfk-input-field formControlName="name" label="Name" hint="As on your ID card" />
 * ```
 *
 * The error shows the control's first validation error once spartan considers it invalid
 * (touched or submitted). Messages come from `provideFormKit`.
 */
@Component({
  selector: 'nfk-input-field',
  imports: [ReactiveFormsModule, HlmFieldImports, HlmInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div hlmField>
      @if (label()) {
        <label hlmFieldLabel [for]="inputId()">{{ label() }}</label>
      }
      <input
        hlmInput
        [id]="inputId()"
        [type]="type()"
        [formControl]="boundControl()"
        [placeholder]="placeholder()"
        [readOnly]="readonly()"
        [attr.autocomplete]="autocomplete()"
        [attr.inputmode]="inputmode()"
        [attr.aria-label]="label() ? null : ariaLabel()"
      />
      @if (hint()) {
        <p hlmFieldDescription>{{ hint() }}</p>
      }
      <hlm-field-error>{{ error() }}</hlm-field-error>
    </div>
  `,
})
export class InputField {
  /** Visible label. Leave empty only with `ariaLabel`. */
  label = input('')
  /** Screen-reader label for a field with no visible label. */
  ariaLabel = input<string | null>(null)
  hint = input('')
  placeholder = input('')
  type = input<InputFieldType>('text')
  autocomplete = input<string | null>(null)
  inputmode = input<string | null>(null)
  readonly = input(false, { transform: booleanAttribute })
  /** Id of the inner `<input>`; generated when not set. */
  inputId = input(`nfk-input-field-${nextId++}`)

  protected boundControl = forwardControl()
  private field = viewChild.required(BrnField)
  protected error = fieldErrorMessage(this.field)
}
