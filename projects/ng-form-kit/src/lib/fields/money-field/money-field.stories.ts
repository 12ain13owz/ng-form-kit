import { JsonPipe } from '@angular/common'
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { formatMoney, moneyMax, moneyMin } from '../../core/money'
import type { MinorUnits } from '../../core/money'
import { InputField } from '../input-field/input-field'
import { MoneyField } from './money-field'

interface Args {
  label: string
  hint: string
  placeholder: string
  currency: string
  locale: string
  allowNegative: boolean
  readonly: boolean
  appearance: FieldAppearance
  hintPosition: HintPosition
  control: FormControl<MinorUnits | null>
}

const meta: Meta<Args> = {
  title: 'Fields/Money field',
  component: MoneyField,
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe, MoneyField, InputField] }),
  ],
  argTypes: {
    appearance: { control: 'inline-radio', options: ['floating', 'stacked'] },
    hintPosition: { control: 'inline-radio', options: ['end', 'start'] },
    control: { table: { disable: true } },
  },
  args: {
    label: 'Price',
    hint: '',
    placeholder: '0.00',
    currency: 'THB',
    locale: 'th-TH',
    allowNegative: false,
    readonly: false,
    appearance: 'floating',
    hintPosition: 'end',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm space-y-4 p-4">
        <nfk-money-field
          [formControl]="control"
          [label]="label"
          [hint]="hint"
          [placeholder]="placeholder"
          [currency]="currency"
          [locale]="locale"
          [allowNegative]="allowNegative"
          [readonly]="readonly"
          [appearance]="appearance"
          [hintPosition]="hintPosition"
        />
        <pre class="text-muted-foreground text-xs">value (minor units): {{ control.value | json }}
valid: {{ control.valid }} · touched: {{ control.touched }}</pre>
      </div>
    `,
  }),
}
export default meta

type Story = StoryObj<Args>

export const Default: Story = {
  args: { control: new FormControl<MinorUnits | null>(null) },
}

/** `123450` satang shows as `1,234.50`; focus the box to see the plain number. */
export const WithValue: Story = {
  args: { hint: 'Before service charge', control: new FormControl<MinorUnits | null>(123450) },
}

export const Required: Story = {
  args: {
    control: (() => {
      const control = new FormControl<MinorUnits | null>(null, Validators.required)
      control.markAsTouched()
      return control
    })(),
  },
}

/** `moneyMin` / `moneyMax` take minor units; their messages show the amount (`฿1.00`). */
export const MinAndMax: Story = {
  args: {
    hint: '฿1.00 – ฿10,000.00',
    control: (() => {
      const control = new FormControl<MinorUnits | null>(50, [moneyMin(100), moneyMax(1_000_000)])
      control.markAsTouched()
      return control
    })(),
  },
}

/** `allowNegative` for refunds or corrections. */
export const Negative: Story = {
  args: {
    label: 'Adjustment',
    allowNegative: true,
    control: new FormControl<MinorUnits | null>(-2550),
  },
}

/** Any ISO 4217 currency: decimals follow it (USD 2, JPY 0). */
export const OtherCurrencies: StoryObj = {
  render: () => ({
    props: {
      usd: new FormControl<MinorUnits | null>(199999),
      jpy: new FormControl<MinorUnits | null>(1500),
    },
    template: `
      <div class="max-w-sm space-y-5 p-4">
        <nfk-money-field [formControl]="usd" label="USD" currency="USD" locale="en-US" />
        <nfk-money-field [formControl]="jpy" label="JPY" currency="JPY" locale="ja-JP" />
        <pre class="text-muted-foreground text-xs">usd: {{ usd.value }} cents · jpy: {{ jpy.value }} yen</pre>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { control: new FormControl<MinorUnits | null>({ value: 4500, disabled: true }) },
}

export const Readonly: Story = {
  args: { readonly: true, control: new FormControl<MinorUnits | null>(4500) },
}

/** SplitSlip's case: bill items with exact totals in satang. */
export const BillItems: StoryObj = {
  render: () => {
    const item = (name: string, price: MinorUnits | null) =>
      new FormGroup({
        name: new FormControl(name, { nonNullable: true, validators: Validators.required }),
        price: new FormControl<MinorUnits | null>(price, [Validators.required, moneyMin(1)]),
      })
    const items = new FormArray([item('ข้าวผัดกุ้ง', 12000), item('ชาเย็น ×2', 9000), item('', null)])
    const form = new FormGroup({ items })
    const total = () =>
      formatMoney(
        items.controls.reduce((sum, row) => sum + (row.controls.price.value ?? 0), 0),
        'THB',
        'th-TH'
      )
    return {
      props: { form, items, total, submit: () => form.markAllAsTouched() },
      template: `
        <form class="max-w-md space-y-3 p-4" [formGroup]="form" (ngSubmit)="submit()">
          @for (row of items.controls; track $index) {
            <div class="grid grid-cols-[1fr_9rem] gap-3" [formGroup]="row">
              <nfk-input-field formControlName="name" label="Item" />
              <nfk-money-field formControlName="price" label="Price" />
            </div>
          }
          <div class="flex items-center justify-between pt-2">
            <button type="submit" class="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm">
              Check
            </button>
            <p class="text-sm">Total <span class="font-medium tabular-nums">{{ total() }}</span></p>
          </div>
        </form>
      `,
    }
  },
}
