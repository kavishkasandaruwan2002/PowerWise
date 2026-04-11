/**
 * Runs Artillery with LOADTEST_TOKEN set (avoids manual env var on Windows).
 * Usage: node scripts/runArtilleryLoadTest.js
 *   or:  npm run loadtest
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

let token;
try {
  // Strip BOM/CRLF — Node HTTP rejects those in Authorization → ERR_INVALID_CHAR under Artillery
  token = execSync('node scripts/printLoadTestJwt.js', { cwd: root, encoding: 'utf8' })
    .replace(/^\uFEFF/, '')
    .replace(/[\r\n\0]/g, '')
    .trim();
} catch (e) {
  console.error('Could not mint JWT. Run: npm run seed:loadtest-user');
  process.exit(1);
}

execSync('npx artillery run artillery.config.yml', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, LOADTEST_TOKEN: token },
});
