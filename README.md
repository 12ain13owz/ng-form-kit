# ng-form-kit

Reactive Forms fields for Angular 22, built on [spartan/ui](https://spartan.ng) and Tailwind v4.
Each field takes its typed `FormControl` as a signal input and shows its label, hint and first
validation error.

```html
<form [formGroup]="form">
  <nfk-input-field
    [control]="form.controls.name"
    label="Name"
    hint="Friends see this on the bill"
  />
</form>
```

| Doc                      | What                                          |
| ------------------------ | --------------------------------------------- |
| [ROADMAP.md](ROADMAP.md) | What is built, what is next, locked decisions |
| [AGENTS.md](AGENTS.md)   | How to write a field, stories, code style     |

## Install in an app

The package is public on npmjs.com; no token or `.npmrc` needed:

```bash
npm install @12ain13owz/ng-form-kit @spartan-ng/brain @angular/cdk @ng-icons/core @ng-icons/lucide tw-animate-css
```

The app needs Tailwind v4 and a spartan theme (`npx ng g @spartan-ng/cli:init` sets both up). Then
tell Tailwind to scan the kit, or its classes won't be generated, in the app's global CSS:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@spartan-ng/brain/hlm-tailwind-preset.css';

@source '../node_modules/@12ain13owz/ng-form-kit';
```

(The path is relative to that CSS file.)

### Theming

The fields have no colours of their own: they use the app's spartan theme variables (`--primary`,
`--ring`, `--input`, `--border`, `--destructive`, `--foreground`, `--muted-foreground`,
`--background`). Define them in `:root` and `.dark` (or generate them with
`npx ng g @spartan-ng/cli:theme`) and the fields follow, light and dark alike.

Dark mode is the `.dark` class on `<html>`, as spartan uses it. To follow the system setting,
toggle that class from `matchMedia('(prefers-color-scheme: dark)')` (a media query alone misses
spartan's `dark:` classes).

The kit's own variables, all optional:

| Variable         | Used for                        | Default                                   |
| ---------------- | ------------------------------- | ----------------------------------------- |
| `--nfk-success`  | ✓ lines of `nfk-rule-checklist` | a green that passes WCAG AA in both modes |
| `--nfk-field-bg` | behind a floated label          | `--background`                            |

Set `--nfk-success` in both `:root` and `.dark` when you set it, e.g. when your primary colour is
green too.

### Look

Labels float inside the box by default and the hint sits on the right under it. Change either
app-wide or per field:

```ts
provideFormKit({ appearance: 'stacked', hintPosition: 'start' })
```

```html
<nfk-input-field
  [control]="form.controls.name"
  label="Name"
  appearance="stacked"
  hintPosition="start"
/>
```

On a card or any surface other than the page background, set `--nfk-field-bg` to that surface's
colour so the floated label's background matches: `<div class="bg-card [--nfk-field-bg:var(--color-card)]">`.

### Money

```html
<nfk-money-field [control]="form.controls.price" label="Price" />
```

The control holds **minor units** as an integer, or `null` when empty: satang for THB, so
฿1,234.50 is `123450`. Add and split integers, format only to show:

```ts
price = this.nnfb.control<number | null>(null, [Validators.required, moneyMin(100)]) // ≥ ฿1.00

formatMoney(123450, 'THB', 'th-TH') // '฿1,234.50'
```

Currency and locale default to `provideFormKit({ currency: 'THB', locale: 'th-TH' })`; set
`currency` / `locale` on a field for another one (decimals follow the currency: JPY has none).
`allowNegative` lets the amount go below zero.

### Select

```html
<nfk-select-field
  [control]="form.controls.payer"
  label="Paid by"
  placeholder="Choose a person"
  [options]="people"
/>
```

```ts
people: SelectOption<number>[] = [
  { value: 1, label: 'Bank' },
  { value: 2, label: 'Fah', disabled: true },
]
```

A native `<select>`, so phones show their own picker. Values keep their type (`1` stays a number);
the control is `null` until something is chosen. `clearable` lets the user pick the empty choice
again; `compareWith` matches object values.

### Checkbox

```html
<nfk-checkbox-field [control]="form.controls.splitService" label="Split the service charge too" />

<nfk-checkbox-field [control]="form.controls.agree">
  I accept the <a href="/terms">terms</a>
</nfk-checkbox-field>
```

A boolean control. For "must be ticked" use `Validators.requiredTrue` (error key `required`), with
`withMessage` for your own text.

### Passwords and rule checklists

```html
<!-- sign in -->
<nfk-password-field [control]="form.controls.password" label="Password" />

<!-- sign up: a live checklist under the field instead of a single error -->
<nfk-password-field
  [control]="form.controls.password"
  label="New password"
  mode="new"
  [rules]="rules"
/>
```

```ts
const rules: FieldRule[] = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  {
    key: 'kinds',
    label: 'At least 3 of:',
    minPassed: 3,
    children: [
      { key: 'lower', label: 'a-z', test: (v) => /[a-z]/.test(v) },
      { key: 'upper', label: 'A-Z', test: (v) => /[A-Z]/.test(v) },
      { key: 'digit', label: '0-9', test: (v) => /\d/.test(v) },
      { key: 'symbol', label: '!@#…', test: (v) => /[^A-Za-z0-9]/.test(v) },
    ],
  },
]
password = this.nnfb.control('', [Validators.required, rulesValidator(rules)])
```

Any field takes its own feedback in place of the error line through the `nfkFieldMessage` slot,
e.g. the same checklist under a username:

```html
<nfk-input-field [control]="form.controls.username" label="Username">
  <nfk-rule-checklist nfkFieldMessage [rules]="usernameRules" />
</nfk-input-field>
```

### Error messages

English messages work out of the box. To translate them, or word them your way, provide your own
in `app.config.ts`. Example with ngx-translate:

```ts
import { toSignal } from '@angular/core/rxjs-interop'
import { provideFormKit } from '@12ain13owz/ng-form-kit'

provideFormKit({
  errorMessage: (key, value) =>
    typeof value === 'string'
      ? translate.instant(value) // set with withMessage(...)
      : translate.instant(`ERRORS.${key.toUpperCase()}`, value as object),
  language: toSignal(translate.onLangChange), // re-translate on a language switch
})
```

Per field: `withMessage(Validators.required, 'NAME_REQUIRED')` keeps the `required` key but sends
your text (or translation key) as the message.

## Develop

Node **26.13.1 or newer** (`.nvmrc`); older versions are refused at install (`engine-strict`).

```bash
npm install
npm run storybook   # http://localhost:6006
```

Checks before a PR: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`,
`npm run build-storybook`. Releases: ROADMAP → Release.

## License

[MIT](LICENSE). Changes per version: [CHANGELOG.md](CHANGELOG.md).
