function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactForm(errorMsgId) {
  // ハニーポット：人間には見えない項目。ここが埋まっていればボットとみなし黙って処理を止める
  const honeypot = document.getElementById('hp-website');
  if (honeypot && honeypot.value.trim() !== '') return null;

  const fields = [
    { id: 'company-name',  ok: v => v.length > 0 },
    { id: 'contact-name',  ok: v => v.length > 0 },
    { id: 'contact-email', ok: v => v.length > 0 && validateEmail(v) }
  ];
  const errors = fields
    .filter(f => !f.ok(document.getElementById(f.id).value.trim()))
    .map(f => f.id);

  document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
  const errEl = document.getElementById(errorMsgId);

  if (errors.length > 0) {
    errors.forEach(id => document.getElementById(id).classList.add('input-error'));
    errEl.classList.remove('hidden');
    return null;
  }
  errEl.classList.add('hidden');
  return {
    companyName: document.getElementById('company-name').value.trim(),
    contactName: document.getElementById('contact-name').value.trim(),
    email:       document.getElementById('contact-email').value.trim()
  };
}

// ── HTML エスケープ（AI の出力・利用者の入力を innerHTML に入れる前に必ず通す）──
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── 問い合わせの送信（申込み・診断結果の送信で共通）──
// 失敗を握りつぶさず、原因の識別子つきで返す。戻り値は { ok: true, data } か { ok: false, error: { code, message, detail } }
const INQUIRY_CONTACT_EMAIL = 'info@zatuneya.com';
const INQUIRY_TIMEOUT_MS = 30000;

async function postInquiry(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INQUIRY_TIMEOUT_MS);
  let res;
  try {
    res = await fetch('/api/save-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (err) {
    const timedOut = err && err.name === 'AbortError';
    return { ok: false, error: { code: timedOut ? 'CLIENT_TIMEOUT' : 'CLIENT_NETWORK', message: '', detail: err && err.name ? `error=${err.name}` : '' } };
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try { body = await res.json(); } catch (_) { body = null; }
  if (body && body.ok === true) return { ok: true, data: body.data };
  if (body && body.ok === false && body.error && body.error.code) {
    return { ok: false, error: { code: body.error.code, message: body.error.message || '', detail: body.error.detail || '' } };
  }
  // 関数が動いていない場所（GitHub Pages 等）では JSON ではない応答（404・405 等）が返る
  return { ok: false, error: { code: 'CLIENT_BAD_RESPONSE', message: '', detail: `http=${res.status}` } };
}

// 原因ごとに「何が起きたか」と「次にすること」を分ける（再送で直らないものに「再送してください」と書かない）
function describeInquiryError(error) {
  const mail = INQUIRY_CONTACT_EMAIL;
  const mailAction = `お手数ですが、会社名・担当者名・メールアドレスを添えて ${mail} までメールでご連絡ください。`;
  switch (error.code) {
    case 'CLIENT_NETWORK':
      return { title: '通信できなかったため、送信できていません。', action: 'インターネット接続をご確認のうえ、もう一度送信してください。何度も続く場合は、' + mailAction };
    case 'CLIENT_TIMEOUT':
      return { title: '送信に時間がかかり、完了を確認できていません。', action: '送信できていない可能性があります。少し時間をおいてもう一度送信してください。何度も続く場合は、' + mailAction };
    case 'CLIENT_BAD_RESPONSE':
      return { title: 'このページからは申込みを受け付けられない状態です。', action: mailAction };
    case 'RATE_LIMITED':
    case 'RATE_LIMITED_GLOBAL':
      return { title: '短時間に送信が続いたため、いったん受け付けを止めています。', action: '数分待ってから、もう一度送信してください。' };
    case 'VALIDATION_FAILED':
      return { title: '入力内容に受け付けられない部分がありました。', action: '会社名・担当者名・メールアドレス（半角・1件のみ）を確認して、もう一度送信してください。直らない場合は、' + mailAction };
    case 'INQUIRY_NOT_RECORDED':
      return { title: 'サーバー側で申込みを保存できませんでした。', action: '少し時間をおいてもう一度送信してください。続く場合は、' + mailAction };
    case 'PAYLOAD_TOO_LARGE':
    case 'INVALID_JSON':
    case 'METHOD_NOT_ALLOWED':
      return { title: '送信内容を受け付けられませんでした。', action: mailAction };
    default:
      return { title: '送信できませんでした。', action: '少し時間をおいてもう一度送信してください。続く場合は、' + mailAction };
  }
}

function hideInquiryError(boxEl) {
  if (!boxEl) return;
  boxEl.textContent = '';
  boxEl.classList.add('hidden');
}

// 送信失敗を画面内に表示する。完了画面には進めない。onRetry を渡すと「もう一度送信する」ボタンを付ける。
function showInquiryError(boxEl, error, options = {}) {
  if (!boxEl) return;
  const info = describeInquiryError(error);
  boxEl.textContent = '';

  const title = document.createElement('p');
  title.className = 'send-error__title';
  title.textContent = info.title;
  boxEl.appendChild(title);

  if (options.note) {
    const note = document.createElement('p');
    note.className = 'send-error__text';
    note.textContent = options.note;
    boxEl.appendChild(note);
  }

  const action = document.createElement('p');
  action.className = 'send-error__text';
  action.textContent = info.action;
  boxEl.appendChild(action);

  if (typeof options.onRetry === 'function') {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn-secondary send-error__retry';
    retry.textContent = 'もう一度送信する';
    retry.addEventListener('click', () => options.onRetry());
    boxEl.appendChild(retry);
  }

  const code = document.createElement('p');
  code.className = 'send-error__code';
  const when = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const detail = error.detail ? ` / ${error.detail}` : '';
  code.textContent = `エラーコード：${error.code}${detail}（${when}）。お問い合わせの際は、この表示をそのままお知らせください。`;
  boxEl.appendChild(code);

  boxEl.classList.remove('hidden');
  if (typeof boxEl.scrollIntoView === 'function') boxEl.scrollIntoView({ block: 'center' });
}
