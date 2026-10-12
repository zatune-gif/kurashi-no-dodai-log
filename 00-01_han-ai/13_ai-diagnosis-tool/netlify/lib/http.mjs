// 共通の応答形式。成功は { ok: true, data }、失敗は { ok: false, error: { code, message, detail? } }。
// code は原因の識別子（画面・ログ・問い合わせで開発側が原因を特定する手がかり）。握りつぶさない。

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export function ok(data, status = 200) {
  return json({ ok: true, data }, status);
}

export function fail(status, code, message, { detail, headers } = {}) {
  const error = { code, message };
  if (detail) error.detail = detail;
  return json({ ok: false, error }, status, headers);
}

// 設計された診断ログ（Netlify の関数ログに出力）。
// 出すのは「どの関数／何が起きたか／識別子／時刻」のみ。API キー・サービスアカウント・メール本文・入力内容は出さない。
export function logEvent(fn, event, fields = {}) {
  console.error(JSON.stringify({ fn, event, at: new Date().toISOString(), ...fields }));
}
