import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { AbstractControl } from '@angular/forms'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideCheck, lucideCircle, lucideX } from '@ng-icons/lucide'
import { controlChanges, FIELD_CONTROL } from '../../core/field-control'
import { rulePasses } from '../../core/field-rules'
import type { FieldRule } from '../../core/field-rules'

/** A rule's state on screen. */
export type RuleState = 'met' | 'unmet' | 'pending'

interface RuleLine {
  key: string
  label: string
  state: RuleState
  /** A child of a group, shown indented under it. */
  nested: boolean
}

/**
 * A live checklist of rules under a field, e.g. a password policy. Each line turns green with a
 * check as soon as the typed value meets it; once the field is touched (or the form submitted),
 * top-level rules still unmet turn red with a cross. A group's children that aren't met stay
 * neutral (○), since the group may need only some of them.
 *
 * Put it in a field's message slot; it reads that field's control:
 *
 * ```html
 * <nfk-input-field [control]="form.controls.username" label="Username">
 *   <nfk-rule-checklist nfkFieldMessage [rules]="usernameRules" />
 * </nfk-input-field>
 * ```
 *
 * Use the same rules for the validator (`rulesValidator(rules)`). `nfk-password-field` builds it in
 * through its `rules` input.
 */
@Component({
  selector: 'nfk-rule-checklist',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCircle, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-live': 'polite' },
  template: `
    @if (title()) {
      <p class="mb-1 text-xs tracking-wide text-muted-foreground uppercase">{{ title() }}</p>
    }
    <ul class="space-y-1">
      @for (line of lines(); track line.key) {
        <li
          class="flex items-start gap-1.5"
          [class]="stateClass[line.state]"
          [class.pl-5]="line.nested"
          [attr.data-state]="line.state"
        >
          <ng-icon
            class="mt-px shrink-0"
            size="14"
            aria-hidden="true"
            [name]="stateIcon[line.state]"
          />
          <span>{{ line.label }}</span>
          <span class="sr-only">({{ line.state === 'met' ? metLabel() : unmetLabel() }})</span>
        </li>
      }
    </ul>
  `,
})
export class RuleChecklist {
  rules = input.required<readonly FieldRule[]>()
  /** Optional heading, e.g. "Password policy". */
  title = input('')
  /** Read by screen readers after a met line. */
  metLabel = input('met')
  /** Read by screen readers after a line not met yet. */
  unmetLabel = input('not met')
  /** The control to check. Defaults to the control of the field this checklist sits in. */
  control = input<AbstractControl | null>(null)

  private field = inject(FIELD_CONTROL, { optional: true })

  protected stateIcon: Record<RuleState, string> = {
    met: 'lucideCheck',
    unmet: 'lucideX',
    pending: 'lucideCircle',
  }
  protected stateClass: Record<RuleState, string> = {
    // Fallbacks pass WCAG AA on spartan's default light and dark backgrounds. An app with its own
    // theme sets --nfk-success (in both modes).
    met: 'text-[var(--nfk-success,oklch(0.5_0.14_150))] dark:text-[var(--nfk-success,oklch(0.76_0.15_150))]',
    unmet: 'text-destructive',
    pending: 'text-muted-foreground',
  }

  private target = computed(() => this.control() ?? this.field?.control() ?? null)

  private tick = controlChanges(this.target)

  protected lines = computed<RuleLine[]>(() => {
    this.tick()
    const control = this.target()
    const value = (control?.value ?? '') as string
    const showUnmet = !!control?.touched

    const toLine = (rule: FieldRule, nested: boolean): RuleLine => {
      const met = value !== '' && rulePasses(rule, value)
      const state: RuleState = met ? 'met' : showUnmet && !nested ? 'unmet' : 'pending'
      return { key: rule.key, label: rule.label, state, nested }
    }

    // A group's children follow it, one level deep.
    return this.rules().flatMap((rule) => [
      toLine(rule, false),
      ...(rule.children ?? []).map((child) => ({
        ...toLine(child, true),
        key: `${rule.key}.${child.key}`,
      })),
    ])
  })
}
