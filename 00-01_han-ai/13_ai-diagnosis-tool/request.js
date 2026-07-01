const $ = id => document.getElementById(id);
let contactInfo = {};

$('btn-next').addEventListener('click', () => {
  const result = validateContactForm('form-error-msg');
  if (!result) return;
  contactInfo = result;
  showScreen('screen-choice');
});

$('btn-back-to-form').addEventListener('click', () => showScreen('screen-form'));

$('btn-do-diagnosis').addEventListener('click', () => {
  sessionStorage.setItem('zatune_contact', JSON.stringify(contactInfo));
  sessionStorage.setItem('zatune_mode', 'inquiry');
  location.href = './detail.html';
});

$('btn-skip-diagnosis').addEventListener('click', () => {
  showScreen('screen-thanks');
  fetch('/.netlify/functions/save-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: '資料請求（診断なし）',
      companyName: contactInfo.companyName,
      contactName: contactInfo.contactName,
      email: contactInfo.email,
    }),
  }).catch(() => {});
});
