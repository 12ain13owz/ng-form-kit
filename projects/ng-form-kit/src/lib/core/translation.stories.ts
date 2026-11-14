import { signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite'
import type { Meta, StoryObj } from '@storybook/angular-vite'
import { InputField } from '../fields/input-field/input-field'
import { MoneyField } from '../fields/money-field/money-field'
import { PasswordField } from '../fields/password-field/password-field'
import { withMessage } from './field-error'
import { rulesValidator } from './field-rules'
import type { FieldRule } from './field-rules'
import { interpolate, provideFormKit } from './form-kit-config'
import { moneyMin } from './money'

/*
 * A stand-in for an app's i18n (ngx-translate, Transloco, …): two dictionaries and a language
 * signal. In an app, `translate` and `language` come from your i18n service instead.
 */
type Lang = 'th' | 'en'
const lang = signal<Lang>('th')
const dictionaries: Record<Lang, Record<string, string>> = {
  th: {
    'ERRORS.REQUIRED': 'กรุณากรอกข้อมูล',
    'ERRORS.MIN_LENGTH': 'ต้องมีอย่างน้อย {{requiredLength}} ตัวอักษร (ตอนนี้ {{actualLength}})',
    'ERRORS.MONEY_MIN': 'ขั้นต่ำ {{minText}}',
    'BILL.ITEM': 'รายการ',
    'BILL.ITEM_REQUIRED': 'ใส่ชื่อรายการก่อนนะ',
    'BILL.PRICE': 'ราคา',
    'AUTH.PASSWORD': 'รหัสผ่านใหม่',
    'AUTH.POLICY': 'เงื่อนไขรหัสผ่าน',
    'AUTH.RULE_LENGTH': 'อย่างน้อย 8 ตัวอักษร',
    'AUTH.RULE_DIGIT': 'มีตัวเลขอย่างน้อย 1 ตัว',
    'A11Y.MET': 'ผ่านแล้ว',
    'A11Y.UNMET': 'ยังไม่ผ่าน',
    'A11Y.SHOW_PASSWORD': 'แสดงรหัสผ่าน',
    'A11Y.HIDE_PASSWORD': 'ซ่อนรหัสผ่าน',
    SAVE: 'บันทึก',
  },
  en: {
    'ERRORS.REQUIRED': 'Please fill this in.',
    'ERRORS.MIN_LENGTH': 'At least {{requiredLength}} characters (now {{actualLength}}).',
    'ERRORS.MONEY_MIN': 'At least {{minText}}.',
    'BILL.ITEM': 'Item',
    'BILL.ITEM_REQUIRED': 'Name the item first.',
    'BILL.PRICE': 'Price',
    'AUTH.PASSWORD': 'New password',
    'AUTH.POLICY': 'Password policy',
    'AUTH.RULE_LENGTH': 'At least 8 characters',
    'AUTH.RULE_DIGIT': 'At least one digit',
    'A11Y.MET': 'met',
    'A11Y.UNMET': 'not met',
    'A11Y.SHOW_PASSWORD': 'Show password',
    'A11Y.HIDE_PASSWORD': 'Hide password',
    SAVE: 'Save',
  },
}
const translate = (key: string, params: Record<string, unknown> = {}): string =>
  interpolate(dictionaries[lang()][key] ?? key, params)

const rules: FieldRule[] = [
  { key: 'length', label: 'AUTH.RULE_LENGTH', test: (v) => v.length >= 8 },
  { key: 'digit', label: 'AUTH.RULE_DIGIT', test: (v) => /\d/.test(v) },
]

const meta: Meta = {
  title: 'Guides/Translation',
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, InputField, MoneyField, PasswordField] }),
    applicationConfig({
      providers: [
        provideFormKit({
          // Error keys → translation keys. Keys left out keep the kit's English defaults.
          messages: {
            required: 'ERRORS.REQUIRED',
            minlength: 'ERRORS.MIN_LENGTH',
            moneyMin: 'ERRORS.MONEY_MIN',
            // The kit's own words (screen readers, the show / hide button) translate the same way.
            ruleMet: 'A11Y.MET',
            ruleUnmet: 'A11Y.UNMET',
            showPassword: 'A11Y.SHOW_PASSWORD',
            hidePassword: 'A11Y.HIDE_PASSWORD',
          },
          translate,
          language: lang,
        }),
      ],
    }),
  ],
}
export default meta

/**
 * Switch the language: labels (translated by the app) and error messages, rule lines and the
 * checklist title (translated by the kit through `translate`) all follow at once.
 *
 * - Item: `withMessage(Validators.required, 'BILL.ITEM_REQUIRED')`, a message of its own.
 * - Price: `moneyMin(100)` with no message of its own, so `messages.moneyMin` applies, with the
 *   validator's `minText` param.
 * - Password: Angular's `Validators.minLength(10)` untouched; `messages.minlength` gets its
 *   `requiredLength` / `actualLength` params. Rule labels are translation keys.
 */
export const SwitchLanguage: StoryObj = {
  render: () => {
    const form = new FormGroup({
      item: new FormControl('', {
        nonNullable: true,
        validators: withMessage(Validators.required, 'BILL.ITEM_REQUIRED'),
      }),
      price: new FormControl<number | null>(50, [Validators.required, moneyMin(100)]),
      password: new FormControl('abc1', {
        nonNullable: true,
        validators: [Validators.minLength(10), rulesValidator(rules)],
      }),
    })
    form.markAllAsTouched()
    return {
      props: { form, rules, lang, t: (key: string) => translate(key) },
      template: `
        <div class="max-w-sm space-y-5 p-4">
          <div class="flex gap-2" role="group" aria-label="Language">
            <button type="button" class="rounded-md border px-3 py-1 text-sm" [attr.aria-pressed]="lang() === 'th'" (click)="lang.set('th')">ไทย</button>
            <button type="button" class="rounded-md border px-3 py-1 text-sm" [attr.aria-pressed]="lang() === 'en'" (click)="lang.set('en')">English</button>
          </div>
          <nfk-input-field [control]="form.controls.item" [label]="t('BILL.ITEM')" />
          <nfk-money-field [control]="form.controls.price" [label]="t('BILL.PRICE')" />
          <nfk-password-field [control]="form.controls.password" [label]="t('AUTH.PASSWORD')" mode="new" />
          <nfk-password-field
            [control]="form.controls.password"
            [label]="t('AUTH.PASSWORD')"
            mode="new"
            [rules]="rules"
            rulesTitle="AUTH.POLICY"
          />
        </div>
      `,
    }
  },
}
