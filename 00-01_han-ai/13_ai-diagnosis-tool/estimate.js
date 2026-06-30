const $ = id => document.getElementById(id);

$('btn-start').addEventListener('click', () => {
  const result = validateContactForm('form-error-msg');
  if (!result) return;
  sessionStorage.setItem('zatune_contact', JSON.stringify(result));
  sessionStorage.setItem('zatune_mode', 'estimate');
  location.href = './detail.html';
});
