import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { BrnField } from '@spartan-ng/brain/field'
import { fieldErrorMessage } from '../../core/field-error'
import { FORM_KIT_CONFIG } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
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
 * - `appearance="floating"` (default) puts the label inside the box; it moves onto the top border on
 *   focus or once there is a value. The floated label sits on `--nfk-field-bg` (default
 *   `--background`): set it on a parent when the field is on a card or other surface.
 * - The row under the box holds the error on the left and the hint on the right
 *   (`hintPosition="end"`, default). With `hintPosition="start"` the error takes the hint's place
 *   while it shows.
 *
 * The error shows the control's first validation error once spartan considers it invalid (touched
 * or submitted). Messages come from `provideFormKit`.
 */
@Component({
  selector: 'nfk-input-field',
  imports: [ReactiveFormsModule, HlmFieldImports, HlmInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div hlmField class="group/nfk gap-0" [attr.data-appearance]="appearanceValue()">
      @if (label() && appearanceValue() === 'stacked') {
        <label hlmFieldLabel class="mb-2" [for]="inputId()">{{ label() }}</label>
      }

      <div class="relative">
        <input
          hlmInput
          class="peer group-data-[appearance=floating]/nfk:h-11 group-data-[appearance=floating]/nfk:placeholder:text-transparent group-data-[appearance=floating]/nfk:focus:placeholder:text-muted-foreground"
          [id]="inputId()"
          [type]="type()"
          [formControl]="boundControl()"
          [placeholder]="inputPlaceholder()"
          [readOnly]="readonly()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputmode()"
          [attr.aria-label]="label() ? null : ariaLabel()"
        />
        @if (label() && appearanceValue() === 'floating') {
          <label
            class="pointer-events-none absolute top-0 left-3 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate rounded-sm bg-[var(--nfk-field-bg,var(--background))] px-1 text-xs leading-4 text-muted-foreground transition-all duration-150 ease-out group-data-[matches-spartan-invalid=true]/field:text-destructive peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:bg-[var(--nfk-field-bg,var(--background))] peer-focus:text-xs peer-focus:text-foreground peer-disabled:opacity-50"
            [for]="inputId()"
          >
            {{ label() }}
          </label>
        }
      </div>

      @if (showError() || hint()) {
        <div
          class="mt-1 flex items-start gap-3 text-xs leading-4 group-data-[appearance=floating]/nfk:px-4"
        >
          @if (hint() && hintPositionValue() === 'start' && !showError()) {
            <p hlmFieldDescription class="min-w-0 flex-1 text-xs leading-4">{{ hint() }}</p>
          }
          <hlm-field-error class="min-w-0 flex-1 text-xs leading-4">{{ error() }}</hlm-field-error>
          @if (hint() && hintPositionValue() === 'end') {
            <p hlmFieldDescription class="ml-auto max-w-[60%] text-right text-xs leading-4">
              {{ hint() }}
            </p>
          }
        </div>
      }
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
  /** Label inside the box (`floating`) or above it (`stacked`). Defaults to `provideFormKit`. */
  appearance = input<FieldAppearance | null>(null)
  /** Hint on the left (`start`) or right (`end`) under the box. Defaults to `provideFormKit`. */
  hintPosition = input<HintPosition | null>(null)
  /** Id of the inner `<input>`; generated when not set. */
  inputId = input(`nfk-input-field-${nextId++}`)

  private config = inject(FORM_KIT_CONFIG)
  protected boundControl = forwardControl()
  private field = viewChild.required(BrnField)
  protected error = fieldErrorMessage(this.field)

  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected hintPositionValue = computed(() => this.hintPosition() ?? this.config.hintPosition)
  protected showError = computed(
    () => !!this.field().controlState()?.spartanInvalid && this.error() !== ''
  )
  /**
   * A floating label needs a placeholder to detect an empty box (`:placeholder-shown`), so it gets a
   * blank one when none is set. The real placeholder only shows while focused, under the label.
   */
  protected inputPlaceholder = computed(() =>
    this.appearanceValue() === 'floating' && this.label()
      ? this.placeholder() || ' '
      : this.placeholder()
  )
}
