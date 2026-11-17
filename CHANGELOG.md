# Changelog

All notable changes to `@workformeow/ng-form-kit`. Versions follow [SemVer](https://semver.org/);
while `0.x`, a minor version may change the API.

## 0.1.0 — 2026-11-14

First release.

### Fields

- `nfk-input-field`: text, email, search, tel, url, number.
- `nfk-password-field`: its own show / hide button (Edge's built-in reveal button is hidden),
  `mode` (`current` / `new`) sets `autocomplete`, optional rules checklist.
- `nfk-money-field`: value in minor units (satang for THB) as an integer; plain number while
  focused, grouped on blur; any ISO 4217 currency.
- `nfk-select-field`: native `<select>`; values keep their type; `placeholder`, `clearable`,
  `compareWith`; the open list uses the theme's popover colours, light and dark.
- `nfk-checkbox-field`: boolean; label beside the box, from an input or projected content.

### Shared

- Every field takes its typed `FormControl` as a signal input: `[control]="form.controls.x"`.
- Every field: floating (default) or stacked label, error and hint under the box (the hint drops
  below a long error), `nfkFieldMessage` slot for custom feedback, `aria-describedby` wired.
- `provideFormKit()`: default `appearance`, `hintPosition`, `locale`, `currency`.
- Messages: `withMessage(validator(s), message | { errorKey: message })` keeps Angular's validators
  and their params; `provideFormKit({ messages, translate, language })` maps error keys to your
  i18n keys and translates everything the kit shows (labels, hints, placeholders, options too,
  so keys can be passed); `provideFormKit(() => …)` can `inject()`. Optional: without
  `translate`, text shows as passed.
  Error values shaped `{ key, params }` work as they are.
- `nfk-field-shell`, `provideFieldControl()` and `controlChanges()` for an app's own fields.
- `FieldRule[]`, `rulesValidator()`, `nfk-rule-checklist`.
- Money helpers: `formatMoney`, `formatMinorUnits`, `moneyMin`, `moneyMax`.
- No colours of its own: follows the app's spartan theme, light and dark. Kit variables
  `--nfk-success`, `--nfk-field-bg`.

### Install

`npm install @workformeow/ng-form-kit` from npmjs.com, no token.

### Requires

Angular 22, `@angular/cdk` 22, `@spartan-ng/brain` 1.9, `@ng-icons/core` + `@ng-icons/lucide`,
Tailwind CSS 4, `tw-animate-css`, rxjs 7. Development of the kit itself needs Node 26.13.1 or newer.
