import { JsonPipe } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import { withMessage } from '../../core/field-error'
import type { HintPosition } from '../../core/form-kit-config'
import { CheckboxField } from './checkbox-field'

interface Args {
  label: string
  hint: string
  hintPosition: HintPosition
  control: FormControl<boolean>
}

const meta: Meta<Args> = {
  title: 'Fields/Checkbox field',
  component: CheckboxField,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe, CheckboxField] })],
  argTypes: {
    hintPosition: { control: 'inline-radio', options: ['start', 'end'] },
    control: { table: { disable: true } },
  },
  args: { label: 'Split the service charge too', hint: '', hintPosition: 'start' },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm space-y-4 p-4">
        <nfk-checkbox-field [formControl]="control" [label]="label" [hint]="hint" [hintPosition]="hintPosition" />
        <pre class="text-muted-foreground text-xs">value: {{ control.value | json }} · touched: {{ control.touched }}</pre>
      </div>
    `,
  }),
}
export default meta

type Story = StoryObj<Args>

export const Default: Story = {
  args: { control: new FormControl(false, { nonNullable: true }) },
}

export const Checked: Story = {
  args: {
    hint: 'Shared evenly by everyone at the table.',
    control: new FormControl(true, { nonNullable: true }),
  },
}

/** `Validators.requiredTrue` with its own message, after a submit. */
export const MustBeTicked: Story = {
  args: {
    label: 'Everyone has checked their items',
    control: (() => {
      const control = new FormControl(false, {
        nonNullable: true,
        validators: withMessage(Validators.requiredTrue, 'Tick this before you send the bill.'),
      })
      control.markAsTouched()
      return control
    })(),
  },
}

export const Disabled: Story = {
  args: { control: new FormControl({ value: true, disabled: true }, { nonNullable: true }) },
}

/** A label with a link: project it instead of `label`. */
export const ProjectedLabel: StoryObj = {
  render: () => ({
    props: {
      control: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    },
    template: `
      <div class="max-w-sm p-4">
        <nfk-checkbox-field [formControl]="control" hint="You can change this later.">
          I accept the <a href="https://example.com/terms" target="_blank">terms of use</a>
        </nfk-checkbox-field>
      </div>
    `,
  }),
}

/** SplitSlip's case: who had this item. Several boolean controls in a group. */
export const WhoAteWhat: StoryObj = {
  render: () => {
    const people = ['Bank', 'Fah', 'Mint']
    const form = new FormGroup(
      Object.fromEntries(
        people.map((name) => [name, new FormControl(name !== 'Mint', { nonNullable: true })])
      )
    )
    return {
      props: {
        form,
        people,
        eaters: () => people.filter((name) => form.value[name]).join(', ') || 'nobody',
      },
      template: `
        <form class="max-w-sm space-y-3 p-4" [formGroup]="form">
          <p class="text-sm font-medium">ต้มยำกุ้ง ฿280.00 — who had it?</p>
          @for (name of people; track name) {
            <nfk-checkbox-field [formControlName]="name" [label]="name" />
          }
          <p class="text-muted-foreground text-xs">Split between: {{ eaters() }}</p>
        </form>
      `,
    }
  },
}
