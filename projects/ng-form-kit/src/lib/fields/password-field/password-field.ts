import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import type { FormControl } from '@angular/forms'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide'
import { controlPlaceholder, FIELD_SHELL_IMPORTS, FieldMessage } from '../../core/field-shell'
import type { FieldRule } from '../../core/field-rules'
import { FORM_KIT_CONFIG } from '../../core/form-kit-config'
import type { FieldAppearance, HintPosition } from '../../core/form-kit-config'
import { provideFieldControl } from '../../core/field-control'
import { HlmInput } from '../../ui/input/src'
import { RuleChecklist } from '../rule-checklist/rule-checklist'

/**
 * `current`: signing in, the browser offers the saved password.
 * `new`: signing up or changing it, the browser offers to generate one.
 */
export type PasswordFieldMode = 'current' | 'new'

let nextId = 0

/**
 * A password input with a show / hide button, bound to a `FormControl` through `[control]`:
 *
 * ```html
 * <!-- sign in -->
 * <nfk-password-field [control]="form.controls.password" label="Password" />
 *
 * <!-- sign up: a live checklist instead of a single error line -->
 * <nfk-password-field [control]="form.controls.password" label="New password" mode="new" [rules]="rules" />
 * ```
 *
 * With `rules`, `nfk-rule-checklist` takes the error line's place; validate with the same rules
 * (`rulesValidator(rules)`). Look (`appearance`, `hintPosition`) and the `nfkFieldMessage` slot work
 * as in `nfk-input-field`.
 */
@Component({
  selector: 'nfk-password-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmInput, NgIcon, RuleChecklist],
  providers: [provideFieldControl(() => PasswordField), provideIcons({ lucideEye, lucideEyeOff })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nfk-field-shell
      [label]="label()"
      [hint]="hint()"
      [inputId]="inputId()"
      [appearance]="appearanceValue()"
      [hintPosition]="hintPosition()"
      [hasCustomMessage]="hasRules() || !!customMessage()"
    >
      <input
        hlmInput
        class="peer pr-11 text-foreground group-data-[appearance=floating]/nfk:h-11 group-data-[appearance=floating]/nfk:placeholder:text-transparent group-data-[appearance=floating]/nfk:focus:placeholder:text-muted-foreground"
        autocapitalize="off"
        spellcheck="false"
        [id]="inputId()"
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control()"
        [placeholder]="inputPlaceholder()"
        [attr.autocomplete]="mode() === 'new' ? 'new-password' : 'current-password'"
        [attr.aria-label]="label() ? null : ariaLabel()"
      />
      <button
        type="button"
        class="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        [attr.aria-label]="visible() ? hideLabel() : showLabel()"
        [attr.aria-pressed]="visible()"
        [attr.aria-controls]="inputId()"
        [disabled]="control().disabled"
        (click)="visible.set(!visible())"
      >
        <ng-icon size="18" aria-hidden="true" [name]="visible() ? 'lucideEyeOff' : 'lucideEye'" />
      </button>

      @if (hasRules()) {
        <nfk-rule-checklist
          nfkFieldMessage
          [rules]="rules()"
          [title]="rulesTitle()"
          [control]="control()"
        />
      }
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class PasswordField {
  /** The password control, e.g. `form.controls.password`. */
  control = input.required<FormControl<string | null>>()
  /** Visible label. Leave empty only with `ariaLabel`. */
  label = input('')
  /** Screen-reader label for a field with no visible label. */
  ariaLabel = input<string | null>(null)
  hint = input('')
  placeholder = input('')
  /** Sets `autocomplete` so password managers offer the right thing. */
  mode = input<PasswordFieldMode>('current')
  /** Rules shown as a live checklist under the field. Validate with `rulesValidator(rules)`. */
  rules = input<readonly FieldRule[]>([])
  /** Heading above the checklist, e.g. "Password policy". */
  rulesTitle = input('')
  /** Label of the button while the password is hidden. */
  showLabel = input('Show password')
  /** Label of the button while the password is shown. */
  hideLabel = input('Hide password')
  appearance = input<FieldAppearance | null>(null)
  hintPosition = input<HintPosition | null>(null)
  /** Id of the inner `<input>`; generated when not set. */
  inputId = input(`nfk-password-field-${nextId++}`)

  protected customMessage = contentChild(FieldMessage)
  protected visible = signal(false)
  private config = inject(FORM_KIT_CONFIG)
  protected hasRules = computed(() => this.rules().length > 0)
  protected appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected inputPlaceholder = computed(() =>
    controlPlaceholder(this.appearanceValue(), this.label(), this.placeholder())
  )
}
