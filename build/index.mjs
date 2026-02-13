/**
 * Startup shim for @radically-straightforward/package.
 * The package tool runs `node ./build/index.mjs`; this loads the real app.
 */
process.env.NODE_ENV = "production";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../src/index.js');
