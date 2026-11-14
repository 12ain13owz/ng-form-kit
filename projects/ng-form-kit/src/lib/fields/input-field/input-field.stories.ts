import { JsonPipe } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import { withMessage } from '../../core/field-error'
import { InputField } from './input-field'
import type { InputFieldType } from './input-field'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'

interface Args {
  label: string
  hint: string
  placeholder: string
  type: InputFieldType
  readonly: boolean
  appearance: FieldAppearance
  hintPosition: HintPosition
  control: FormControl<string>
}

const meta: Meta<Args> = {
  title: 'Fields/Input field',
  component: InputField,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe, InputField] })],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
    appearance: { control: 'inline-radio', options: ['floating', 'stacked'] },
    hintPosition: { control: 'inline-radio', options: ['end', 'start'] },
    control: { table: { disable: true } },
  },
  args: {
    label: 'Name',
    hint: '',
    placeholder: '',
    type: 'text',
    readonly: false,
    appearance: 'floating',
    hintPosition: 'end',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm space-y-4 p-4">
        <nfk-input-field
          [formControl]="control"
          [label]="label"
          [hint]="hint"
          [placeholder]="placeholder"
          [type]="type"
          [readonly]="readonly"
          [appearance]="appearance"
          [hintPosition]="hintPosition"
        />
        <pre class="text-muted-foreground text-xs">value: {{ control.value | json }}
valid: {{ control.valid }} · touched: {{ control.touched }} · disabled: {{ control.disabled }}</pre>
      </div>
    `,
  }),
}
export default meta

type Story = StoryObj<Args>

export const Default: Story = {
  args: { control: new FormControl('', { nonNullable: true }) },
}

export const WithHint: Story = {
  args: {
    label: 'Display name',
    hint: 'Friends see this name on the bill.',
    placeholder: 'e.g. Bank',
    control: new FormControl('', { nonNullable: true }),
  },
}

/** Touched and empty, so the required error shows at once. */
export const Required: Story = {
  args: {
    control: (() => {
      const control = new FormControl('', { nonNullable: true, validators: Validators.required })
      control.markAsTouched()
      return control
    })(),
  },
}

/** `withMessage` replaces the default text; an app with i18n passes a translation key instead. */
export const CustomMessage: Story = {
  args: {
    label: 'Email',
    type: 'email',
    control: (() => {
      const control = new FormControl('not-an-email', {
        nonNullable: true,
        validators: withMessage(Validators.email, 'We send the bill to this address.'),
      })
      control.markAsTouched()
      return control
    })(),
  },
}

export const MinLength: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'At least 8 characters.',
    control: (() => {
      const control = new FormControl('abc', {
        nonNullable: true,
        validators: Validators.minLength(8),
      })
      control.markAsTouched()
      return control
    })(),
  },
}

export const Disabled: Story = {
  args: { control: new FormControl({ value: 'Somchai', disabled: true }, { nonNullable: true }) },
}

export const Readonly: Story = {
  args: { readonly: true, control: new FormControl('Somchai', { nonNullable: true }) },
}

/** The usual way in an app: `formControlName` inside a `[formGroup]`. Submit marks all touched. */
export const InFormGroup: StoryObj = {
  render: () => {
    const form = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: Validators.required }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
    })
    return {
      props: { form, submit: () => form.markAllAsTouched() },
      template: `
        <form class="max-w-sm space-y-4 p-4" [formGroup]="form" (ngSubmit)="submit()">
          <nfk-input-field formControlName="name" label="Name" />
          <nfk-input-field formControlName="email" label="Email" type="email" autocomplete="email" />
          <button type="submit" class="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm">
            Save
          </button>
          <pre class="text-muted-foreground text-xs">{{ form.value | json }} · valid: {{ form.valid }}</pre>
        </form>
      `,
    }
  },
}

/** Both appearances side by side, empty and filled, each with a hint and an error. */
export const Appearances: StoryObj = {
  render: () => {
    const required = () => {
      const control = new FormControl('', { nonNullable: true, validators: Validators.required })
      control.markAsTouched()
      return control
    }
    return {
      props: {
        empty: new FormControl('', { nonNullable: true }),
        filled: new FormControl('Somchai', { nonNullable: true }),
        floatingError: required(),
        stackedError: required(),
        stackedEmpty: new FormControl('', { nonNullable: true }),
        stackedFilled: new FormControl('Somchai', { nonNullable: true }),
      },
      template: `
        <div class="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 p-4">
          <p class="text-sm font-medium">floating</p>
          <p class="text-sm font-medium">stacked</p>
          <nfk-input-field [formControl]="empty" label="Name" hint="Shown on the bill" />
          <nfk-input-field [formControl]="stackedEmpty" label="Name" hint="Shown on the bill" appearance="stacked" />
          <nfk-input-field [formControl]="filled" label="Name" />
          <nfk-input-field [formControl]="stackedFilled" label="Name" appearance="stacked" />
          <nfk-input-field [formControl]="floatingError" label="Email" hint="For the receipt" />
          <nfk-input-field [formControl]="stackedError" label="Email" hint="For the receipt" appearance="stacked" />
        </div>
      `,
    }
  },
}

/** `hintPosition="start"`: the hint on the left; the error replaces it while it shows. */
export const HintStart: Story = {
  args: {
    label: 'Display name',
    hint: 'Friends see this name on the bill.',
    hintPosition: 'start',
    control: new FormControl('', { nonNullable: true, validators: Validators.required }),
  },
}

/** On a card: set `--nfk-field-bg` to the surface colour so the floated label's notch matches. */
export const OnCard: StoryObj = {
  render: () => ({
    props: { control: new FormControl('Somchai', { nonNullable: true }) },
    template: `
      <div class="p-4">
        <div class="bg-muted max-w-sm rounded-xl p-4 [--nfk-field-bg:var(--color-muted)]">
          <nfk-input-field [formControl]="control" label="Name" />
        </div>
      </div>
    `,
  }),
}
