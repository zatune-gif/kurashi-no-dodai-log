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
