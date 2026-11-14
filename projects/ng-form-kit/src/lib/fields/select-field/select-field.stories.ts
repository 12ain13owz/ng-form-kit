import { JsonPipe } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { MoneyField } from '../money-field/money-field'
import { SelectField } from './select-field'
import type { SelectOption } from './select-field'

const people: SelectOption<number>[] = [
  { value: 1, label: 'Bank' },
  { value: 2, label: 'Fah' },
  { value: 3, label: 'Mint' },
  { value: 4, label: 'Ploy (left early)', disabled: true },
]

interface Args {
  label: string
  hint: string
  placeholder: string
  clearable: boolean
  appearance: FieldAppearance
  hintPosition: HintPosition
  options: SelectOption<number>[]
  control: FormControl<number | null>
}

const meta: Meta<Args> = {
  title: 'Fields/Select field',
  component: SelectField,
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe, SelectField, MoneyField] }),
  ],
  argTypes: {
    appearance: { control: 'inline-radio', options: ['floating', 'stacked'] },
    hintPosition: { control: 'inline-radio', options: ['end', 'start'] },
    options: { table: { disable: true } },
    control: { table: { disable: true } },
  },
  args: {
    label: 'Paid by',
    hint: '',
    placeholder: 'Choose a person',
    clearable: false,
    appearance: 'floating',
    hintPosition: 'end',
    options: people,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm space-y-4 p-4">
        <nfk-select-field
          [formControl]="control"
          [options]="options"
          [label]="label"
          [hint]="hint"
          [placeholder]="placeholder"
          [clearable]="clearable"
          [appearance]="appearance"
          [hintPosition]="hintPosition"
        />
        <pre class="text-muted-foreground text-xs">value: {{ control.value | json }} ({{ typeof(control.value) }})
valid: {{ control.valid }} · touched: {{ control.touched }}</pre>
      </div>
    `,
  }),
}
export default meta

type Story = StoryObj<Args>

const typeOf = { typeof: (value: unknown) => typeof value }

/** Empty: with a floating label the label sits inside until focus. */
export const Default: Story = {
  args: { control: new FormControl<number | null>(null) },
  render: (args, context) => {
    const story = meta.render!(args, context)
    return { ...story, props: { ...story.props, ...typeOf } }
  },
}

/** The value keeps its type: `2` is a number, not `"2"`. */
export const WithValue: Story = {
  ...Default,
  args: { hint: 'Who paid the bill', control: new FormControl<number | null>(2) },
}

export const Required: Story = {
  ...Default,
  args: {
    control: (() => {
      const control = new FormControl<number | null>(null, Validators.required)
      control.markAsTouched()
      return control
    })(),
  },
}

/** `clearable`: the empty choice can be picked again. */
export const Clearable: Story = {
  ...Default,
  args: { clearable: true, placeholder: 'Nobody', control: new FormControl<number | null>(1) },
}

export const Stacked: Story = {
  ...Default,
  args: { appearance: 'stacked', control: new FormControl<number | null>(null) },
}

export const Disabled: Story = {
  ...Default,
  args: { control: new FormControl<number | null>({ value: 3, disabled: true }) },
}

/** Object values with `compareWith`, so a copy of the chosen object still matches its option. */
export const ObjectValues: StoryObj = {
  render: () => {
    interface Person {
      id: number
      name: string
    }
    const list: Person[] = [
      { id: 1, name: 'Bank' },
      { id: 2, name: 'Fah' },
    ]
    return {
      props: {
        options: list.map((person) => ({ value: person, label: person.name })),
        // a copy, as it would come back from an API
        control: new FormControl<Person | null>({ id: 2, name: 'Fah' }),
        byId: (a: Person | null, b: Person | null) => a?.id === b?.id,
      },
      template: `
        <div class="max-w-sm space-y-4 p-4">
          <nfk-select-field [formControl]="control" [options]="options" [compareWith]="byId" label="Person" />
          <pre class="text-muted-foreground text-xs">{{ control.value | json }}</pre>
        </div>
      `,
    }
  },
}

/** SplitSlip's case: who paid and how much. */
export const InFormGroup: StoryObj = {
  render: () => {
    const form = new FormGroup({
      payer: new FormControl<number | null>(null, Validators.required),
      amount: new FormControl<number | null>(null, Validators.required),
    })
    return {
      props: { form, people, submit: () => form.markAllAsTouched() },
      template: `
        <form class="max-w-sm space-y-4 p-4" [formGroup]="form" (ngSubmit)="submit()">
          <nfk-select-field formControlName="payer" label="Paid by" placeholder="Choose a person" [options]="people" />
          <nfk-money-field formControlName="amount" label="Amount paid" />
          <button type="submit" class="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm">
            Save
          </button>
          <pre class="text-muted-foreground text-xs">{{ form.value | json }} · valid: {{ form.valid }}</pre>
        </form>
      `,
    }
  },
}
