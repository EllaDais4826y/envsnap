import { validateSnapshot, formatValidationOutput } from './validate';

const sampleVars = {
  DATABASE_URL: 'postgres://localhost/db',
  API_KEY: 'abc123',
  DEBUG: '',
};

describe('validateSnapshot', () => {
  it('returns valid when all required keys are present and non-empty', () => {
    const result = validateSnapshot(sampleVars, {
      required: ['DATABASE_URL', 'API_KEY'],
      noEmpty: true,
    });
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.empty).toHaveLength(0);
  });

  it('reports missing required keys', () => {
    const result = validateSnapshot(sampleVars, {
      required: ['DATABASE_URL', 'SECRET_KEY'],
    });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('SECRET_KEY');
  });

  it('reports empty required keys when noEmpty is true', () => {
    const result = validateSnapshot(sampleVars, {
      required: ['DEBUG'],
      noEmpty: true,
    });
    expect(result.valid).toBe(false);
    expect(result.empty).toContain('DEBUG');
  });

  it('adds warnings for non-required empty keys when noEmpty is true', () => {
    const result = validateSnapshot(sampleVars, {
      required: ['DATABASE_URL'],
      noEmpty: true,
    });
    expect(result.warnings.some(w => w.includes('DEBUG'))).toBe(true);
  });

  it('returns valid with no rules applied', () => {
    const result = validateSnapshot(sampleVars, {});
    expect(result.valid).toBe(true);
  });
});

describe('formatValidationOutput', () => {
  it('shows success message when valid', () => {
    const output = formatValidationOutput({ valid: true, missing: [], empty: [], warnings: [] });
    expect(output).toContain('✔');
  });

  it('shows failure message and details when invalid', () => {
    const output = formatValidationOutput({
      valid: false,
      missing: ['SECRET_KEY'],
      empty: ['DEBUG'],
      warnings: ['OTHER is set but empty'],
    });
    expect(output).toContain('✘');
    expect(output).toContain('SECRET_KEY');
    expect(output).toContain('DEBUG');
    expect(output).toContain('OTHER is set but empty');
  });
});
