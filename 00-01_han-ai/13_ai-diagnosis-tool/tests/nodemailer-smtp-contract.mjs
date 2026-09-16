import assert from 'node:assert/strict';
import net from 'node:net';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
const nodemailerVersion = require('nodemailer/package.json').version;
const { createHandler, sendEmails } = require('../netlify/functions/save-inquiry.js');

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
  match(...args) {
    assert.match(...args);
    checks++;
  },
  ok(...args) {
    assert.ok(...args);
    checks++;
  },
};

function decodeQuotedPrintable(value) {
  const normalized = value.replace(/=\r?\n/g, '');
  const chunks = [];

  for (let index = 0; index < normalized.length;) {
    const encoded = normalized.slice(index, index + 3);
    if (/^=[0-9A-Fa-f]{2}$/.test(encoded)) {
      chunks.push(Buffer.from([Number.parseInt(encoded.slice(1), 16)]));
      index += 3;
      continue;
    }

    const codePoint = normalized.codePointAt(index);
    const character = String.fromCodePoint(codePoint);
    chunks.push(Buffer.from(character, 'utf8'));
    index += character.length;
  }

  return Buffer.concat(chunks).toString('utf8');
}

function decodeMimeWords(value) {
  const joinedWords = value.replace(/(\?=)\s+(=\?UTF-8\?)/gi, '$1$2');
  return joinedWords.replace(/=\?UTF-8\?([BQ])\?([^?]+)\?=/gi, (_match, encoding, payload) => (
    encoding.toUpperCase() === 'B'
      ? Buffer.from(payload, 'base64').toString('utf8')
      : decodeQuotedPrintable(payload.replace(/_/g, ' '))
  ));
}

function parseMessage(raw) {
  const separator = raw.indexOf('\r\n\r\n');
  const headerText = raw.slice(0, separator).replace(/\r\n[ \t]+/g, ' ');
  const bodyText = raw.slice(separator + 4);
  const headers = new Map();

  for (const line of headerText.split('\r\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) headers.set(line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim());
  }

  const transferEncoding = headers.get('content-transfer-encoding')?.toLowerCase();
  const body = transferEncoding === 'base64'
    ? Buffer.from(bodyText.replace(/\s/g, ''), 'base64').toString('utf8')
    : transferEncoding === 'quoted-printable'
      ? decodeQuotedPrintable(bodyText)
      : bodyText;

  return {
    body,
    subject: decodeMimeWords(headers.get('subject') || ''),
  };
}

async function startSmtpServer({ rejectRecipients = false } = {}) {
  const state = {
    commands: [],
    connections: 0,
    messages: [],
  };
  const sockets = new Set();

  const server = net.createServer((socket) => {
    state.connections++;
    sockets.add(socket);
    socket.setEncoding('utf8');
    socket.write('220 localhost ESMTP ready\r\n');

    let buffer = '';
    let data = '';
    let inData = false;

    socket.on('data', (chunk) => {
      buffer += chunk;

      while (buffer.length > 0) {
        if (inData) {
          const terminator = buffer.indexOf('\r\n.\r\n');
          if (terminator === -1) return;

          data += buffer.slice(0, terminator);
          buffer = buffer.slice(terminator + 5);
          state.messages.push(data.replace(/\r\n\.\./g, '\r\n.'));
          data = '';
          inData = false;
          socket.write('250 2.0.0 accepted\r\n');
          continue;
        }

        const lineEnd = buffer.indexOf('\r\n');
        if (lineEnd === -1) return;

        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        state.commands.push(line);

        if (/^(EHLO|HELO)\b/i.test(line)) {
          socket.write('250-localhost\r\n250-8BITMIME\r\n250 SMTPUTF8\r\n');
        } else if (/^MAIL FROM:/i.test(line)) {
          socket.write('250 2.1.0 sender accepted\r\n');
        } else if (/^RCPT TO:/i.test(line)) {
          socket.write(rejectRecipients
            ? '550 5.1.1 recipient rejected\r\n'
            : '250 2.1.5 recipient accepted\r\n');
        } else if (/^DATA$/i.test(line)) {
          inData = true;
          socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
        } else if (/^RSET$/i.test(line) || /^NOOP$/i.test(line)) {
          socket.write('250 2.0.0 OK\r\n');
        } else if (/^QUIT$/i.test(line)) {
          socket.end('221 2.0.0 bye\r\n');
        } else {
          socket.write('250 2.0.0 OK\r\n');
        }
      }
    });

    socket.on('close', () => sockets.delete(socket));
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  return {
    port: server.address().port,
    state,
    async stop() {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

function localTransportFactory(port) {
  return () => nodemailer.createTransport({
    host: '127.0.0.1',
    port,
    secure: false,
    ignoreTLS: true,
  });
}

const boundaryEmail = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
const inquiry = {
  type: '無料診断',
  companyName: 'テスト株式会社',
  contactName: '花井 太郎',
  email: boundaryEmail,
  industry: '製造業',
  scale: '10〜49名',
  score: 72,
  stage: '実践ステージ',
  recommendations: [{ service: 'AI活用研修', price: '要相談' }],
  issues: ['業務の整理'],
  strengths: ['改善意欲'],
};

check.equal(nodemailerVersion, '10.0.10', 'approved Nodemailer version is installed');
check.equal(typeof sendEmails, 'function', 'production email sender is contract-testable');

const originalUser = process.env.GMAIL_USER;
const originalPassword = process.env.GMAIL_APP_PASSWORD;
process.env.GMAIL_USER = 'sender@example.com';
process.env.GMAIL_APP_PASSWORD = 'test-app-password';

try {
  let gmailOptions;
  const capturedMail = [];
  await sendEmails(inquiry, {
    createTransport(options) {
      gmailOptions = options;
      return { sendMail: async (message) => capturedMail.push(message) };
    },
  });
  check.deepEqual(gmailOptions, {
    service: 'gmail',
    auth: {
      user: 'sender@example.com',
      pass: 'test-app-password',
    },
  }, 'production Gmail transport options stay unchanged');
  check.equal(capturedMail.length, 2, 'production sender creates exactly two messages');
  check.equal(capturedMail[0].to, boundaryEmail, 'customer recipient stays the submitted email');
  check.equal(capturedMail[0].from, 'ざつね屋 <sender@example.com>', 'customer From uses the configured Gmail user');
  check.equal(capturedMail[1].to, 'zatuneya@gmail.com', 'owner recipient stays fixed');
  check.equal(capturedMail[1].from, 'ざつね屋 問い合わせ通知 <sender@example.com>',
    'owner From uses the configured Gmail user');

  const smtp = await startSmtpServer();
  try {
    await sendEmails(inquiry, { createTransport: localTransportFactory(smtp.port) });
    check.equal(smtp.state.connections, 2, 'each message uses a real localhost SMTP connection');
    check.equal(smtp.state.commands.filter((line) => /^MAIL FROM:/i.test(line)).length, 2);
    check.equal(smtp.state.commands.filter((line) => /^RCPT TO:/i.test(line)).length, 2);
    check.equal(smtp.state.commands.filter((line) => /^DATA$/i.test(line)).length, 2);
    check.equal(smtp.state.messages.length, 2, 'localhost SMTP accepted two messages');
    check.match(smtp.state.commands.find((line) => line.includes(boundaryEmail)) || '', /^RCPT TO:/i,
      '254-character valid address reaches SMTP envelope intact');

    const [customerMessage, ownerMessage] = smtp.state.messages.map(parseMessage);
    check.equal(customerMessage.subject, '【ざつね屋】お問い合わせを受け付けました');
    check.ok(customerMessage.body.includes('花井 太郎 様'), 'customer Japanese body decodes without mojibake');
    check.ok(customerMessage.body.includes('テスト株式会社'), 'customer company name decodes without mojibake');
    check.equal(ownerMessage.subject, '【新規問い合わせ】無料診断：テスト株式会社');
    check.ok(ownerMessage.body.includes('【診断スコア】72点（実践ステージ）'),
      'owner Japanese body decodes without mojibake');
  } finally {
    await smtp.stop();
  }

  const idleSmtp = await startSmtpServer();
  try {
    const handler = createHandler({
      appendToSheet: async () => {},
      sendEmails: (data) => sendEmails(data, { createTransport: localTransportFactory(idleSmtp.port) }),
    });
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ ...inquiry, email: 'Owner <owner@example.com>' }),
    });
    check.equal(response.statusCode, 400, 'unsafe email is rejected before integrations');
    check.deepEqual(JSON.parse(response.body), { ok: false, error: 'Invalid email' });
    check.equal(idleSmtp.state.connections, 0, 'invalid email opens no SMTP connection');
  } finally {
    await idleSmtp.stop();
  }

  const rejectingSmtp = await startSmtpServer({ rejectRecipients: true });
  try {
    await assert.rejects(
      sendEmails(inquiry, { createTransport: localTransportFactory(rejectingSmtp.port) }),
      (error) => error?.responseCode === 550,
      'SMTP recipient rejection propagates with response code',
    );
    checks++;
    check.equal(rejectingSmtp.state.messages.length, 0, 'rejected recipient never reaches DATA body');
    check.ok(rejectingSmtp.state.commands.some((line) => /^RCPT TO:/i.test(line)),
      'rejection is observed through a real SMTP socket');
  } finally {
    await rejectingSmtp.stop();
  }

  const handlerRejectingSmtp = await startSmtpServer({ rejectRecipients: true });
  const originalConsoleError = console.error;
  const errorLogs = [];
  try {
    console.error = (...args) => errorLogs.push(args.join(' '));
    const handler = createHandler({
      appendToSheet: async () => {},
      sendEmails: (data) => sendEmails(data, {
        createTransport: localTransportFactory(handlerRejectingSmtp.port),
      }),
    });
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(inquiry) });
    check.equal(response.statusCode, 200, 'SMTP rejection keeps the existing partial-success response');
    check.deepEqual(JSON.parse(response.body), { ok: true, errors: ['email'] });
    check.ok(errorLogs.some((line) => line.startsWith('Email error:')),
      'SMTP rejection keeps the existing diagnostic log category');
  } finally {
    console.error = originalConsoleError;
    await handlerRejectingSmtp.stop();
  }
} finally {
  if (originalUser === undefined) delete process.env.GMAIL_USER;
  else process.env.GMAIL_USER = originalUser;
  if (originalPassword === undefined) delete process.env.GMAIL_APP_PASSWORD;
  else process.env.GMAIL_APP_PASSWORD = originalPassword;
}

console.log(`Nodemailer SMTP contract: ${checks} checks PASS (localhost only, no Gmail/Sheets traffic)`);
