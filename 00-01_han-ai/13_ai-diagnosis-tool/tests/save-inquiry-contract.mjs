import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createHandler, isValidEmail } = require('../netlify/functions/save-inquiry.js');

let checks = 0;
const check = {
  equal(...args) {
    assert.equal(...args);
    checks++;
  },
  deepEqual(...args) {
    assert.deepEqual(...args);
    checks++;
  },
};

const validBoundaryEmail = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
check.equal(validBoundaryEmail.length, 254);

for (const email of ['owner@example.com', validBoundaryEmail]) {
  check.equal(isValidEmail(email), true, `accept valid email: ${email.length} chars`);
}

for (const email of [
  '',
  42,
  null,
  `${validBoundaryEmail}x`,
  'owner@example.com\r\nBcc:other@example.com',
  'owner@example.com,other@example.com',
  'Owner <owner@example.com>',
  'owner@example',
  '.owner@example.com',
  'owner..name@example.com',
  'owner@-example.com',
]) {
  check.equal(isValidEmail(email), false, `reject unsafe/invalid email: ${String(email).slice(0, 32)}`);
}

let sheetCalls = 0;
let emailCalls = 0;
const handler = createHandler({
  appendToSheet: async () => { sheetCalls++; },
  sendEmails: async () => { emailCalls++; },
});

function eventFor(email) {
  return {
    httpMethod: 'POST',
    body: JSON.stringify({
      type: '資料請求（診断なし）',
      companyName: 'テスト会社',
      contactName: 'テスト担当',
      email,
    }),
  };
}

for (const email of ['', 42, `${validBoundaryEmail}x`, 'owner@example.com\nCc:other@example.com', 'owner@example.com,other@example.com', 'Owner <owner@example.com>', 'owner@example']) {
  const response = await handler(eventFor(email));
  check.equal(response.statusCode, 400, `invalid email gets 400: ${String(email).slice(0, 32)}`);
  check.deepEqual(JSON.parse(response.body), { ok: false, error: 'Invalid email' });
}
check.equal(sheetCalls, 0, 'invalid email never reaches Sheets');
check.equal(emailCalls, 0, 'invalid email never reaches mail transport');

for (const email of ['owner@example.com', validBoundaryEmail]) {
  const response = await handler(eventFor(email));
  check.equal(response.statusCode, 200, `valid ${email.length}-char request reaches mocked integrations`);
  check.deepEqual(JSON.parse(response.body), { ok: true, errors: [] });
}
check.equal(sheetCalls, 2, 'each valid request reaches Sheets once');
check.equal(emailCalls, 2, 'each valid request reaches mail transport once');

console.log(`save inquiry contract: ${checks} checks PASS (external integrations mocked)`);
