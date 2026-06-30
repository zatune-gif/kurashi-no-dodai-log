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
  const subject = encodeURIComponent(`資料請求（${contactInfo.companyName}）`);
  const body = encodeURIComponent([
    '資料請求がありました。',
    '',
    `【会社名】${contactInfo.companyName}`,
    `【担当者】${contactInfo.contactName}`,
    `【返送先メール】${contactInfo.email}`,
    '',
    '詳細診断なし・資料のみご送付ください。'
  ].join('\n'));
  window.location.href = `mailto:zatuneya@gmail.com?subject=${subject}&body=${body}`;
  showScreen('screen-thanks');
});
