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
import { FORM_KIT_CONFIG, injectText } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { provideFieldControl } from '../../core/field-control'
import { currencySymbol } from '../../core/money'
import { HlmInput } from '../../ui/input/src'
import { MoneyInput } from './money-input'

let nextId = 0

/**
 * An amount of money, bound to a `FormControl` through `[control]`. The control holds **minor units** as an integer
 * (satang for THB: ฿1,234.50 → `123450`), or `null` when empty:
 *
 * ```html
 * <nfk-money-field [control]="form.controls.price" label="Price" />
 * ```
 *
 * The box shows `1,234.50` with the currency symbol on the right; while focused it shows the plain
 * number and only lets valid amounts in. Currency and locale default to `provideFormKit`
 * (`THB`, `th-TH`). Validate limits with `moneyMin` / `moneyMax`, whose messages show the amount.
 */
@Component({
  selector: 'nfk-money-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput, MoneyInput],
  providers: [provideFieldControl(() => MoneyField)],
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
        nfkMoneyInput
        class="peer pr-10 text-foreground tabular-nums group-data-[appearance=floating]/nfk:h-11 group-data-[appearance=floating]/nfk:placeholder:text-transparent group-data-[appearance=floating]/nfk:focus:placeholder:text-muted-foreground"
        [id]="inputId()"
        [formControl]="control()"
        [currency]="currencyValue()"
        [locale]="localeValue()"
        [allowNegative]="allowNegative()"
        [placeholder]="inputPlaceholder()"
        [readOnly]="readonly()"
        [attr.aria-label]="label() ? null : ariaText()"
      />
      <span
        class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground"
        aria-hidden="true"
        >{{ symbol() }}</span
      >
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class MoneyField {
  /** The amount in minor units (satang for THB), `null` when empty. */
  control = input.required<FormControl<number | null>>()
  /** Visible label. Leave empty only with `ariaLabel`. */
  label = input('')
  /** Screen-reader label for a field with no visible label. */
  ariaLabel = input<string | null>(null)
  hint = input('')
  placeholder = input('')
  /** ISO 4217 code. Defaults to `provideFormKit` (`THB`). */
  currency = input<string | null>(null)
  /** Formatting locale. Defaults to `provideFormKit` (`th-TH`). */
  locale = input<string | null>(null)
  /** Lets the amount go below zero (refunds, corrections). */
  allowNegative = input(false, { transform: booleanAttribute })
  readonly = input(false, { transform: booleanAttribute })
  appearance = input<FieldAppearance | null>(null)
  hintPosition = input<HintPosition | null>(null)
  /** Id of the inner `<input>`; generated when not set. */
  inputId = input(`nfk-money-field-${nextId++}`)

  protected customMessage = contentChild(FieldMessage)
  private config = inject(FORM_KIT_CONFIG)
  private text = injectText()
  protected ariaText = computed(() => this.text(this.ariaLabel()))
  protected currencyValue = computed(() => this.currency() ?? this.config.currency)
  protected localeValue = computed(() => this.locale() ?? this.config.locale)
  protected symbol = computed(() => currencySymbol(this.currencyValue(), this.localeValue()))
  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected inputPlaceholder = computed(() =>
    controlPlaceholder(this.appearanceValue(), this.label(), this.text(this.placeholder()))
  )
}
