import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
} from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import type { ControlValueAccessor } from '@angular/forms'
import { formatMinorUnits, minorDigits, parseMoneyText, sanitizeMoneyText } from '../../core/money'
import type { MinorUnits } from '../../core/money'

/**
 * Value accessor for a money `<input>`: the control holds minor units (an integer, or `null` when
 * empty); the input shows text.
 *
 * - While focused it shows the plain number (`1234.50`) and cleans each keystroke (digits, one
 *   point, at most the currency's decimals).
 * - On blur it formats the number for reading (`1,234.50`).
 *
 * Used inside `nfk-money-field`; a field needs its own accessor here because the text in the box
 * isn't the control's value.
 */
@Directive({
  selector: 'input[nfkMoneyInput]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyInput), multi: true },
  ],
  host: {
    type: 'text',
    inputmode: 'decimal',
    autocomplete: 'off',
    '(input)': 'onInput()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class MoneyInput implements ControlValueAccessor {
  currency = input.required<string>()
  locale = input.required<string>()
  allowNegative = input(false, { transform: booleanAttribute })

  private element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement
  private digits = computed(() => minorDigits(this.currency(), this.locale()))
  private value: MinorUnits | null = null
  private focused = false
  private onChange: (value: MinorUnits | null) => void = () => undefined
  private onTouched: () => void = () => undefined

  writeValue(value: MinorUnits | null): void {
    this.value = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : null
    this.render()
  }

  registerOnChange(fn: (value: MinorUnits | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(disabled: boolean): void {
    this.element.disabled = disabled
  }

  protected onInput(): void {
    const typed = this.element.value
    const clean = sanitizeMoneyText(typed, this.digits(), this.allowNegative())
    if (clean !== typed) {
      this.element.value = clean
    }
    const next = parseMoneyText(clean, this.digits())
    if (next !== this.value) {
      this.value = next
      this.onChange(next)
    }
  }

  protected onFocus(): void {
    this.focused = true
    this.render()
  }

  protected onBlur(): void {
    this.focused = false
    this.render()
    this.onTouched()
  }

  private render(): void {
    this.element.value =
      this.value === null
        ? ''
        : formatMinorUnits(this.value, this.currency(), this.locale(), !this.focused)
  }
}
