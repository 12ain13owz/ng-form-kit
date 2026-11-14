import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import { rulesValidator } from '../../core/field-rules'
import type { FieldRule } from '../../core/field-rules'
import { FieldMessage } from '../../core/field-shell'
import { InputField } from '../input-field/input-field'
import { RuleChecklist } from './rule-checklist'

const usernameRules: FieldRule[] = [
  { key: 'length', label: '4–20 characters', test: (v) => v.length >= 4 && v.length <= 20 },
  { key: 'chars', label: 'Only a-z, 0-9 and _', test: (v) => /^[a-z0-9_]*$/.test(v) },
  { key: 'start', label: 'Starts with a letter', test: (v) => /^[a-z]/.test(v) },
]

const meta: Meta = {
  title: 'Fields/Rule checklist',
  component: RuleChecklist,
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, InputField, RuleChecklist, FieldMessage] }),
  ],
}
export default meta

/**
 * In any field's `nfkFieldMessage` slot: the checklist replaces the error line and follows the
 * field's own control. Here a username with the same rules as its validator.
 */
export const InInputField: StoryObj = {
  render: () => ({
    props: {
      rules: usernameRules,
      control: new FormControl('1bank', {
        nonNullable: true,
        validators: rulesValidator(usernameRules),
      }),
    },
    template: `
      <div class="max-w-sm p-4">
        <nfk-input-field [control]="control" label="Username" hint="Shown to friends">
          <nfk-rule-checklist nfkFieldMessage [rules]="rules" />
        </nfk-input-field>
      </div>
    `,
  }),
}
