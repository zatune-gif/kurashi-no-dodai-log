const $ = id => document.getElementById(id);
let contactInfo = {};
let sending = false;

$('btn-next').addEventListener('click', () => {
  const result = validateContactForm('form-error-msg');
  if (!result) return;
  contactInfo = result;
  hideInquiryError($('send-error'));
  showScreen('screen-choice');
});

$('btn-back-to-form').addEventListener('click', () => {
  hideInquiryError($('send-error'));
  showScreen('screen-form');
});

$('btn-do-diagnosis').addEventListener('click', () => {
  sessionStorage.setItem('zatune_contact', JSON.stringify(contactInfo));
  sessionStorage.setItem('zatune_mode', 'inquiry');
  location.href = './detail.html';
});

// 資料請求のみ：送信が成功したときだけ完了画面を出す。失敗したら画面に残し、原因と次の手順を表示する
$('btn-skip-diagnosis').addEventListener('click', async () => {
  if (sending) return;
  sending = true;
  const btn = $('btn-skip-diagnosis');
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = '送信中…';
  hideInquiryError($('send-error'));

  const result = await postInquiry({
    type: '資料請求（診断なし）',
    companyName: contactInfo.companyName,
    contactName: contactInfo.contactName,
    email: contactInfo.email,
    website: $('hp-website') ? $('hp-website').value : ''
  });

  btn.disabled = false;
  btn.textContent = label;
  sending = false;

  if (result.ok) {
    showScreen('screen-thanks');
  } else {
    showInquiryError($('send-error'), result.error);
  }
});
