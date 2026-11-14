import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import type { FormControl } from '@angular/forms'
import { controlPlaceholder, FIELD_SHELL_IMPORTS, FieldMessage } from '../../core/field-shell'
import { FORM_KIT_CONFIG } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { provideFieldControl } from '../../core/field-control'
import { HlmInput } from '../../ui/input/src'

/** Text-like types. For passwords use `nfk-password-field`. */
export type InputFieldType = 'text' | 'email' | 'search' | 'tel' | 'url' | 'number'

let nextId = 0

/**
 * A labelled text input with hint and error text, bound to a `FormControl` through `[control]`:
 *
 * ```html
 * <nfk-input-field [control]="form.controls.name" label="Name" hint="As on your ID card" />
 * ```
 *
 * - `appearance="floating"` (default) puts the label inside the box; it moves onto the top border on
 *   focus or once there is a value. The floated label sits on `--nfk-field-bg` (default
 *   `--background`): set it on a parent when the field is on a card or other surface.
 * - The row under the box holds the error on the left and the hint on the right
 *   (`hintPosition="end"`, default); when both don't fit on one line the hint drops below. With
 *   `hintPosition="start"` the error takes the hint's place while it shows.
 * - Content marked `nfkFieldMessage` replaces the error line (e.g. `nfk-rule-checklist`).
 *
 * The error shows the control's first validation error once spartan considers it invalid (touched
 * or submitted). Messages come from `provideFormKit`.
 */
@Component({
  selector: 'nfk-input-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput],
  providers: [provideFieldControl(() => InputField)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nfk-field-shell
      [label]="label()"
      [hint]="hint()"
      [inputId]="inputId()"
      [appearance]="appearanceValue()"
      [hintPosition]="hintPosition()"
      [hasCustomMessage]="!!customMessage()"
    >
      <input
        hlmInput
        class="peer text-foreground group-data-[appearance=floating]/nfk:h-11 group-data-[appearance=floating]/nfk:placeholder:text-transparent group-data-[appearance=floating]/nfk:focus:placeholder:text-muted-foreground"
        [id]="inputId()"
        [type]="type()"
        [formControl]="control()"
        [placeholder]="inputPlaceholder()"
        [readOnly]="readonly()"
        [attr.autocomplete]="autocomplete()"
        [attr.inputmode]="inputmode()"
        [attr.aria-label]="label() ? null : ariaLabel()"
      />
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class InputField {
  /** The text control, e.g. `form.controls.name`. */
  control = input.required<FormControl<string | null>>()
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
  /** Label inside the box (`floating`) or above it (`stacked`). Defaults to `provideFormKit`. */
  appearance = input<FieldAppearance | null>(null)
  /** Hint on the left (`start`) or right (`end`) under the box. Defaults to `provideFormKit`. */
  hintPosition = input<HintPosition | null>(null)
  /** Id of the inner `<input>`; generated when not set. */
  inputId = input(`nfk-input-field-${nextId++}`)

  protected customMessage = contentChild(FieldMessage)
  private config = inject(FORM_KIT_CONFIG)
  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected inputPlaceholder = computed(() =>
    controlPlaceholder(this.appearanceValue(), this.label(), this.placeholder())
  )
}
