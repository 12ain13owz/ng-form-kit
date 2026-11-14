# Changelog

All notable changes to `@12ain13owz/ng-form-kit`. Versions follow [SemVer](https://semver.org/);
while `0.x`, a minor version may change the API.

## 0.1.0 — 2026-11-14

First release.

### Fields

- `nfk-input-field`: text, email, search, tel, url, number.
- `nfk-password-field`: show / hide button, `mode` (`current` / `new`) sets `autocomplete`,
  optional rules checklist.
- `nfk-money-field`: value in minor units (satang for THB) as an integer; plain number while
  focused, grouped on blur; any ISO 4217 currency.
- `nfk-select-field`: native `<select>`; values keep their type; `placeholder`, `clearable`,
  `compareWith`.
- `nfk-checkbox-field`: boolean; label beside the box, from an input or projected content.

### Shared

- Every field: floating (default) or stacked label, error and hint under the box (the hint drops
  below a long error), `nfkFieldMessage` slot for custom feedback, `aria-describedby` wired.
- `provideFormKit()`: error messages (English defaults), `language` signal, default
  `appearance`, `hintPosition`, `locale`, `currency`.
- `withMessage()`, `forwardControl()`, `nfk-field-shell` for an app's own fields.
- `FieldRule[]`, `rulesValidator()`, `nfk-rule-checklist`.
- Money helpers: `formatMoney`, `formatMinorUnits`, `moneyMin`, `moneyMax`.
- No colours of its own: follows the app's spartan theme, light and dark. Kit variables
  `--nfk-success`, `--nfk-field-bg`.

### Requires

Angular 22, `@angular/cdk` 22, `@spartan-ng/brain` 1.9, `@ng-icons/core` + `@ng-icons/lucide`,
Tailwind CSS 4, `tw-animate-css`, rxjs 7. Development of the kit itself needs Node 26.13.1 or newer.
