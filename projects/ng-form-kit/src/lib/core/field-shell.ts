import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  inject,
  InjectionToken,
  input,
} from '@angular/core'
import { BrnField, BrnFieldA11yService } from '@spartan-ng/brain/field'
import { HlmField, HlmFieldImports } from '../ui/field/src'
import { fieldErrorMessage } from './field-error'
import { FORM_KIT_CONFIG, injectText } from './form-kit-config'
import type { FieldAppearance, HintPosition } from './form-kit-config'

const SHELL_A11Y = new InjectionToken<BrnFieldA11yService>('nfk shell a11y')

/**
 * Marks content a field shows in place of its single error line, e.g. a password checklist:
 *
 * ```html
 * <nfk-input-field [control]="form.controls.username" label="Username">
 *   <nfk-rule-checklist nfkFieldMessage [rules]="usernameRules" />
 * </nfk-input-field>
 * ```
 *
 * The content always shows (it is the field's own feedback), the hint stays beside it, and it is
 * linked to the input with `aria-describedby`.
 */
@Directive({ selector: '[nfkFieldMessage]' })
export class FieldMessage {}

/**
 * The frame every field shares: label (floating or stacked), the control, and the row under it
 * with the error (or custom message) and the hint. Not used in apps; fields wrap their control in
 * it:
 *
 * ```html
 * <nfk-field-shell [label]="label()" [inputId]="inputId()" …>
 *   <input hlmInput class="peer" [id]="inputId()" … />
 * </nfk-field-shell>
 * ```
 *
 * The control must be the first element and carry `peer`, so a floating label can follow its
 * focus and empty state: an `<input>` signals empty through `:placeholder-shown`; a control without
 * a placeholder (a `<select>`) sets `data-rest="true"` while it is empty and not focused. Anything projected with `nfkFieldMessage` replaces the error line; a field
 * that re-projects it passes `hasCustomMessage`.
 */
@Component({
  selector: 'nfk-field-shell',
  imports: [HlmFieldImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: HlmField, inputs: ['orientation'] }],
  // The control (projected content) and the hint / error (this template, which look the service up
  // with `host: true` and so only see `viewProviders`) must share one spartan a11y service, so the
  // control gets `aria-describedby`. One instance under a private token, exposed to both.
  providers: [
    { provide: SHELL_A11Y, useClass: BrnFieldA11yService },
    { provide: BrnFieldA11yService, useExisting: SHELL_A11Y },
  ],
  viewProviders: [{ provide: BrnFieldA11yService, useExisting: SHELL_A11Y }],
  host: {
    class: 'group/nfk gap-0',
    '[attr.data-appearance]': 'appearanceValue()',
  },
  template: `
    @if (label() && appearanceValue() === 'stacked') {
      <label hlmFieldLabel class="mb-2" [for]="inputId()">{{ labelText() }}</label>
    }

    <div class="relative">
      <ng-content />
      @if (label() && appearanceValue() === 'floating') {
        <label
          class="pointer-events-none absolute top-0 left-3 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate rounded-sm bg-[var(--nfk-field-bg,var(--background))] px-1 text-xs leading-4 text-muted-foreground transition-all duration-150 ease-out group-data-[matches-spartan-invalid=true]/field:text-destructive peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:bg-[var(--nfk-field-bg,var(--background))] peer-focus:text-xs peer-focus:text-foreground peer-disabled:opacity-50 peer-data-[rest=true]:top-1/2 peer-data-[rest=true]:bg-transparent peer-data-[rest=true]:text-sm"
          [for]="inputId()"
        >
          {{ labelText() }}
        </label>
      }
    </div>

    @if (hasCustomMessage() || showError() || hint()) {
      <!-- Wraps: when the error and the hint don't fit on one line, the hint drops below.
           nth-last-2:mt-0 undoes spartan's field-description pull-up (-mt-1), which is meant
           for stacked descriptions, not for items side by side in this row. -->
      <div
        class="mt-1 flex flex-wrap items-start gap-x-3 gap-y-1 text-xs leading-4 group-data-[appearance=floating]/nfk:px-4 group-data-[appearance=inline]/nfk:ps-7"
      >
        @if (hint() && hintPositionValue() === 'start' && !showError() && !hasCustomMessage()) {
          <p hlmFieldDescription class="min-w-0 flex-1 text-xs leading-4 nth-last-2:mt-0">
            {{ hintText() }}
          </p>
        }
        @if (hasCustomMessage()) {
          <div
            hlmFieldDescription
            class="min-w-48 flex-[1_1_12rem] text-xs leading-4 text-current nth-last-2:mt-0"
          >
            <ng-content select="[nfkFieldMessage]" />
          </div>
        } @else {
          <hlm-field-error class="min-w-0 flex-[1_1_8rem] text-xs leading-4">{{
            error()
          }}</hlm-field-error>
        }
        @if (hint() && (hintPositionValue() === 'end' || hasCustomMessage())) {
          <p
            hlmFieldDescription
            class="ml-auto max-w-full text-right text-xs leading-4 nth-last-2:mt-0"
          >
            {{ hintText() }}
          </p>
        }
      </div>
    }
  `,
})
export class FieldShell {
  label = input('')
  hint = input('')
  /** Id of the control inside; the labels point at it. */
  inputId = input.required<string>()
  /**
   * `floating` / `stacked` as for every field; `inline` for a control that carries its own label
   * beside it (a checkbox): the shell draws no label and indents the message row past a 16px box.
   */
  appearance = input<FieldAppearance | 'inline' | null>(null)
  hintPosition = input<HintPosition | null>(null)
  /** True when the field projects `nfkFieldMessage` content through the shell. */
  hasCustomMessage = input(false)

  private config = inject(FORM_KIT_CONFIG)
  private text = injectText()
  // Label and hint go through the app's translate, so they can be translation keys.
  protected labelText = computed(() => this.text(this.label()))
  protected hintText = computed(() => this.text(this.hint()))
  private field = inject(BrnField)
  private a11y = inject(SHELL_A11Y)
  /**
   * Ids of the hint and error, for a control that can't pick up `aria-describedby` by itself (one
   * whose focusable element sits inside its own view, like spartan's checkbox).
   */
  describedBy = computed(() => this.a11y.describedBy())
  protected error = fieldErrorMessage(computed(() => this.field))

  /** The appearance in use: the input, or the app default from `provideFormKit`. */
  appearanceValue = computed(() => this.appearance() ?? this.config.appearance)
  protected hintPositionValue = computed(() => this.hintPosition() ?? this.config.hintPosition)
  protected showError = computed(
    () => !!this.field.controlState()?.spartanInvalid && this.error() !== ''
  )
}

/**
 * The placeholder a field's control needs: a floating label detects an empty control with
 * `:placeholder-shown`, so it gets a blank one when none is set. The real placeholder only shows
 * while focused; the control's classes hide it otherwise (see `input-field`).
 */
export const controlPlaceholder = (
  appearance: FieldAppearance,
  label: string,
  placeholder: string
): string => (appearance === 'floating' && label ? placeholder || ' ' : placeholder)

/** Imports a field needs for the shell and its message slot. */
export const FIELD_SHELL_IMPORTS = [FieldShell, FieldMessage] as const
