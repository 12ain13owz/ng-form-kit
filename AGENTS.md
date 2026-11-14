# AGENTS.md

How to write code in **ng-form-kit**. Read [`ROADMAP.md`](ROADMAP.md) first (what to build, locked
decisions). If this file disagrees with the code, the code wins — fix this file in the same change.

## Commands

Run from the repo root (Node 22.22+ or 24).

| Command                   | Does                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `npm run storybook`       | Storybook on http://localhost:6006                           |
| `npm run build`           | Builds the package into `dist/ng-form-kit`                   |
| `npm run build-storybook` | Static Storybook into `storybook-static/`                    |
| `npm run lint`            | ESLint                                                       |
| `npm run typecheck`       | `tsc --noEmit` for the library and the stories               |
| `npm run fix`             | ESLint `--fix` + Prettier                                    |
| `npm run helm:fix`        | After `ng g @spartan-ng/cli:ui <name>`: rewrite helm imports |

Before calling a change done: `lint`, `typecheck`, `format:check`, `build`, `build-storybook`.

## Writing a field

Copy the shape of `src/lib/fields/input-field/`.

```ts
@Component({
  selector: 'nfk-<name>-field',
  imports: [ReactiveFormsModule, HlmFieldImports /* + the helm pieces it uses */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div hlmField>
      <label hlmFieldLabel [for]="inputId()">{{ label() }}</label>
      <input hlmInput [id]="inputId()" [formControl]="boundControl()" />
      <p hlmFieldDescription>{{ hint() }}</p>
      <hlm-field-error>{{ error() }}</hlm-field-error>
    </div>
  `,
})
export class NameField {
  label = input('')
  hint = input('')
  inputId = input(`nfk-<name>-field-${nextId++}`)

  protected boundControl = forwardControl()
  private field = viewChild.required(BrnField)
  protected error = fieldErrorMessage(this.field)
}
```

- **Binding:** always `forwardControl()` + `[formControl]="boundControl()"` on the inner element.
  Don't implement `ControlValueAccessor` in a field unless the inner element has no accessor of its
  own (then write one accessor and say why in the field's doc comment).
- **Don't name a field property `control`, `value` or `formControl`:** Storybook sets story args
  on the component by name and overwrites it.
- **Errors:** `fieldErrorMessage(field)` only; never hard-code message text in a field.
- **Inputs:** `input()` / `output()` / `model()`, `booleanAttribute` for flags. Generate ids
  (`nfk-<name>-field-${nextId++}`) and allow overriding them.
- **Accessibility:** a visible label or an `ariaLabel` input; label `for` matches the inner id.
  Storybook's a11y addon fails a story on violations (`a11y.test: 'error'`).
- **Styling:** Tailwind and spartan theme tokens only (`text-muted-foreground`, `border-input`, …),
  no hard-coded colours, no component CSS files.
- **Money:** a field's value is satang (integer); format for display only.

## Stories

`<field>.stories.ts` beside the field, title `Fields/<Name> field`. Every field has: `Default`,
`WithHint`, `Required` (touched, showing the error), `Disabled`, `Readonly` where it applies, and
`InFormGroup` (`formControlName` inside `[formGroup]`, a submit button that marks all touched).
Show the control's value and state under the field so the story proves the binding.

## spartan helm (`src/lib/ui/`)

Generated code. Add a primitive with the CLI, then fix its imports:

```bash
npx ng g @spartan-ng/cli:ui <name> --defaults --interactive=false
npm run helm:fix
```

Don't hand-edit helm files except to fix a bug (note it in ROADMAP → Known issues). The CLI adds
`@spartan-ng/helm/*` paths to `tsconfig.json`; `helm:fix` removes them again. Check its new peer
dependencies and add them to `projects/ng-form-kit/package.json`.

## Code style

- TypeScript strict. No `public` keyword; `private` for internals; `protected` for template-only
  members. `import type` for types.
- Prettier (no semicolons, single quotes, width 100) and ESLint decide formatting; run `npm run fix`.
- Every exported symbol has a short doc comment saying what it is for.
- Code, comments, commits and docs in English. Replies to the owner in Thai.

## Git

- Work on a branch, one field (or one phase) per PR into `main`. Never push to `main` directly.
- Conventional Commits: `feat(input-field): ...`, `fix(core): ...`, `chore: ...`, `docs: ...`,
  with a bullet-list body.
- Releases are tags made by the owner (ROADMAP → Release).
