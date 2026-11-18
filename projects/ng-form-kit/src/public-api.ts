/*
 * Public API of @workformeow-dev/ng-form-kit.
 */

// Setup and validation helpers
export * from './lib/core/form-kit-config'
export * from './lib/core/field-error'
export * from './lib/core/field-rules'
export * from './lib/core/field-control'
export * from './lib/core/money'

// Building blocks for fields (and for an app's own fields)
export * from './lib/core/field-shell'
// spartan's field directive, part of nfk-field-shell (Angular needs it exported)
export { HlmField } from './lib/ui/field/src'

// Fields
export * from './lib/fields/checkbox-field/checkbox-field'
export * from './lib/fields/input-field/input-field'
export * from './lib/fields/money-field/money-field'
export * from './lib/fields/money-field/money-input'
export * from './lib/fields/password-field/password-field'
export * from './lib/fields/rule-checklist/rule-checklist'
export * from './lib/fields/select-field/select-field'
