// =====================
// 全23問の定義
// =====================
const ALL_QUESTIONS = [
  // ─── パート1：属性情報 ───
  {
    id: 'industry', part: 1, partName: '属性情報', type: 'single',
    text: '業種を教えてください',
    options: ['製造業', '建設業・不動産', '小売・飲食・サービス', '医療・介護・福祉', 'IT・情報通信', '運輸・物流', '教育・研修', 'その他']
  },
  {
    id: 'scale', part: 1, partName: '属性情報', type: 'single',
    text: '従業員規模を教えてください',
    options: ['〜10名', '11〜30名', '31〜50名', '51名以上']
  },

  // ─── パート2：AI活用準備度診断（12問）───
  {
    id: 'd1', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '現在メインで使っているツールは？',
    options: [
      { text: '紙・手書きがメイン', score: 0 },
      { text: 'Excel / Word がメイン', score: 3 },
      { text: 'クラウドツールを活用している（Google Workspace等）', score: 7 },
      { text: '業務システム＋クラウド両方を活用している', score: 10 }
    ],
    highStrength: 'デジタルツールの活用基盤が整っている',
    lowIssue: 'デジタルツールの基盤整備から始める必要があります'
  },
  {
    id: 'd2', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '新しいデジタルツールを社内に導入したとき、定着させられましたか？',
    options: [
      { text: '導入自体ほとんどしたことがない', score: 0 },
      { text: '導入したが定着しなかったことが多い', score: 3 },
      { text: '半分くらいは定着できた', score: 7 },
      { text: 'ほぼ問題なく定着させられた', score: 10 }
    ],
    highStrength: 'ツール導入・定着のノウハウが社内に蓄積されている',
    lowIssue: 'ツール定着の仕組みづくり（研修・ルール化）が必要です'
  },
  {
    id: 'd3', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '社外との情報共有・リモート対応の仕組みはありますか？',
    options: [
      { text: 'まったくない', score: 0 },
      { text: 'メールのみ', score: 3 },
      { text: 'クラウドストレージや共有ツールがある', score: 7 },
      { text: '業務に合った仕組みが整っている', score: 10 }
    ],
    highStrength: '社外連携・情報共有の仕組みが整っている',
    lowIssue: '社外との情報共有インフラの整備が課題です'
  },
  {
    id: 'd4', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '特定の担当者しかできない業務（属人化）はどの程度ありますか？',
    options: [
      { text: 'ほぼすべての業務が属人化している', score: 0 },
      { text: '重要業務の半分以上が属人化している', score: 3 },
      { text: '一部ある程度', score: 7 },
      { text: 'ほぼ仕組み化・マニュアル化できている', score: 10 }
    ],
    highStrength: '業務の仕組み化・マニュアル化が進んでいる',
    lowIssue: '業務の属人化解消が優先課題です'
  },
  {
    id: 'd5', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: 'データ入力・書類作成など繰り返しの定型作業にかかる時間は？',
    options: [
      { text: '業務時間の半分以上を占めている', score: 0 },
      { text: 'かなり多い（3〜4割程度）', score: 3 },
      { text: '少し多いと感じる', score: 7 },
      { text: '最小限に抑えられている', score: 10 }
    ],
    highStrength: '定型作業が効率化され、本質業務に時間を使えている',
    lowIssue: '定型作業の自動化・効率化でAIが最も力を発揮できます'
  },
  {
    id: 'd6', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '業務マニュアル・手順書は整備されていますか？',
    options: [
      { text: 'ほぼない', score: 0 },
      { text: '一部あるが古いまま更新されていない', score: 3 },
      { text: '主要業務はある', score: 7 },
      { text: '定期的に更新・整備されている', score: 10 }
    ],
    highStrength: '業務マニュアルが整備され、ナレッジが組織の資産になっている',
    lowIssue: 'マニュアル整備が先決です（AIがマニュアル作成を大幅に支援できます）'
  },
  {
    id: 'd7', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '社内の情報共有で困っていることはありますか？',
    options: [
      { text: '深刻な問題がある（情報が伝わらない・ロスが多い）', score: 0 },
      { text: 'よく困ることがある', score: 3 },
      { text: '時々困る程度', score: 7 },
      { text: '特に問題ない', score: 10 }
    ],
    highStrength: '社内の情報流通が円滑で、チーム連携がスムーズ',
    lowIssue: '社内情報共有の仕組みを整えることがAI活用の前提になります'
  },
  {
    id: 'd8', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: 'ChatGPTやClaudeなどのAIツールを業務で試したことはありますか？',
    options: [
      { text: '名前も知らない', score: 0 },
      { text: '知っているが使ったことはない', score: 3 },
      { text: '個人的に試したことはある', score: 7 },
      { text: '業務で定期的に活用している', score: 10 }
    ],
    highStrength: 'AIツールへの理解と実践経験がある',
    lowIssue: 'まずAIツールを体験することが最初のステップです'
  },
  {
    id: 'd9', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: 'AIで解決したい業務や削減したい作業はイメージできますか？',
    options: [
      { text: 'まったくイメージできない', score: 0 },
      { text: 'なんとなくはある', score: 3 },
      { text: '具体的な業務がいくつか思い浮かぶ', score: 7 },
      { text: '優先順位もつけて明確にイメージできる', score: 10 }
    ],
    highStrength: 'AI活用の目的意識が明確で、具体的なアクションに移りやすい',
    lowIssue: 'まず業務課題を棚卸しし、AIが使える箇所を一緒に特定しましょう'
  },
  {
    id: 'd10', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: 'AI・IT導入に割ける月次予算のイメージはありますか？',
    options: [
      { text: '予算を割く余裕はない', score: 0 },
      { text: '少額なら（〜1万円／月程度）', score: 3 },
      { text: 'ある程度は（1〜5万円／月程度）', score: 7 },
      { text: '効果次第で柔軟に対応できる', score: 10 }
    ],
    highStrength: '投資への柔軟な姿勢があり、効果的な施策を選びやすい',
    lowIssue: 'まず無料ツールから始め、効果を確認してから投資を検討できます'
  },
  {
    id: 'd11', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: 'デジタル化・AI活用を推進できる人材は社内にいますか？',
    options: [
      { text: 'まったくいない', score: 0 },
      { text: '関心のある人はいるが専任ではない', score: 3 },
      { text: '部分的に担える人がいる', score: 7 },
      { text: '専任または準専任の担当者がいる', score: 10 }
    ],
    highStrength: 'DX・AI推進を担える人材が社内にいる',
    lowIssue: '推進役の育成または外部サポートの活用が鍵になります'
  },
  {
    id: 'd12', part: 2, partName: 'AI活用準備度診断', type: 'score',
    text: '新しいツール・施策導入の意思決定スピードは？',
    options: [
      { text: '決まるまでに数ヶ月以上かかる', score: 0 },
      { text: '1〜2ヶ月程度', score: 3 },
      { text: '数週間程度', score: 7 },
      { text: '必要と判断したらすぐ動ける', score: 10 }
    ],
    highStrength: '意思決定が速く、スピード感のある改善が可能',
    lowIssue: 'まず小さく始めて成果を見せ、意思決定を加速する流れを作りましょう'
  },

  // ─── パート3：業務の詳細（5問）───
  {
    id: 'customerType', part: 3, partName: '業務の詳細', type: 'single',
    text: '主な取引相手・顧客層は？',
    options: ['企業・法人向け（BtoB）', '一般消費者向け（BtoC）', '行政・官公庁向け', '主に社内（対外文書なし）']
  },
  {
    id: 'documentTypes', part: 3, partName: '業務の詳細', type: 'multi',
    text: 'よく作る文書の形式は？（複数選択可）',
    options: ['短文メール・チャットメッセージ', '1〜2ページの報告書・提案書', 'マニュアル・企画書（長文）', '表・箇条書き形式のまとめ']
  },
  {
    id: 'staffSkill', part: 3, partName: '業務の詳細', type: 'single',
    text: 'プロンプトを使うスタッフのITスキルは？',
    options: ['高い（複雑な指示も使いこなせる）', '普通（標準的）', '低め（シンプルなほうがいい）']
  },
  {
    id: 'mainProblem', part: 3, partName: '業務の詳細', type: 'single',
    text: '今最も困っている場面は？',
    options: ['毎回同じような文書を一から作っている', '担当者によって品質にばらつきがある', '急な依頼に対応できていない', '作るのに時間がかかりすぎる文書がある']
  },
  {
    id: 'companyFeature', part: 3, partName: '業務の詳細', type: 'text',
    text: '自社・業務の特徴を一言で教えてください',
    placeholder: '例：広島の老舗建設会社、子育て世帯向けの不動産会社'
  },

  // ─── パート4：ライブラリ設定（4問）───
  {
    id: 'targetTasks', part: 4, partName: 'ライブラリ設定', type: 'multi',
    text: 'AIですぐ活用したい業務を選んでください（複数選択可）',
    options: ['メール返信', '議事録作成', '報告書・提案書', 'データ整理・分析', 'SNS・広告文', '採用・人事文書', '顧客FAQ', '社内マニュアル']
  },
  {
    id: 'aiTool', part: 4, partName: 'ライブラリ設定', type: 'single',
    text: '主に使いたいAIツールは？',
    options: ['Claude', 'ChatGPT', 'Gemini', 'まだ決まっていない']
  },
  {
    id: 'tone', part: 4, partName: 'ライブラリ設定', type: 'single',
    text: '文章のトーンは？',
    options: ['フォーマル（取引先向け）', 'ビジネスカジュアル', '社内向け（やわらかめ）']
  },
  {
    id: 'scope', part: 4, partName: 'ライブラリ設定', type: 'single',
    text: 'プロンプトの活用範囲は？',
    options: ['自分だけ使う', 'チームで共有', '全社展開を想定']
  }
];

// =====================
// ステージ情報・フォールバック
// =====================
const STAGE_INFO = {
  準備期: {
    badgeClass: 'badge-prep',
    currentState: '業務が属人化・デジタル基盤が弱い状態です。まず土台を整えることが先決です。',
    goal: '業務を言語化・可視化し、誰でも動ける土台を作る'
  },
  導入期: {
    badgeClass: 'badge-intro',
    currentState: 'AIを知っているが、業務で使えていない状態です。小さな成功体験が次につながります。',
    goal: '1〜2個の業務でAIを体験し、小さな成功体験を作る'
  },
  活用期: {
    badgeClass: 'badge-use',
    currentState: '一部でAIを活用できています。この経験を社内に広げる段階です。',
    goal: '複数業務にAIを組み込み、時間削減を実感・定着させる'
  },
  推進期: {
    badgeClass: 'badge-advance',
    currentState: 'AI活用が進んでいます。仕組みとして根付かせ、自走できる状態を目指しましょう。',
    goal: '社内にAI文化が根付き、自走できる仕組みを完成させる'
  }
};

const FALLBACK_ACTIONS = {
  準備期: ['今週1週間、業務の「よく繰り返す作業」をリストアップしてみましょう。', 'ChatGPTの無料版で、日常業務のメール下書きを試してみましょう。', '主要業務を1つ選び、手順を箇条書きにするところからマニュアル化を始めましょう。'],
  導入期: ['週1回、特定の業務でAIを必ず使う「AI曜日」を設けてみましょう。', 'ChatGPT / Claude の有料プランへのアップグレードを試し、業務品質の変化を確認しましょう。', '社内で最も時間がかかっている定型作業を1つ選び、AI化の実験を始めてみましょう。'],
  活用期: ['AIをすでに使っている業務の「プロンプト集」を作り、社内メンバーと共有しましょう。', '他の部署へAI活用事例を横展開する短時間の勉強会を開催しましょう。', 'AI活用の効果（時間削減）を数値で記録し、さらなる投資の判断材料にしましょう。'],
  推進期: ['社内AI活用ガイドラインを作成し、全社的な取り組みとして正式に位置づけましょう。', 'AI活用を採用・育成にも組み込み、「AIが使える会社」としてブランド化を検討しましょう。', '外部パートナーと連携し、自社業務に特化したAIソリューションの導入を検討しましょう。']
};

const FALLBACK_RECOMMENDATIONS = {
  準備期: [
    { rank: 1, type: 'standalone', service: '①AI活用知識編（5名）', price: '60,000円（モニター42,000円）', reason: 'AIの基礎をチーム全員で学べます。全5コースの入口として、最も負担なく始められる研修です。' },
    { rank: 2, type: 'set', service: '入門セット（①+②・5名）', price: '152,000円', reason: 'AI知識と文書作業の効率化スキルを1日ずつで習得できます。研修当日から業務に活かせます。' }
  ],
  導入期: [
    { rank: 1, type: 'standalone', service: '②実践編・文書系（5名）', price: '100,000円（モニター70,000円）', reason: '社内文書・SNS投稿・採用広報など、日常的な文書作業をAIで大幅に効率化できます。' },
    { rank: 2, type: 'set', service: '実践セット（②+③+④・5名）', price: '270,000円', reason: '文書・画像・動画の3スキルをまとめて習得できます。社内発信力を一気に強化できます。' }
  ],
  活用期: [
    { rank: 1, type: 'standalone', service: 'AI業務改善オーダーメイド・Sプラン（制作＋運用サポート）', price: '70,000円', reason: '特定の困りごとに特化した専用プロンプト・手順書を制作します。使い始め期間のサポートも含みます。' },
    { rank: 2, type: 'set', service: '入門セット（①+②・10名）', price: '209,000円', reason: '10名規模での研修で、組織全体のAIリテラシーを底上げできます。助成金活用で実質負担を大幅軽減できます。' }
  ],
  推進期: [
    { rank: 1, type: 'standalone', service: 'AI業務改善オーダーメイド・Mプラン（制作＋運用サポート）', price: '110,000円', reason: '複数の複雑な業務課題に対して、自社専用のAI活用の仕組みを体系的に設計・制作します。' },
    { rank: 2, type: 'set', service: '全コースセット（①②③④+⑤グループ・5名）', price: '459,000円', reason: '全5コースで組織全体のAI活用を一気に推進。助成金活用で企業手出しを最小化できます。' }
  ]
};

const FALLBACK_PROMPTS = [
  {
    task: 'メール返信',
    title: 'ビジネスメール返信',
    prompt: 'あなたは丁寧なビジネスメールを書くプロのアシスタントです。\n\n以下のメールに対して、適切な返信文を書いてください。\n\n【受信メール】\n（ここに受信したメールを貼り付ける）\n\n【伝えたいポイント】\n（ここに返信で伝えたい内容を箇条書きで記入）\n\n300〜400字程度でまとめ、丁寧な敬語を使ってください。'
  }
];

// =====================
// 状態管理
// =====================
let _exportData = null;

let state = {
  companyName: '',
  contactName: '',
  email: '',
  currentIndex: 0,
  answers: new Array(ALL_QUESTIONS.length).fill(null)
};

const DIAGNOSTIC_INDICES = ALL_QUESTIONS
  .map((q, i) => q.type === 'score' ? i : -1)
  .filter(i => i >= 0);

// =====================
// スコア計算
// =====================
function calcScore() {
  const total = DIAGNOSTIC_INDICES.length * 10;
  const sum = DIAGNOSTIC_INDICES.reduce((acc, i) => acc + (state.answers[i]?.score || 0), 0);
  return Math.round((sum / total) * 100);
}

function getStage(score) {
  if (score <= 30) return '準備期';
  if (score <= 60) return '導入期';
  if (score <= 80) return '活用期';
  return '推進期';
}

function getInsights() {
  const strengths = [], issues = [];
  DIAGNOSTIC_INDICES.forEach(i => {
    const a = state.answers[i];
    const q = ALL_QUESTIONS[i];
    if (!a) return;
    if (a.score >= 7 && strengths.length < 3) strengths.push(q.highStrength);
    if (a.score <= 3 && issues.length < 3) issues.push(q.lowIssue);
  });
  return { strengths, issues };
}

// =====================
// 回答バリデーション
// =====================
function isAnswerValid(index) {
  const q = ALL_QUESTIONS[index];
  if (q.type === 'text') return true;
  const a = state.answers[index];
  if (!a) return false;
  if (q.type === 'multi') return a.values && a.values.length > 0;
  return true;
}

// =====================
// DOM参照（utils.js の showScreen / validateEmail / validateContactForm を使用）
// =====================
const $ = id => document.getElementById(id);
const DOM = {
  partLabel:    $('part-label'),
  counter:      $('question-counter'),
  progressBar:  $('progress-bar'),
  questionText: $('question-text'),
  optionsWrap:  $('options'),
  btnBack:      $('btn-back'),
  btnNext:      $('btn-next'),
  scoreCard:    $('score-card'),
  scoreNumber:  $('score-number'),
  stageBadge:   $('stage-badge'),
  currentState: $('current-state-text'),
  stageGoal:    $('stage-goal-text'),
  strengthsCard: $('strengths-card'),
  strengthsList: $('strengths-list'),
  issuesCard:   $('issues-card'),
  issuesList:   $('issues-list'),
  libraryList:  $('library-list'),
  actionsList:  $('actions-list'),
};

// =====================
// sessionStorage 引き継ぎ
// =====================
const _savedContact = JSON.parse(sessionStorage.getItem('zatune_contact') || 'null');
const _pageMode     = sessionStorage.getItem('zatune_mode') || 'standalone';

if (_savedContact) {
  $('company-name').value  = _savedContact.companyName  || '';
  $('contact-name').value  = _savedContact.contactName  || '';
  $('contact-email').value = _savedContact.email        || '';
}

if (_pageMode === 'estimate') {
  const sub = document.querySelector('#screen-welcome .welcome-sub');
  if (sub) sub.innerHTML = '診断結果をもとに最適なプランの見積書を作成します。<br>見積書と診断結果PDFは2営業日以内にお送りします。';
}

// =====================
// 情報フォーム
// =====================
$('btn-start').addEventListener('click', () => {
  const result = validateContactForm('form-error-msg');
  if (!result) return;

  state.companyName = result.companyName;
  state.contactName = result.contactName;
  state.email       = result.email;
  state.currentIndex = 0;
  state.answers = new Array(ALL_QUESTIONS.length).fill(null);

  showScreen('screen-quiz');
  renderQuestion();
});

// =====================
// クイズ描画
// =====================
function renderQuestion() {
  const q = ALL_QUESTIONS[state.currentIndex];
  const total = ALL_QUESTIONS.length;

  const partQs = ALL_QUESTIONS.filter(x => x.part === q.part);
  const partIdx = partQs.findIndex(x => x.id === q.id);
  DOM.partLabel.textContent = `パート${q.part}：${q.partName}（${partIdx + 1}/${partQs.length}）`;
  DOM.counter.textContent = `${state.currentIndex + 1} / ${total}`;
  DOM.progressBar.style.width = `${(state.currentIndex / total) * 100}%`;
  DOM.questionText.textContent = q.text;

  if (q.type === 'score' || q.type === 'single') {
    const a = state.answers[state.currentIndex];
    const opts = q.type === 'score' ? q.options.map(o => o.text) : q.options;
    DOM.optionsWrap.innerHTML = opts.map((text, i) =>
      `<button class="option-btn${a?.optionIndex === i ? ' selected' : ''}" data-index="${i}">${text}</button>`
    ).join('');
  } else if (q.type === 'multi') {
    const vals = state.answers[state.currentIndex]?.values || [];
    DOM.optionsWrap.innerHTML = q.options.map((text, i) =>
      `<button class="option-btn multi-btn${vals.includes(text) ? ' selected' : ''}" data-index="${i}">
        <span class="multi-icon">${vals.includes(text) ? '✓' : '+'}</span>${text}
      </button>`
    ).join('');
  } else if (q.type === 'text') {
    const val = state.answers[state.currentIndex]?.value || '';
    DOM.optionsWrap.innerHTML =
      `<input type="text" class="text-input" id="text-input" placeholder="${q.placeholder || ''}" value="${escapeHtml(val)}">
       <p class="text-hint">※ 入力は任意です。空欄のまま次へ進めます。</p>`;
    $('text-input').addEventListener('input', e => {
      state.answers[state.currentIndex] = { value: e.target.value };
    });
  }

  DOM.btnNext.disabled = !isAnswerValid(state.currentIndex);
  DOM.btnNext.textContent = state.currentIndex === total - 1 ? '診断結果を見る →' : '次へ →';
  DOM.btnBack.style.visibility = state.currentIndex === 0 ? 'hidden' : 'visible';
}

// =====================
// 選択肢クリック（イベント委任）
// =====================
DOM.optionsWrap.addEventListener('click', e => {
  const q = ALL_QUESTIONS[state.currentIndex];
  const btn = e.target.closest('.option-btn');
  if (!btn) return;
  const i = Number(btn.dataset.index);

  if (q.type === 'score') {
    state.answers[state.currentIndex] = { score: q.options[i].score, optionIndex: i, value: q.options[i].text };
    DOM.optionsWrap.querySelectorAll('.option-btn').forEach((b, j) => b.classList.toggle('selected', j === i));
  } else if (q.type === 'single') {
    state.answers[state.currentIndex] = { value: q.options[i], optionIndex: i };
    DOM.optionsWrap.querySelectorAll('.option-btn').forEach((b, j) => b.classList.toggle('selected', j === i));
  } else if (q.type === 'multi') {
    const vals = [...(state.answers[state.currentIndex]?.values || [])];
    const option = q.options[i];
    const idx = vals.indexOf(option);
    if (idx === -1) vals.push(option);
    else vals.splice(idx, 1);
    state.answers[state.currentIndex] = { values: vals };
    btn.classList.toggle('selected', vals.includes(option));
    const icon = btn.querySelector('.multi-icon');
    if (icon) icon.textContent = vals.includes(option) ? '✓' : '+';
  }

  DOM.btnNext.disabled = !isAnswerValid(state.currentIndex);
});

// =====================
// ナビゲーション
// =====================
DOM.btnNext.addEventListener('click', () => {
  if (state.currentIndex < ALL_QUESTIONS.length - 1) {
    state.currentIndex++;
    renderQuestion();
  } else {
    showResults();
  }
});

DOM.btnBack.addEventListener('click', () => {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
  }
});

$('btn-retry').addEventListener('click', () => {
  state.currentIndex = 0;
  state.answers = new Array(ALL_QUESTIONS.length).fill(null);
  showScreen('screen-welcome');
});


// =====================
// 回答収集
// =====================
function getAnswer(id) {
  const i = ALL_QUESTIONS.findIndex(q => q.id === id);
  return state.answers[i];
}

function collectAnswers() {
  const score = calcScore();
  const stage = getStage(score);
  const { strengths, issues } = getInsights();
  return {
    score, stage, strengths, issues,
    industry:        getAnswer('industry')?.value || '',
    scale:           getAnswer('scale')?.value || '',
    customerType:    getAnswer('customerType')?.value || '',
    documentTypes:   getAnswer('documentTypes')?.values || [],
    staffSkill:      getAnswer('staffSkill')?.value || '',
    mainProblem:     getAnswer('mainProblem')?.value || '',
    companyFeature:  getAnswer('companyFeature')?.value || '',
    targetTasks:     getAnswer('targetTasks')?.values || [],
    aiTool:          getAnswer('aiTool')?.value || 'まだ決まっていない',
    tone:            getAnswer('tone')?.value || 'ビジネスカジュアル',
    scope:           getAnswer('scope')?.value || 'チームで共有'
  };
}

// =====================
// 結果表示
// =====================
async function showResults() {
  showScreen('screen-loading');

  const data = collectAnswers();
  const { score, stage, strengths, issues } = data;
  const info = STAGE_INFO[stage];

  let prompts = FALLBACK_PROMPTS;
  let actions = FALLBACK_ACTIONS[stage];
  let recommendations = FALLBACK_RECOMMENDATIONS[stage];

  try {
    const res = await fetch('/.netlify/functions/generate-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.prompts?.length > 0) prompts = result.prompts;
      if (result.actions?.length >= 3) actions = result.actions;
      if (result.recommendations?.length > 0) recommendations = result.recommendations;
    }
  } catch (_) {}

  // ステージタイムライン
  document.querySelectorAll('.stage-item').forEach(el => {
    el.classList.toggle('active', el.dataset.stage === stage);
  });

  // スコア
  DOM.scoreCard.dataset.stage = stage;
  DOM.scoreNumber.textContent = score;
  DOM.stageBadge.textContent = stage;
  DOM.stageBadge.className = `stage-badge ${info.badgeClass}`;
  DOM.currentState.textContent = info.currentState;
  DOM.stageGoal.textContent = info.goal;

  // 強み・課題
  const renderList = (el, cardEl, items) => {
    cardEl.classList.toggle('hidden', items.length === 0);
    if (items.length > 0) el.innerHTML = items.map(s => `<li>${s}</li>`).join('');
  };
  renderList(DOM.strengthsList, DOM.strengthsCard, strengths);
  renderList(DOM.issuesList, DOM.issuesCard, issues);

  // プロンプトライブラリ
  DOM.libraryList.innerHTML = prompts.map((p, i) => `
    <div class="prompt-item">
      <div class="prompt-header">
        <span class="prompt-tag">${p.task}</span>
        <span class="prompt-title">${escapeHtml(p.title)}</span>
      </div>
      <pre class="prompt-body">${escapeHtml(p.prompt)}</pre>
      <button class="btn-copy no-print" data-index="${i}">コピー</button>
    </div>
  `).join('');

  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.index);
      navigator.clipboard.writeText(prompts[i].prompt).then(() => {
        btn.textContent = 'コピーしました ✓';
        setTimeout(() => { btn.textContent = 'コピー'; }, 2000);
      }).catch(() => {
        btn.textContent = 'コピー失敗';
      });
    });
  });

  // アクション
  DOM.actionsList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');

  // サービス提案
  renderRecommendations(recommendations, score, stage);

  // 見積請求モード：CTAを見積画面への遷移に変更
  if (_pageMode === 'estimate') {
    const btnCta = $('btn-cta');
    btnCta.textContent = '見積プランを確認する →';
    btnCta.removeAttribute('href');
    btnCta.onclick = e => {
      e.preventDefault();
      showEstimateScreen(recommendations, score, stage);
    };
  }

  sessionStorage.removeItem('zatune_contact');
  sessionStorage.removeItem('zatune_mode');

  // エクスポート用データを保存
  _exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    client: {
      companyName: state.companyName,
      contactName: state.contactName,
      email: state.email
    },
    diagnosis: {
      score, stage,
      currentState: info.currentState,
      goal: info.goal,
      strengths, issues,
      industry: data.industry,
      scale: data.scale,
      customerType: data.customerType,
      documentTypes: data.documentTypes,
      staffSkill: data.staffSkill,
      mainProblem: data.mainProblem,
      companyFeature: data.companyFeature,
      targetTasks: data.targetTasks,
      aiTool: data.aiTool,
      tone: data.tone,
      scope: data.scope
    },
    recommendations,
    libraryPrompts: prompts,
    actions
  };

  const btnExport = $('btn-export');
  if (btnExport) {
    btnExport.style.display = 'inline-block';
    btnExport.onclick = () => exportDiagnosisData();
  }

  // 問い合わせデータを保存・メール送信（fire-and-forget）
  fetch('/.netlify/functions/save-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: _pageMode === 'estimate' ? '詳細診断・見積' : '詳細診断・相談',
      companyName:     state.companyName,
      contactName:     state.contactName,
      email:           state.email,
      score,
      stage,
      industry:        data.industry,
      scale:           data.scale,
      strengths,
      issues,
      recommendations,
    }),
  }).catch(() => {});

  showScreen('screen-results');
}

// =====================
// 見積画面
// =====================
function showEstimateScreen(recommendations, score, stage) {
  const standalone = recommendations.find(r => r.type === 'standalone') || recommendations[0];
  const set        = recommendations.find(r => r.type === 'set')        || recommendations[1];

  const renderPlan = (elId, plan) => {
    if (!plan) { $(elId).innerHTML = '<p class="estimate-reason">個別にご相談ください。</p>'; return; }
    $(elId).innerHTML = `
      <p class="estimate-service">${escapeHtml(plan.service)}</p>
      <p class="estimate-price">${escapeHtml(plan.price)}</p>
      <p class="estimate-reason">${escapeHtml(plan.reason)}</p>
    `;
  };
  renderPlan('estimate-plan-1', standalone);
  renderPlan('estimate-plan-2', set);

  const buildBody = () => {
    const sel = $('estimate-custom-select').value;
    let pat3 = 'なし（2パターンのみ）';
    if (sel) {
      const [svc, price] = sel.split('|');
      pat3 = `${svc}（${price}）`;
    }
    return [
      '見積請求がありました。',
      '',
      '【基本情報】',
      `会社名: ${state.companyName}`,
      `担当者: ${state.contactName}`,
      `返送先メール: ${state.email}`,
      '',
      '【診断結果】',
      `スコア: ${score}点（${stage}）`,
      '',
      '【見積パターン】',
      '',
      'パターン1（AI推奨・単独プラン）',
      `サービス: ${standalone ? standalone.service : '—'}`,
      `価格: ${standalone ? standalone.price : '—'}`,
      `理由: ${standalone ? standalone.reason : '—'}`,
      '',
      'パターン2（AI推奨・セットプラン）',
      `サービス: ${set ? set.service : '—'}`,
      `価格: ${set ? set.price : '—'}`,
      `理由: ${set ? set.reason : '—'}`,
      '',
      'パターン3（クライアント希望）',
      pat3
    ].join('\n');
  };

  const updateLink = () => {
    const subject = encodeURIComponent(`見積請求（${state.companyName}）`);
    $('btn-estimate-submit').href =
      `mailto:zatuneya@gmail.com?subject=${subject}&body=${encodeURIComponent(buildBody())}`;
  };

  updateLink();
  $('estimate-custom-select').addEventListener('change', updateLink);

  showScreen('screen-estimate');
}

// =====================
// サービス提案レンダリング
// =====================
function renderRecommendations(recommendations, score, stage) {
  const list = $('recommend-list');
  if (!list) return;

  list.innerHTML = recommendations.map(r => `
    <div class="recommend-item rank-${r.rank}">
      <span class="recommend-rank">${r.rank === 1 ? 'メインプラン' : 'サブプラン'}</span>
      <p class="recommend-service">${escapeHtml(r.service)}</p>
      <p class="recommend-price">${escapeHtml(r.price)}</p>
      <p class="recommend-reason">${escapeHtml(r.reason)}</p>
    </div>
  `).join('');

  const primary = recommendations[0];
  const subject = `AI活用診断の結果について（${state.companyName}）`;
  const body = [
    'AI活用準備度診断（詳細版）を受けました。',
    '',
    `【会社名】${state.companyName}`,
    `【担当者】${state.contactName}`,
    `【スコア】${score}点（${stage}）`,
    '',
    '【ご提案いただいたプラン】',
    `${primary.service}（${primary.price}）`,
    '',
    '上記プランについてご相談したいと思います。',
    'よろしくお願いいたします。'
  ].join('\n');

  $('btn-cta').href = `mailto:zatuneya@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// =====================
// 診断データエクスポート
// =====================
function exportDiagnosisData() {
  if (!_exportData) return;
  const json = JSON.stringify(_exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  a.download = `diagnosis_${_exportData.client.companyName}_${dateStr}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

// =====================
// ユーティリティ
// =====================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
