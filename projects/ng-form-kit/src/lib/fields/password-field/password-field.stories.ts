import { JsonPipe } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import { rulesValidator } from '../../core/field-rules'
import type { FieldRule } from '../../core/field-rules'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { PasswordField } from './password-field'
import type { PasswordFieldMode } from './password-field'

/** The policy from the owner's reference: 8+ characters and 3 of 4 character kinds. */
const passwordRules: FieldRule[] = [
  { key: 'length', label: 'At least 8 characters in length', test: (v) => v.length >= 8 },
  {
    key: 'kinds',
    label: 'Should contain at least 3 of:',
    minPassed: 3,
    children: [
      { key: 'lower', label: 'lower case letters (a-z)', test: (v) => /[a-z]/.test(v) },
      { key: 'upper', label: 'upper case letters (A-Z)', test: (v) => /[A-Z]/.test(v) },
      { key: 'digit', label: 'numbers (0-9)', test: (v) => /\d/.test(v) },
      { key: 'symbol', label: 'special characters (!@#…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
    ],
  },
]

interface Args {
  label: string
  hint: string
  mode: PasswordFieldMode
  appearance: FieldAppearance
  hintPosition: HintPosition
  rules: FieldRule[]
  rulesTitle: string
  control: FormControl<string>
}

const meta: Meta<Args> = {
  title: 'Fields/Password field',
  component: PasswordField,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe, PasswordField] })],
  argTypes: {
    mode: { control: 'inline-radio', options: ['current', 'new'] },
    appearance: { control: 'inline-radio', options: ['floating', 'stacked'] },
    hintPosition: { control: 'inline-radio', options: ['end', 'start'] },
    rules: { table: { disable: true } },
    control: { table: { disable: true } },
  },
  args: {
    label: 'Password',
    hint: '',
    mode: 'current',
    appearance: 'floating',
    hintPosition: 'end',
    rules: [],
    rulesTitle: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm space-y-4 p-4">
        <nfk-password-field
          [control]="control"
          [label]="label"
          [hint]="hint"
          [mode]="mode"
          [appearance]="appearance"
          [hintPosition]="hintPosition"
          [rules]="rules"
          [rulesTitle]="rulesTitle"
        />
        <pre class="text-muted-foreground text-xs">valid: {{ control.valid }} · errors: {{ control.errors | json }}</pre>
      </div>
    `,
  }),
}
export default meta

type Story = StoryObj<Args>

/** Signing in: `mode="current"`, a single error line. */
export const SignIn: Story = {
  args: {
    control: new FormControl('', { nonNullable: true, validators: Validators.required }),
  },
}

/** Signing up: `mode="new"` with the rules as a live checklist (try typing). */
export const NewWithRules: Story = {
  args: {
    label: 'New password',
    mode: 'new',
    rules: passwordRules,
    rulesTitle: 'Password policy',
    control: new FormControl('ab1', {
      nonNullable: true,
      validators: [Validators.required, rulesValidator(passwordRules)],
    }),
  },
}

/** The same after leaving the field: unmet top-level rules turn red. */
export const NewWithRulesTouched: Story = {
  args: {
    ...NewWithRules.args,
    control: (() => {
      const control = new FormControl('ab1', {
        nonNullable: true,
        validators: [Validators.required, rulesValidator(passwordRules)],
      })
      control.markAsTouched()
      return control
    })(),
  },
}

export const WithHint: Story = {
  args: {
    hint: 'Forgot it? Reset by email.',
    control: new FormControl('', { nonNullable: true }),
  },
}

export const Disabled: Story = {
  args: {
    control: new FormControl({ value: 'secret123', disabled: true }, { nonNullable: true }),
  },
}

/** Sign-up form: email-free sketch with a password and its confirmation. */
export const InFormGroup: StoryObj = {
  render: () => {
    const form = new FormGroup({
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, rulesValidator(passwordRules)],
      }),
    })
    return {
      props: { form, rules: passwordRules, submit: () => form.markAllAsTouched() },
      template: `
        <form class="max-w-sm space-y-4 p-4" [formGroup]="form" (ngSubmit)="submit()">
          <nfk-password-field [control]="form.controls.password" label="New password" mode="new" [rules]="rules" />
          <button type="submit" class="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm">
            Sign up
          </button>
          <pre class="text-muted-foreground text-xs">valid: {{ form.valid }}</pre>
        </form>
      `,
    }
  },
}
