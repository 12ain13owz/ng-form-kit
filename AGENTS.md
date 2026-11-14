# AGENTS.md

How to write code in **ng-form-kit**. Read [`ROADMAP.md`](ROADMAP.md) first (what to build, locked
decisions). If this file disagrees with the code, the code wins — fix this file in the same change.

## Commands

Run from the repo root with Node 26.13.1 or newer (`nvm use` reads `.nvmrc`).

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

Copy the shape of `src/lib/fields/input-field/`. Every field wraps its control in
`nfk-field-shell`, which draws the label (floating or stacked), the error or custom message and the
hint, and wires `aria-describedby`. A field only adds its control and its own inputs.

```ts
@Component({
  selector: 'nfk-<name>-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput /* the helm control it uses */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nfk-field-shell
      [label]="label()"
      [hint]="hint()"
      [inputId]="inputId()"
      [appearance]="appearanceValue()"
      [hintPosition]="hintPosition()"
      [hasCustomMessage]="!!customMessage()"
    >
      <input
        hlmInput
        class="peer group-data-[appearance=floating]/nfk:h-11 group-data-[appearance=floating]/nfk:placeholder:text-transparent group-data-[appearance=floating]/nfk:focus:placeholder:text-muted-foreground"
        [id]="inputId()"
        [formControl]="boundControl()"
        [placeholder]="inputPlaceholder()"
      />
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class NameField {
  label = input('')
  hint = input('')
  placeholder = input('')
  appearance = input<FieldAppearance | null>(null)
  hintPosition = input<HintPosition | null>(null)
  inputId = input(`nfk-<name>-field-${nextId++}`)

  protected boundControl = forwardControl()
  protected customMessage = contentChild(FieldMessage)
  private config = inject(FORM_KIT_CONFIG)
  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected inputPlaceholder = computed(() =>
    controlPlaceholder(this.appearanceValue(), this.label(), this.placeholder())
  )
}
```

- **Shell:** the control is the shell's first child and has `peer` plus the floating classes above
  (copy them as they are: Tailwind only sees classes written out in full). Never draw a label,
  error or hint in a field; the shell does it, so all fields look and behave the same. Fix looks
  in `core/field-shell.ts`, once.
- **Binding:** always `forwardControl()` + `[formControl]="boundControl()"` on the inner element.
  Don't implement `ControlValueAccessor` in a field unless the inner element has no accessor of its
  own (then write one accessor and say why in the field's doc comment).
- **Don't name a field property `control`, `value` or `formControl`:** Storybook sets story args
  on the component by name and overwrites it.
- **Errors:** the shell shows `fieldErrorMessage`; never hard-code message text in a field. A field
  with built-in feedback (like `password-field`'s checklist) projects it as `nfkFieldMessage`.
- **Look:** every field has `appearance` (`floating` | `stacked`) and `hintPosition` (`start` |
  `end`), defaulting to `FORM_KIT_CONFIG`, and re-projects the `nfkFieldMessage` slot.
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

Check every story in both themes (toolbar → theme, light / dark). The a11y addon checks contrast;
a field must pass in both. Storybook's theme is spartan's default, not a brand theme: don't add
colours to it.

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
