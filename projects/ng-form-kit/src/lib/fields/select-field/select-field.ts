import type { AfterContentInit } from '@angular/core'
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule } from '@angular/forms'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronDown } from '@ng-icons/lucide'
import { FIELD_SHELL_IMPORTS, FieldMessage } from '../../core/field-shell'
import { FORM_KIT_CONFIG } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { forwardControl } from '../../core/forward-control'
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
 * A labelled native `<select>`, bound like a native input. Values keep their type (numbers stay
 * numbers, objects stay objects); the control is `null` while nothing is chosen:
 *
 * ```html
 * <nfk-select-field formControlName="payer" label="Paid by" [options]="people" />
 * ```
 *
 * Native on purpose: phones open their own picker, and keyboard and screen readers work as
 * everywhere else. `placeholder` is the empty choice's text; it can be picked again only with
 * `clearable`. For object values whose instances change, pass `compareWith`.
 */
@Component({
  selector: 'nfk-select-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput, NgIcon],
  providers: [provideIcons({ lucideChevronDown })],
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
        class="peer cursor-pointer appearance-none pe-10 text-foreground group-data-[appearance=floating]/nfk:h-11 data-[rest=true]:text-transparent [&>option]:text-foreground"
        [id]="inputId()"
        [formControl]="boundControl()"
        [compareWith]="compareWith()"
        [attr.data-rest]="resting()"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (focus)="focused.set(true)"
        (blur)="focused.set(false)"
      >
        <option [ngValue]="null" [disabled]="!clearable()">{{ placeholder() }}</option>
        @for (option of options(); track $index) {
          <option [ngValue]="option.value" [disabled]="!!option.disabled">
            {{ option.label }}
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
export class SelectField<T = unknown> implements AfterContentInit {
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

  protected boundControl = forwardControl()
  protected customMessage = contentChild(FieldMessage)
  protected focused = signal(false)
  private config = inject(FORM_KIT_CONFIG)
  private destroyRef = inject(DestroyRef)
  private value = signal<unknown>(null)
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

  // The host's FormControlName sets up its control in ngOnChanges, which runs before content init
  // and before this view first renders, so the first render already knows the value.
  ngAfterContentInit(): void {
    const control = this.boundControl()
    this.value.set(control.value)
    control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.value.set(value))
  }
}
