'use strict';

// ─────────────────────────────────────
// DOM参照
// ─────────────────────────────────────
const $ = id => document.getElementById(id);

const DOM = {
  btnOpenJson:         $('btn-open-json'),
  btnGenerateProposal: $('btn-generate-proposal'),
  btnGeneratePdfs:     $('btn-generate-pdfs'),
  btnGenInline:        $('btn-gen-inline'),
  btnAddLine:          $('btn-add-line'),
  btnModalClose:       $('btn-modal-close'),

  fCompany:   $('f-company'),
  fContact:   $('f-contact'),
  fEmail:     $('f-email'),
  fIndustry:  $('f-industry'),
  fScale:     $('f-scale'),

  dScore:         $('d-score'),
  dStage:         $('d-stage'),
  dCurrentState:  $('d-current-state'),
  dStrengths:     $('d-strengths'),
  dIssues:        $('d-issues'),
  dActions:       $('d-actions'),
  dCustomerType:  $('d-customer-type'),
  dMainProblem:   $('d-main-problem'),
  dDocTypes:      $('d-doc-types'),
  dTargetTasks:   $('d-target-tasks'),
  dAiTool:        $('d-ai-tool'),
  dCompanyFeature:$('d-company-feature'),
  dLibrary:       $('d-library'),

  eNumber:        $('e-number'),
  eMonitor:       $('e-monitor'),
  eSubsidy:       $('e-subsidy'),
  eLineItems:     $('e-line-items'),
  eSubtotal:      $('e-subtotal'),
  eTax:           $('e-tax'),
  eTotal:         $('e-total'),
  eSubsidyPreview:$('e-subsidy-preview'),
  eSubsidyAmt:    $('e-subsidy-amt'),
  eClientBurden:  $('e-client-burden'),
  eRecs:          $('e-recommendations'),

  pSection1:      $('p-section1'),
  pSection2:      $('p-section2'),
  pGenerating:    $('p-generating'),

  statusBar:      $('status-bar'),
  modalDone:      $('modal-done'),
  modalBody:      $('modal-body')
};

// ─────────────────────────────────────
// 状態
// ─────────────────────────────────────
let loadedData = null;

// ─────────────────────────────────────
// タブ切り替え
// ─────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
});

// ─────────────────────────────────────
// JSON読み込み
// ─────────────────────────────────────
DOM.btnOpenJson.addEventListener('click', async () => {
  setStatus('読み込み中...');
  const data = await window.api.openJson();
  if (!data) { setStatus('キャンセルされました'); return; }

  loadedData = data;
  populateAll(data);
  DOM.btnGenerateProposal.disabled = false;
  DOM.btnGeneratePdfs.disabled = false;
  setStatus(`読み込み完了：${data.client?.companyName || '（会社名未設定）'}`);
});

// ─────────────────────────────────────
// データをUIに反映
// ─────────────────────────────────────
function populateAll(data) {
  const c = data.client || {};
  const d = data.diagnosis || {};

  // クライアント情報
  DOM.fCompany.value  = c.companyName  || '';
  DOM.fContact.value  = c.contactName  || '';
  DOM.fEmail.value    = c.email        || '';
  DOM.fIndustry.value = d.industry     || '';
  DOM.fScale.value    = d.scale        || '';

  // 診断結果タブ
  DOM.dScore.textContent        = d.score ?? '—';
  DOM.dStage.textContent        = d.stage || '—';
  DOM.dCurrentState.textContent = d.currentState || '';

  DOM.dStrengths.value = (d.strengths || []).join('\n');
  DOM.dIssues.value    = (d.issues    || []).join('\n');
  DOM.dActions.value   = (data.actions || []).join('\n');

  DOM.dCustomerType.textContent   = d.customerType    || '—';
  DOM.dMainProblem.textContent    = d.mainProblem     || '—';
  DOM.dDocTypes.textContent       = (d.documentTypes  || []).join('、') || '—';
  DOM.dTargetTasks.textContent    = (d.targetTasks    || []).join('、') || '—';
  DOM.dAiTool.textContent         = d.aiTool          || '—';
  DOM.dCompanyFeature.textContent = d.companyFeature  || '—';

  // ライブラリ
  const prompts = data.libraryPrompts || [];
  if (prompts.length) {
    DOM.dLibrary.innerHTML = prompts.map(p => `
      <div class="lib-card">
        <div class="lib-tag">${esc(p.task)}</div>
        <div class="lib-title">${esc(p.title)}</div>
        <pre class="lib-prompt">${esc(p.prompt)}</pre>
      </div>`).join('');
  } else {
    DOM.dLibrary.innerHTML = '<p class="empty-msg">プロンプトライブラリが含まれていません</p>';
  }

  // 見積書タブ：推奨プラン
  const recs = data.recommendations || [];
  if (recs.length) {
    DOM.eRecs.innerHTML = recs.map(r => `
      <div class="rec-card">
        <div class="rec-rank">${r.rank === 1 ? 'メインプラン' : 'サブプラン'}</div>
        <div class="rec-service">${esc(r.service)}</div>
        <div class="rec-price">${esc(r.price)}</div>
        <div class="rec-reason">${esc(r.reason)}</div>
      </div>`).join('');
  }

  // 見積明細：推奨プランから1行プリセット
  clearLineItems();
  if (recs[0]) {
    const price = parsePriceStr(recs[0].price);
    addLineItem(recs[0].service, '', price);
  }

  // 見積番号自動生成
  const now = new Date();
  DOM.eNumber.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-001`;

  calcTotals();
}

// ─────────────────────────────────────
// 見積明細管理
// ─────────────────────────────────────
DOM.btnAddLine.addEventListener('click', () => {
  addLineItem('', '', 0);
});

function clearLineItems() {
  DOM.eLineItems.innerHTML = `
    <div class="line-items-header">
      <span>サービス・コース</span>
      <span>プラン</span>
      <span style="text-align:right">金額（税別）</span>
      <span></span>
    </div>`;
}

function addLineItem(service = '', plan = '', price = 0) {
  const row = document.createElement('div');
  row.className = 'line-item';
  row.innerHTML = `
    <input type="text" placeholder="サービス名" value="${esc(service)}" class="service-input">
    <input type="text" placeholder="プラン" value="${esc(plan)}" class="plan-input">
    <input type="number" placeholder="0" value="${price}" class="price-input" min="0" step="1000">
    <button class="btn-remove" title="削除">✕</button>`;

  row.querySelector('.btn-remove').addEventListener('click', () => {
    row.remove();
    calcTotals();
  });
  row.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', calcTotals);
  });

  DOM.eLineItems.appendChild(row);
  calcTotals();
}

// ─────────────────────────────────────
// 合計計算
// ─────────────────────────────────────
function calcTotals() {
  const rows = DOM.eLineItems.querySelectorAll('.line-item');
  const subtotal = Array.from(rows).reduce((sum, row) => {
    return sum + (Number(row.querySelector('.price-input').value) || 0);
  }, 0);

  const applyMonitor = DOM.eMonitor.checked;
  const adjustedSubtotal = applyMonitor ? Math.round(subtotal * 0.7) : subtotal;
  const tax   = Math.round(adjustedSubtotal * 0.1);
  const total = adjustedSubtotal + tax;

  DOM.eSubtotal.textContent = fmtNum(adjustedSubtotal) + '円';
  DOM.eTax.textContent      = fmtNum(tax)              + '円';
  DOM.eTotal.textContent    = fmtNum(total)            + '円';

  const subsidyAmt   = Math.round(adjustedSubtotal * 0.75);
  const clientBurden = adjustedSubtotal - subsidyAmt;
  DOM.eSubsidyAmt.textContent   = fmtNum(subsidyAmt)   + '円';
  DOM.eClientBurden.textContent = fmtNum(clientBurden) + '円（税別）';

  DOM.eSubsidyPreview.style.display = DOM.eSubsidy.checked ? 'block' : 'none';
}

DOM.eMonitor.addEventListener('change', calcTotals);
DOM.eSubsidy.addEventListener('change', calcTotals);

// ─────────────────────────────────────
// 提案書生成（Claude API）
// ─────────────────────────────────────
async function generateProposal() {
  if (!loadedData) { setStatus('先にJSONを読み込んでください'); return; }

  DOM.pGenerating.classList.remove('hidden');
  DOM.btnGenerateProposal.disabled = true;
  DOM.btnGenInline.disabled = true;
  setStatus('Claude APIで提案書を生成中...');

  try {
    const diagData = buildDiagData();
    const text = await window.api.generateProposal(diagData);
    splitProposalSections(text);
    setStatus('提案書の生成完了。内容を確認・編集してください。');
  } catch (e) {
    setStatus('生成エラー：' + e.message);
  } finally {
    DOM.pGenerating.classList.add('hidden');
    DOM.btnGenerateProposal.disabled = false;
    DOM.btnGenInline.disabled = false;
  }
}

DOM.btnGenerateProposal.addEventListener('click', generateProposal);
DOM.btnGenInline.addEventListener('click', generateProposal);

// Claude APIの出力をセクション1・2に分割
function splitProposalSections(text) {
  const sec1Match = text.match(/##\s*1[^\n]*\n([\s\S]*?)(?=##\s*2|$)/);
  const sec2Match = text.match(/##\s*2[\s\S]*/);

  if (sec1Match) DOM.pSection1.value = sec1Match[1].trim();
  if (sec2Match) DOM.pSection2.value = sec2Match[0].replace(/^##\s*2[^\n]*\n/, '').trim();

  if (!sec1Match && !sec2Match) {
    DOM.pSection1.value = text;
  }
}

// ─────────────────────────────────────
// PDF生成
// ─────────────────────────────────────
DOM.btnGeneratePdfs.addEventListener('click', async () => {
  const companyName = DOM.fCompany.value.trim();
  if (!companyName) {
    setStatus('会社名を入力してください');
    return;
  }

  DOM.btnGeneratePdfs.disabled = true;
  setStatus('PDF生成中...');

  try {
    const payload = {
      clientData:   buildClientData(),
      diagData:     buildDiagData(),
      estimateData: buildEstimateData(),
      proposalData: buildProposalData()
    };

    const result = await window.api.generatePdfs(payload);

    if (result.ok) {
      DOM.modalBody.innerHTML = result.results.map(r =>
        `<div>✅ ${esc(r.name)} → <span style="color:var(--accent)">${esc(r.path)}</span></div>`
      ).join('') + `<div style="margin-top:10px;font-size:11px">フォルダを自動で開きます。</div>`;
      DOM.modalDone.classList.remove('hidden');
      setStatus('PDF生成完了：' + result.outputDir);
    }
  } catch (e) {
    setStatus('PDF生成エラー：' + e.message);
  } finally {
    DOM.btnGeneratePdfs.disabled = false;
  }
});

DOM.btnModalClose.addEventListener('click', () => {
  DOM.modalDone.classList.add('hidden');
});

// ─────────────────────────────────────
// データ収集ヘルパー
// ─────────────────────────────────────
function buildClientData() {
  return {
    companyName: DOM.fCompany.value.trim(),
    contactName: DOM.fContact.value.trim(),
    email:       DOM.fEmail.value.trim()
  };
}

function buildDiagData() {
  const base = loadedData || {};
  return {
    client: buildClientData(),
    diagnosis: {
      score:          base.diagnosis?.score,
      stage:          base.diagnosis?.stage,
      currentState:   base.diagnosis?.currentState,
      goal:           base.diagnosis?.goal,
      strengths:      DOM.dStrengths.value.split('\n').filter(Boolean),
      issues:         DOM.dIssues.value.split('\n').filter(Boolean),
      industry:       DOM.fIndustry.value.trim() || base.diagnosis?.industry || '',
      scale:          DOM.fScale.value.trim()    || base.diagnosis?.scale    || '',
      customerType:   base.diagnosis?.customerType   || '',
      documentTypes:  base.diagnosis?.documentTypes  || [],
      staffSkill:     base.diagnosis?.staffSkill     || '',
      mainProblem:    base.diagnosis?.mainProblem    || '',
      companyFeature: base.diagnosis?.companyFeature || '',
      targetTasks:    base.diagnosis?.targetTasks    || [],
      aiTool:         base.diagnosis?.aiTool         || '',
      tone:           base.diagnosis?.tone           || '',
      scope:          base.diagnosis?.scope          || ''
    },
    recommendations: base.recommendations || [],
    libraryPrompts:  base.libraryPrompts  || [],
    actions:         DOM.dActions.value.split('\n').filter(Boolean)
  };
}

function buildEstimateData() {
  const rows = DOM.eLineItems.querySelectorAll('.line-item');
  const lineItems = Array.from(rows).map(row => ({
    service: row.querySelector('.service-input').value.trim(),
    plan:    row.querySelector('.plan-input').value.trim(),
    price:   Number(row.querySelector('.price-input').value) || 0
  }));

  const applyMonitor = DOM.eMonitor.checked;
  if (applyMonitor) {
    lineItems.forEach(item => { item.price = Math.round(item.price * 0.7); });
  }

  return {
    estimateNumber: DOM.eNumber.value.trim(),
    lineItems,
    applyMonitor,
    applySubsidy: DOM.eSubsidy.checked
  };
}

function buildProposalData() {
  return {
    section1: DOM.pSection1.value.trim(),
    section2: DOM.pSection2.value.trim()
  };
}

// ─────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────
function setStatus(msg) {
  DOM.statusBar.textContent = msg;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('ja-JP');
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parsePriceStr(str) {
  if (!str) return 0;
  const m = str.match(/([\d,]+)円/);
  if (!m) return 0;
  return Number(m[1].replace(/,/g, ''));
}

// ─────────────────────────────────────
// 初期化
// ─────────────────────────────────────
clearLineItems();
calcTotals();
setStatus('JSON未読み込み　—　「JSONを読み込む」または各フィールドを手動入力してください');
