/**
 * smoke-test-exports.mjs
 * Uji bahwa semua export utama arsya-baileys tersedia dan berfungsi.
 * Dijalankan sebagai bagian dari CI sebelum rilis.
 */
import * as mod from '../lib/index.js';

const REQUIRED_EXPORTS = [
  'makeWASocket',
  'useMultiFileAuthState',
  'DisconnectReason',
  'generateWAMessageFromContent',
  'prepareWAMessageMedia',
  'downloadToBuffer',
  'downloadContentFromMessageWithRetry',
  'withMediaDownloadRetry',
  'makeCacheableSignalKeyStore',
  'BufferJSON',
  'WAProto', // exported as 'proto' from Types/Message.js, re-exported as WAProto
  'generateWAMessage',
  'getUrlInfo',
  'withDecryptRetry',
];

let failed = 0;
let passed = 0;

for (const name of REQUIRED_EXPORTS) {
  try {
    if (typeof mod[name] === 'undefined') {
      console.log(`❌ MISSING export: ${name}`);
      failed++;
    } else {
      passed++;
    }
  } catch (e) {
    console.log(`❌ IMPORT ERROR: ${name} — ${e.message}`);
    failed++;
  }
}

console.log(`\n${passed}/${REQUIRED_EXPORTS.length} exports OK`);
if (failed > 0) {
  console.error(`\n${failed} export(s) missing or broken!`);
  process.exit(1);
} else {
  console.log('\n✅ All required exports present.');
}