import type { ValidatorFn } from '@angular/forms'

/**
 * One requirement a value must meet, shown as a line of `nfk-rule-checklist` and checked by
 * `rulesValidator`. Write the rules once and use them for both.
 *
 * A rule with `children` is a group ("Should contain:"): it passes when at least `minPassed` of
 * its children pass (all of them by default), and needs no `test` of its own.
 */
export interface FieldRule<T = string> {
  /** Stable id, reported in the validator's error. */
  key: string
  /** Text of the line. Pass it already translated. */
  label: string
  test?: (value: T) => boolean
  children?: FieldRule<T>[]
  /** For a group: how many children must pass. Defaults to all. */
  minPassed?: number
}

/** True when `value` meets `rule` (a group: enough of its children). */
export const rulePasses = <T>(rule: FieldRule<T>, value: T): boolean => {
  if (rule.children?.length) {
    const passed = rule.children.filter((child) => rulePasses(child, value)).length
    return passed >= (rule.minPassed ?? rule.children.length)
  }
  return rule.test ? rule.test(value) : true
}

/**
 * A validator from rules. Fails with `{ rules: { failed: string[] } }` listing the keys of the
 * top-level rules the value doesn't meet. An empty value passes (pair it with
 * `Validators.required`), so an empty optional field isn't flagged.
 */
export const rulesValidator =
  <T = string>(rules: readonly FieldRule<T>[]): ValidatorFn =>
  (control) => {
    const value = control.value as T
    if (value === null || value === undefined || value === '') {
      return null
    }

    const failed = rules.filter((rule) => !rulePasses(rule, value)).map((rule) => rule.key)
    return failed.length ? { rules: { failed } } : null
  }
