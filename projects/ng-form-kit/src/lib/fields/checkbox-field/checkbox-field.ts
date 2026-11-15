import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  viewChild,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import type { FormControl } from '@angular/forms'
import { FIELD_SHELL_IMPORTS, FieldMessage, FieldShell } from '../../core/field-shell'
import { injectText } from '../../core/form-kit-config'
import type { HintPosition } from '../../core/form-kit-config'
import { provideFieldControl } from '../../core/field-control'
import { HlmCheckbox } from '../../ui/checkbox/src'

let nextId = 0

/**
 * A checkbox with its label beside it, bound to a boolean `FormControl`:
 *
 * ```html
 * <nfk-checkbox-field [control]="form.controls.splitService" label="Split the service charge too" />
 *
 * <!-- rich label: project it -->
 * <nfk-checkbox-field [control]="form.controls.agree">I accept the <a href="/terms">terms</a></nfk-checkbox-field>
 * ```
 *
 * For "must be ticked", validate with `Validators.requiredTrue` (its error key is `required`; give
 * it your own text with `withMessage`). The hint and error sit under the label, indented to it;
 * the hint goes on the left unless `hintPosition` says otherwise.
 */
@Component({
  selector: 'nfk-checkbox-field',
  imports: [ReactiveFormsModule, FIELD_SHELL_IMPORTS, HlmCheckbox],
  providers: [provideFieldControl(() => CheckboxField)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nfk-field-shell
      appearance="inline"
      [hint]="hint()"
      [inputId]="inputId()"
      [hintPosition]="hintPositionValue()"
      [hasCustomMessage]="!!customMessage()"
    >
      <div class="flex items-start gap-3">
        <hlm-checkbox
          class="mt-0.5"
          [inputId]="inputId()"
          [formControl]="control()"
          [aria-label]="hasLabel() ? null : ariaText()"
          [aria-describedby]="shell()?.describedBy() ?? null"
        />
        <label
          class="cursor-pointer text-sm leading-5 text-foreground select-none group-has-[button:disabled]/field:cursor-not-allowed group-has-[button:disabled]/field:opacity-50 group-data-[matches-spartan-invalid=true]/field:text-destructive [&_a]:underline"
          [for]="inputId()"
          >{{ labelText() }}<ng-content
        /></label>
      </div>
      <ng-content select="[nfkFieldMessage]" ngProjectAs="[nfkFieldMessage]" />
    </nfk-field-shell>
  `,
})
export class CheckboxField {
  /** The ticked state. */
  control = input.required<FormControl<boolean | null>>()
  /** Text beside the box. Or project content for a label with links or formatting. */
  label = input('')
  /** Screen-reader label when there is no visible label at all. */
  ariaLabel = input<string | null>(null)
  hint = input('')
  /** Hint on the left (`start`, default here) or right (`end`). */
  hintPosition = input<HintPosition | null>(null)
  /** Id of the checkbox; generated when not set. */
  inputId = input(`nfk-checkbox-field-${nextId++}`)

  protected customMessage = contentChild(FieldMessage)
  protected shell = viewChild(FieldShell)
  /** A label from the input or projected content; without either, `ariaLabel` names the box. */
  private text = injectText()
  protected labelText = computed(() => this.text(this.label()))
  protected ariaText = computed(() => this.text(this.ariaLabel()))
  protected hasLabel = computed(() => !!this.label() || !this.ariaLabel())
  // Under a checkbox, a hint reads as a description of the label, so it starts on the left.
  protected hintPositionValue = computed(() => this.hintPosition() ?? 'start')
}
