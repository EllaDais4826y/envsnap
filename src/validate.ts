import { loadSnapshot } from './snapshot';

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  empty: string[];
  warnings: string[];
}

export interface ValidationRule {
  required?: string[];
  noEmpty?: boolean;
}

export function validateSnapshot(
  vars: Record<string, string>,
  rules: ValidationRule
): ValidationResult {
  const missing: string[] = [];
  const empty: string[] = [];
  const warnings: string[] = [];

  if (rules.required) {
    for (const key of rules.required) {
      if (!(key in vars)) {
        missing.push(key);
      } else if (rules.noEmpty && vars[key].trim() === '') {
        empty.push(key);
      }
    }
  }

  if (rules.noEmpty) {
    for (const [key, value] of Object.entries(vars)) {
      if (value.trim() === '' && !empty.includes(key)) {
        warnings.push(`${key} is set but empty`);
      }
    }
  }

  return {
    valid: missing.length === 0 && empty.length === 0,
    missing,
    empty,
    warnings,
  };
}

export function formatValidationOutput(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✔ Snapshot is valid.');
  } else {
    lines.push('✘ Snapshot validation failed.');
  }

  if (result.missing.length > 0) {
    lines.push(`\nMissing required keys (${result.missing.length}):`);
    for (const key of result.missing) lines.push(`  - ${key}`);
  }

  if (result.empty.length > 0) {
    lines.push(`\nEmpty required keys (${result.empty.length}):`);
    for (const key of result.empty) lines.push(`  - ${key}`);
  }

  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`);
    for (const w of result.warnings) lines.push(`  ! ${w}`);
  }

  return lines.join('\n');
}
