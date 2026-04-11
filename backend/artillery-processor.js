/**
 * Injects Bearer token for Artillery without POST /login on every VU (avoids bcrypt overload).
 * Priority: LOADTEST_TOKEN env → one-time mint via printLoadTestJwt.js (cached per worker).
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname);
let cachedToken;

/** Node's HTTP client rejects header values containing \\r, \\n, or non-latin1 chars → ERR_INVALID_CHAR */
function sanitizeJwtForHeader(raw) {
  return String(raw)
    .replace(/^\uFEFF/, '') // BOM
    .replace(/[\r\n\0]/g, '')
    .trim();
}

function resolveToken() {
  const fromEnv = sanitizeJwtForHeader(process.env.LOADTEST_TOKEN || '');
  if (fromEnv) return fromEnv;
  if (cachedToken) return cachedToken;
  cachedToken = sanitizeJwtForHeader(
    execSync('node scripts/printLoadTestJwt.js', {
      cwd: root,
      encoding: 'utf8',
    })
  );
  return cachedToken;
}

module.exports = {
  loadTokenFromEnv(context, events, done) {
    try {
      const t = resolveToken();
      if (!t) {
        return done(new Error('JWT is empty. Run: npm run seed:loadtest-user && node scripts/printLoadTestJwt.js'));
      }
      context.vars.token = t;
      return done();
    } catch (e) {
      return done(
        new Error(
          `Could not get JWT: ${e.message}. Run: npm run seed:loadtest-user`
        )
      );
    }
  },

  /** Unique timestamp per request so concurrent readings are not identical rows if your DB adds constraints later */
  setFreshReadingDate(context, events, done) {
    context.vars.readingDate = new Date().toISOString();
    return done();
  },
};
