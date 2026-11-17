import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import type { FormControl } from '@angular/forms'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronDown } from '@ng-icons/lucide'
import { FIELD_SHELL_IMPORTS, FieldMessage } from '../../core/field-shell'
import { FORM_KIT_CONFIG, injectText } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { controlChanges, provideFieldControl } from '../../core/field-control'
import { HlmInput } from '../../ui/input/src'

/** One choice of a select. `value` can be any type: a string, a number, an object. */
export interface SelectOption<T = unknown> {
  value: T
  label: string
  disabled?: boolean
}

let nextId = 0

const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === ''

/**
 * A labelled native `<select>`, bound to a `FormControl` through `[control]`. Values keep their type (numbers stay
 * numbers, objects stay objects); the control is `null` while nothing is chosen:
 *
 * ```html
 * <nfk-select-field [control]="form.controls.payer" label="Paid by" [options]="people" />
 * ```
 *
 * Native on purpose: phones open their own picker, and keyboard and screen readers work as
 * everywhere else. `placeholder` is the empty choice's text; it can be picked again only with
 * `clearable`. For object values whose instances change, pass `compareWith`.
 *
 * The open list is drawn by the browser: options take the theme's `--popover` colours (so it
 * follows light / dark), but its shape and spacing can't be styled.
 */
@Component({
  selector: 'nfk-select-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput, NgIcon],
  providers: [provideFieldControl(() => SelectField), provideIcons({ lucideChevronDown })],
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
      <select
        hlmInput
        class="peer cursor-pointer appearance-none pe-10 text-foreground group-data-[appearance=floating]/nfk:h-11 data-[rest=true]:text-transparent [&>option]:bg-popover [&>option]:text-popover-foreground"
        [id]="inputId()"
        [formControl]="control()"
        [compareWith]="compareWith()"
        [attr.data-rest]="resting()"
        [attr.aria-label]="label() ? null : ariaText()"
        (focus)="focused.set(true)"
        (blur)="focused.set(false)"
      >
        <option [ngValue]="null" [disabled]="!clearable()">{{ placeholderText() }}</option>
        @for (option of options(); track $index) {
          <option [ngValue]="option.value" [disabled]="!!option.disabled">
            {{ optionLabels()[$index] }}
          </option>
        }
      </select>
      <ng-icon
        class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground"
        name="lucideChevronDown"
        size="16"
        aria-hidden="true"
      />
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class SelectField<T = unknown> {
  /** The chosen value, `null` while nothing is chosen. */
  control = input.required<FormControl<T | null>>()
  options = input.required<readonly SelectOption<T>[]>()
  /** Visible label. Leave empty only with `ariaLabel`. */
  label = input('')
  /** Screen-reader label for a field with no visible label. */
  ariaLabel = input<string | null>(null)
  hint = input('')
  /** Text of the empty choice, e.g. "Choose a person". */
  placeholder = input('')
  /** Lets the user pick the empty choice again to clear the value. */
  clearable = input(false, { transform: booleanAttribute })
  /** How options match the value; defaults to `===`. */
  compareWith = input<(a: T | null, b: T | null) => boolean>((a, b) => a === b)
  appearance = input<FieldAppearance | null>(null)
  hintPosition = input<HintPosition | null>(null)
  /** Id of the inner `<select>`; generated when not set. */
  inputId = input(`nfk-select-field-${nextId++}`)

  protected customMessage = contentChild(FieldMessage)
  protected focused = signal(false)
  private config = inject(FORM_KIT_CONFIG)
  private text = injectText()
  protected ariaText = computed(() => this.text(this.ariaLabel()))
  protected placeholderText = computed(() => this.text(this.placeholder()))
  // Option labels go through the app's translate too, so they can be translation keys.
  protected optionLabels = computed(() => this.options().map((option) => this.text(option.label)))
  private changes = controlChanges(this.control)
  // Read straight from the control (right on the first render), recomputed on its changes.
  private value = computed(() => (this.changes(), this.control().value))
  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  /**
   * Empty and not focused, with a floating label: the label sits inside the box and the select's
   * own text is hidden, as an input does with `:placeholder-shown`.
   */
  protected resting = computed(
    () =>
      this.appearanceValue() === 'floating' &&
      !!this.label() &&
      isEmpty(this.value()) &&
      !this.focused()
  )
}
