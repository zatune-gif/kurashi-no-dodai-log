const QUESTIONS = [
  // ── ブロック1：現状のIT活用 ──
  {
    id: 1, block: 1, blockName: "現状のIT活用",
    text: "現在メインで使っているツールは？",
    options: [
      { text: "紙・手書きがメイン", score: 0 },
      { text: "Excel / Word がメイン", score: 3 },
      { text: "クラウドツールを活用している（Google Workspace等）", score: 7 },
      { text: "業務システム＋クラウド両方を活用している", score: 10 }
    ],
    highStrength: "デジタルツールの活用基盤が整っている",
    lowIssue: "デジタルツールの基盤整備から始める必要があります"
  },
  {
    id: 2, block: 1, blockName: "現状のIT活用",
    text: "新しいデジタルツールを社内に導入したとき、定着させられましたか？",
    options: [
      { text: "導入自体ほとんどしたことがない", score: 0 },
      { text: "導入したが定着しなかったことが多い", score: 3 },
      { text: "半分くらいは定着できた", score: 7 },
      { text: "ほぼ問題なく定着させられた", score: 10 }
    ],
    highStrength: "ツール導入・定着のノウハウが社内に蓄積されている",
    lowIssue: "ツール定着の仕組みづくり（研修・ルール化）が必要です"
  },
  {
    id: 3, block: 1, blockName: "現状のIT活用",
    text: "社外との情報共有・リモート対応の仕組みはありますか？",
    options: [
      { text: "まったくない", score: 0 },
      { text: "メールのみ", score: 3 },
      { text: "クラウドストレージや共有ツールがある", score: 7 },
      { text: "業務に合った仕組みが整っている", score: 10 }
    ],
    highStrength: "社外連携・情報共有の仕組みが整っている",
    lowIssue: "社外との情報共有インフラの整備が課題です"
  },
  // ── ブロック2：業務課題 ──
  {
    id: 4, block: 2, blockName: "業務課題",
    text: "特定の担当者しかできない業務（属人化）はどの程度ありますか？",
    options: [
      { text: "ほぼすべての業務が属人化している", score: 0 },
      { text: "重要業務の半分以上が属人化している", score: 3 },
      { text: "一部ある程度", score: 7 },
      { text: "ほぼ仕組み化・マニュアル化できている", score: 10 }
    ],
    highStrength: "業務の仕組み化・マニュアル化が進んでいる",
    lowIssue: "業務の属人化解消が優先課題です"
  },
  {
    id: 5, block: 2, blockName: "業務課題",
    text: "データ入力・書類作成など繰り返しの定型作業にかかる時間は？",
    options: [
      { text: "業務時間の半分以上を占めている", score: 0 },
      { text: "かなり多い（3〜4割程度）", score: 3 },
      { text: "少し多いと感じる", score: 7 },
      { text: "最小限に抑えられている", score: 10 }
    ],
    highStrength: "定型作業が効率化され、本質業務に時間を使えている",
    lowIssue: "定型作業の自動化・効率化でAIが最も力を発揮できます"
  },
  {
    id: 6, block: 2, blockName: "業務課題",
    text: "業務マニュアル・手順書は整備されていますか？",
    options: [
      { text: "ほぼない", score: 0 },
      { text: "一部あるが古いまま更新されていない", score: 3 },
      { text: "主要業務はある", score: 7 },
      { text: "定期的に更新・整備されている", score: 10 }
    ],
    highStrength: "業務マニュアルが整備され、ナレッジが組織の資産になっている",
    lowIssue: "マニュアル整備が先決です（AIがマニュアル作成を大幅に支援できます）"
  },
  {
    id: 7, block: 2, blockName: "業務課題",
    text: "社内の情報共有で困っていることはありますか？",
    options: [
      { text: "深刻な問題がある（情報が伝わらない・ロスが多い）", score: 0 },
      { text: "よく困ることがある", score: 3 },
      { text: "時々困る程度", score: 7 },
      { text: "特に問題ない", score: 10 }
    ],
    highStrength: "社内の情報流通が円滑で、チーム連携がスムーズ",
    lowIssue: "社内情報共有の仕組みを整えることがAI活用の前提になります"
  },
  // ── ブロック3：AIへの認知と意欲 ──
  {
    id: 8, block: 3, blockName: "AIへの認知と意欲",
    text: "ChatGPTやClaudeなどのAIツールを業務で試したことはありますか？",
    options: [
      { text: "名前も知らない", score: 0 },
      { text: "知っているが使ったことはない", score: 3 },
      { text: "個人的に試したことはある", score: 7 },
      { text: "業務で定期的に活用している", score: 10 }
    ],
    highStrength: "AIツールへの理解と実践経験がある",
    lowIssue: "まずAIツールを体験することが最初のステップです"
  },
  {
    id: 9, block: 3, blockName: "AIへの認知と意欲",
    text: "AIで解決したい業務や削減したい作業はイメージできますか？",
    options: [
      { text: "まったくイメージできない", score: 0 },
      { text: "なんとなくはある", score: 3 },
      { text: "具体的な業務がいくつか思い浮かぶ", score: 7 },
      { text: "優先順位もつけて明確にイメージできる", score: 10 }
    ],
    highStrength: "AI活用の目的意識が明確で、具体的なアクションに移りやすい",
    lowIssue: "まず業務課題を棚卸しし、AIが使える箇所を一緒に特定しましょう"
  },
  {
    id: 10, block: 3, blockName: "AIへの認知と意欲",
    text: "AI・IT導入に割ける月次予算のイメージはありますか？",
    options: [
      { text: "予算を割く余裕はない", score: 0 },
      { text: "少額なら（〜1万円／月程度）", score: 3 },
      { text: "ある程度は（1〜5万円／月程度）", score: 7 },
      { text: "効果次第で柔軟に対応できる", score: 10 }
    ],
    highStrength: "投資への柔軟な姿勢があり、効果的な施策を選びやすい",
    lowIssue: "まず無料ツールから始め、効果を確認してから投資を検討できます"
  },
  // ── ブロック4：組織・推進力 ──
  {
    id: 11, block: 4, blockName: "組織・推進力",
    text: "デジタル化・AI活用を推進できる人材は社内にいますか？",
    options: [
      { text: "まったくいない", score: 0 },
      { text: "関心のある人はいるが専任ではない", score: 3 },
      { text: "部分的に担える人がいる", score: 7 },
      { text: "専任または準専任の担当者がいる", score: 10 }
    ],
    highStrength: "DX・AI推進を担える人材が社内にいる",
    lowIssue: "推進役の育成または外部サポートの活用が鍵になります"
  },
  {
    id: 12, block: 4, blockName: "組織・推進力",
    text: "新しいツール・施策導入の意思決定スピードは？",
    options: [
      { text: "決まるまでに数ヶ月以上かかる", score: 0 },
      { text: "1〜2ヶ月程度", score: 3 },
      { text: "数週間程度", score: 7 },
      { text: "必要と判断したらすぐ動ける", score: 10 }
    ],
    highStrength: "意思決定が速く、スピード感のある改善が可能",
    lowIssue: "まず小さく始めて成果を見せ、意思決定を加速する流れを作りましょう"
  }
];

const STAGE_INFO = {
  準備期: {
    badgeClass: "badge-prep",
    currentState: "業務が属人化・デジタル基盤が弱い状態です。まず土台を整えることが先決です。",
    goal: "業務を言語化・可視化し、誰でも動ける土台を作る"
  },
  導入期: {
    badgeClass: "badge-intro",
    currentState: "AIを知っているが、業務で使えていない状態です。小さな成功体験が次につながります。",
    goal: "1〜2個の業務でAIを体験し、小さな成功体験を作る"
  },
  活用期: {
    badgeClass: "badge-use",
    currentState: "一部でAIを活用できています。この経験を社内に広げる段階です。",
    goal: "複数業務にAIを組み込み、時間削減を実感・定着させる"
  },
  推進期: {
    badgeClass: "badge-advance",
    currentState: "AI活用が進んでいます。仕組みとして根付かせ、自走できる状態を目指しましょう。",
    goal: "社内にAI文化が根付き、自走できる仕組みを完成させる"
  }
};

const FALLBACK_ACTIONS = {
  準備期: [
    "今週1週間、業務の「よく繰り返す作業」をリストアップしてみましょう。箇条書きで十分です。",
    "ChatGPTの無料版で、日常業務のメール下書きや報告書作成を試してみましょう。",
    "社内の主要業務を1つ選び、手順を箇条書きにするところからマニュアル化を始めましょう。"
  ],
  導入期: [
    "週1回、特定の業務（議事録・報告書等）でAIを必ず使う「AI曜日」を設けてみましょう。",
    "ChatGPT / Claude の有料プランへのアップグレードを試し、業務品質の変化を確認しましょう。",
    "社内で最も時間がかかっている定型作業を1つ選び、AI化の実験を始めてみましょう。"
  ],
  活用期: [
    "AIをすでに使っている業務の「プロンプト集」を作り、社内メンバーと共有しましょう。",
    "他の部署・担当者にAI活用事例を横展開する短時間の勉強会を開催しましょう。",
    "AI活用の効果（時間削減・品質向上）を数値で記録し、さらなる投資の判断材料にしましょう。"
  ],
  推進期: [
    "社内AI活用ガイドラインを作成し、全社的な取り組みとして正式に位置づけましょう。",
    "AI活用を採用・育成にも組み込み、「AIが使える会社」としてブランド化を検討しましょう。",
    "外部パートナーと連携し、自社業務に特化したAIソリューションの導入を検討しましょう。"
  ]
};

// ── 定数 ──
const MAX_SCORE = QUESTIONS.length * 10;

// ── DOM キャッシュ ──
const DOM = {
  blockLabel:    document.getElementById('block-label'),
  counter:       document.getElementById('question-counter'),
  progressBar:   document.getElementById('progress-bar'),
  questionText:  document.getElementById('question-text'),
  optionsWrap:   document.getElementById('options'),
  btnBack:       document.getElementById('btn-back'),
  btnNext:       document.getElementById('btn-next'),
  scoreCard:     document.getElementById('score-card'),
  scoreNumber:   document.getElementById('score-number'),
  stageBadge:    document.getElementById('stage-badge'),
  currentState:  document.getElementById('current-state-text'),
  stageGoal:     document.getElementById('stage-goal-text'),
  strengthsCard: document.getElementById('strengths-card'),
  strengthsList: document.getElementById('strengths-list'),
  issuesCard:    document.getElementById('issues-card'),
  issuesList:    document.getElementById('issues-list'),
  actionsList:   document.getElementById('actions-list'),
  btnCta:        document.querySelector('.btn-cta'),
};

// ── 状態 ──
let currentIndex = 0;
let answers = [];

// showScreen は utils.js で定義

// ── クイズ描画 ──
function renderQuestion() {
  const q = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;
  const current = answers[currentIndex];

  DOM.blockLabel.textContent = `ブロック${q.block}：${q.blockName}`;
  DOM.counter.textContent = `${currentIndex + 1} / ${total}`;
  DOM.progressBar.style.width = `${(currentIndex / total) * 100}%`;
  DOM.questionText.textContent = q.text;

  DOM.optionsWrap.innerHTML = q.options.map((opt, i) =>
    `<button class="option-btn${current?.optionIndex === i ? ' selected' : ''}" data-index="${i}">${opt.text}</button>`
  ).join('');

  DOM.btnNext.disabled = !current;
  DOM.btnNext.textContent = currentIndex === total - 1 ? '診断結果を見る →' : '次へ →';
  DOM.btnBack.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
}

// ── 選択肢クリック（イベント委任）──
DOM.optionsWrap.addEventListener('click', e => {
  const btn = e.target.closest('.option-btn');
  if (!btn) return;
  const i = Number(btn.dataset.index);
  const opt = QUESTIONS[currentIndex].options[i];
  answers[currentIndex] = { questionId: QUESTIONS[currentIndex].id, score: opt.score, optionText: opt.text, optionIndex: i };
  DOM.optionsWrap.querySelectorAll('.option-btn').forEach((b, j) => b.classList.toggle('selected', j === i));
  DOM.btnNext.disabled = false;
});

// ── スコア計算 ──
function calcScore() {
  return Math.round((answers.reduce((sum, a) => sum + a.score, 0) / MAX_SCORE) * 100);
}

function getStage(score) {
  if (score <= 30) return '準備期';
  if (score <= 60) return '導入期';
  if (score <= 80) return '活用期';
  return '推進期';
}

// ── 強み・課題（1パス）──
function getInsights() {
  const strengths = [], issues = [];
  answers.forEach((a, i) => {
    if (a.score >= 7 && strengths.length < 3) strengths.push(QUESTIONS[i].highStrength);
    if (a.score <= 3 && issues.length < 3)    issues.push(QUESTIONS[i].lowIssue);
  });
  return { strengths, issues };
}

// ── リスト描画ヘルパー ──
function renderList(listEl, cardEl, items) {
  cardEl.classList.toggle('hidden', items.length === 0);
  if (items.length > 0) listEl.innerHTML = items.map(s => `<li>${s}</li>`).join('');
}

// ── 結果表示 ──
async function showResults() {
  showScreen('screen-loading');

  const score = calcScore();
  const stage = getStage(score);
  const info = STAGE_INFO[stage];
  const { strengths, issues } = getInsights();

  let actions = FALLBACK_ACTIONS[stage];
  let usedFallback = true;
  try {
    const res = await fetch('/.netlify/functions/generate-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, stage, strengths, issues })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.actions?.length >= 3) { actions = data.actions; usedFallback = false; }
    }
  } catch (_) {}

  // ステージタイムライン
  document.querySelectorAll('.stage-item').forEach(el => {
    el.classList.toggle('active', el.dataset.stage === stage);
  });

  // スコアカード（data-stage をセットするだけ、色はCSS側が制御）
  DOM.scoreCard.dataset.stage = stage;
  DOM.scoreNumber.textContent = score;
  DOM.stageBadge.textContent = stage;
  DOM.stageBadge.className = `stage-badge ${info.badgeClass}`;

  DOM.currentState.textContent = info.currentState;
  DOM.stageGoal.textContent = info.goal;

  renderList(DOM.strengthsList, DOM.strengthsCard, strengths);
  renderList(DOM.issuesList,    DOM.issuesCard,    issues);

  DOM.actionsList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
  const fallbackNote = document.getElementById('actions-fallback-note');
  if (fallbackNote) fallbackNote.classList.toggle('hidden', !usedFallback);

  const mailBody = encodeURIComponent(
    `AI活用準備度診断を受けました。\n\n【スコア】${score}点\n【ステージ】${stage}\n\nご相談させてください。`
  );
  DOM.btnCta.href = `mailto:zatuneya@gmail.com?subject=AI活用準備度診断を受けました&body=${mailBody}`;

  showScreen('screen-results');
}

// ── ナビゲーション ──
document.getElementById('btn-start').addEventListener('click', () => {
  currentIndex = 0;
  answers = [];
  showScreen('screen-quiz');
  renderQuestion();
});

DOM.btnNext.addEventListener('click', () => {
  if (currentIndex < QUESTIONS.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    showResults();
  }
});

DOM.btnBack.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

document.getElementById('btn-retry').addEventListener('click', () => {
  currentIndex = 0;
  answers = [];
  showScreen('screen-welcome');
});
