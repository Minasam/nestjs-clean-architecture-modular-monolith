// Severity gate for OSV-Scanner JSON output (ADR 0009).
// OSV-Scanner fails on ANY finding; our policy fails only on High/Critical (CVSS >= 7.0)
// or unknown severity, plus any licence outside the allowlist. Lower findings are reported.
// Usage: node scripts/ci/osv-gate.mjs <osv-results.json>
import { readFileSync } from 'node:fs';

const FAIL_AT = 7.0;
const file = process.argv[2];
if (!file) {
  console.error('usage: osv-gate.mjs <osv-results.json>');
  process.exit(2);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const blocking = [];
const reported = [];
const licenceViolations = [];

for (const result of report.results ?? []) {
  for (const pkg of result.packages ?? []) {
    const id = `${pkg.package.name}@${pkg.package.version}`;
    for (const group of pkg.groups ?? []) {
      const score = Number.parseFloat(group.max_severity);
      const entry = `${id}  ${group.ids.join(', ')}  severity=${group.max_severity || 'unknown'}`;
      (Number.isNaN(score) || score >= FAIL_AT ? blocking : reported).push(entry);
    }
    if (pkg.license_violations?.length) {
      licenceViolations.push(`${id}  ${pkg.license_violations.join(', ')}`);
    }
  }
}

const section = (title, items) => {
  if (items.length) console.log(`\n${title} (${String(items.length)}):\n  ${items.join('\n  ')}`);
};
section('Non-blocking vulnerabilities (below CVSS 7.0)', reported);
section('BLOCKING vulnerabilities (CVSS >= 7.0 or unknown)', blocking);
section('BLOCKING licence violations', licenceViolations);

if (blocking.length || licenceViolations.length) {
  console.log('\nFix, upgrade, or add a reasoned entry to osv-scanner.toml.');
  process.exit(1);
}
console.log('\nOSV gate passed.');
