'use strict';

const AXES = ['AI基礎知識', 'ツール操作', 'プロンプト力', 'セキュリティ・倫理', '業務応用'];

const QUESTIONS = [
  // ─── AI基礎知識 ───
  {
    axis: 0,
    text: '生成AIが文章を生成する仕組みとして正しいのは？',
    options: [
      '学習データをもとに次の言葉を確率的に予測する',
      '専門家が登録した回答集から検索して返す',
      'ネットをリアルタイムで検索して取得する',
      'ユーザーの入力履歴から記憶を引き出す'
    ],
    correct: 0
  },
  {
    axis: 0,
    text: '「ハルシネーション」とは何ですか？',
    options: [
      'AIが古い情報を優先して回答する現象',
      'AIが処理速度を落とす際のエラー',
      'AIが事実と異なる内容をもっともらしく生成する現象',
      'AIが同じ回答を繰り返す現象'
    ],
    correct: 2
  },
  {
    axis: 0,
    text: '生成AIの「カットオフ日」とは何ですか？',
    options: [
      'AIが一日に対応できる質問数の上限',
      '無料プランで使える文字数の上限',
      'AIサービスの契約が切れる日付',
      'AIの学習データが更新された最終日付'
    ],
    correct: 3
  },
  {
    axis: 0,
    text: '「マルチモーダルAI」の特徴として正しいのは？',
    options: [
      '複数のAIを同時に操作できる機能',
      'テキスト・画像・音声など複数の形式を処理できる',
      '複数の言語を同時に翻訳できる機能',
      '複数のユーザーが同時にアクセスできる仕様'
    ],
    correct: 1
  },
  // ─── ツール操作 ───
  {
    axis: 1,
    text: 'ChatGPT・Claude・Geminiの説明として正しいのは？',
    options: [
      '名前が違うだけで機能はすべて同じ',
      '有料プランがあるのはChatGPTのみ',
      '開発会社が異なり得意分野や特性に違いがある',
      '日本語が使えるのはGeminiだけ'
    ],
    correct: 2
  },
  {
    axis: 1,
    text: 'Canvaで使えるAI機能として正しいのは？',
    options: [
      'テキスト入力から画像やデザインを生成できる',
      '動画に自動で字幕をつけられる',
      '音声をテキストに自動書き起こしできる',
      '動画をPDFに変換できる'
    ],
    correct: 0
  },
  {
    axis: 1,
    text: 'Geminiが他の文章系AIと比べて優れるとされる点は？',
    options: [
      'プログラム生成の精度が最も高い',
      '日本語の敬語表現が最も自然',
      '無料プランに利用制限がない',
      'Googleドキュメント等との親和性が高い'
    ],
    correct: 3
  },
  {
    axis: 1,
    text: 'CapCutやSeedanceなど動画系AIツールでできることは？',
    options: [
      '動画から自動でプログラムコードを生成する',
      'テキストや画像から動画を自動生成できる',
      '動画を自動でPDF資料に変換する',
      'ライブ配信を自動で録画・編集する'
    ],
    correct: 1
  },
  // ─── プロンプト力 ───
  {
    axis: 2,
    text: 'AIから精度の高い回答を得る指示の要素として正しいのは？',
    options: [
      '文字数・フォント・色の指定',
      '役割・条件・出力形式の指定',
      '送信回数・時間帯・通信速度の確認',
      'アカウント種別・モデル名・地域設定'
    ],
    correct: 1
  },
  {
    axis: 2,
    text: '「箇条書き5つ・各50字以内で」と出力形式を指定する効果は？',
    options: [
      '使いやすい形式の回答を得られる',
      'AIの回答速度が上がる',
      'ハルシネーションがなくなる',
      '参照する情報量を絞れる'
    ],
    correct: 0
  },
  {
    axis: 2,
    text: 'AIが期待通りに回答しなかった場合の正しい対処は？',
    options: [
      '同じ質問を繰り返し送る',
      'より短くシンプルな質問に変える',
      '別のAIツールに切り替える',
      '条件や制約を追加して再依頼する'
    ],
    correct: 3
  },
  {
    axis: 2,
    text: '「Few-shotプロンプティング」とは何ですか？',
    options: [
      '少ない文字数で質問するテクニック',
      '複数のAIに同時に同じ質問を送る方法',
      '例文をいくつか見せてから本題を依頼する手法',
      '短時間で多くの質問をこなすコツ'
    ],
    correct: 2
  },
  // ─── セキュリティ・倫理 ───
  {
    axis: 3,
    text: '業務でAIを使う際に入力を避けるべき情報は？',
    options: [
      '自社の顧客情報・未発表の製品データ',
      '公開済みのプレスリリース',
      '自分の職種や担当業務の概要',
      '公開されているニュース記事'
    ],
    correct: 0
  },
  {
    axis: 3,
    text: 'AI生成コンテンツの著作権について正しいのは？',
    options: [
      '生成した人に自動的に著作権が発生する',
      'すべての国で著作権フリーと定められている',
      'AI開発会社が著作権を持つと定められている',
      '国や条件により扱いが異なり法整備が進んでいる'
    ],
    correct: 3
  },
  {
    axis: 3,
    text: 'ディープフェイクのリスクとして正しいのは？',
    options: [
      'AIの処理速度が低下する',
      '人物の信用毀損や詐欺に悪用されうる',
      '動画の画質が全体的に劣化する',
      '作成者のデバイスに過負荷がかかる'
    ],
    correct: 1
  },
  {
    axis: 3,
    text: '社内でAIを導入する際に最初に確認すべきことは？',
    options: [
      '競合他社のAI導入状況の調査',
      'どのAIが最も高性能かの比較',
      '情報管理ルールや社内規定の整備状況',
      '全社員が同じツールを使えるかの確認'
    ],
    correct: 2
  },
  // ─── 業務応用 ───
  {
    axis: 4,
    text: 'AIで効果が出やすい業務の特徴は？',
    options: [
      '定型的で繰り返しが多く言語化できる業務',
      '毎回異なる高度な判断が必要な業務',
      '対人コミュニケーションが中心の業務',
      '身体的な動作や移動を伴う業務'
    ],
    correct: 0
  },
  {
    axis: 4,
    text: '議事録作成にAIを効果的に活用する方法は？',
    options: [
      'AIを会議に参加させてリアルタイムで記録させる',
      '会議前にAIでひな型だけ作成しておく',
      '文字起こしデータをAIに渡して要点を整理させる',
      '会議後の感想をAIに代わりに書いてもらう'
    ],
    correct: 2
  },
  {
    axis: 4,
    text: '繰り返し使うメール文をAIで効率化する正しい方法は？',
    options: [
      '毎回ゼロからAIに文章を作らせる',
      'プロンプトをテンプレート化し変数部分だけ変える',
      'AIが作った文章を毎回そのまま使い回す',
      'メールは時間がかからないためAIは不要'
    ],
    correct: 1
  },
  {
    axis: 4,
    text: '業務でAIを活用したあとに必ず行うべきことは？',
    options: [
      '使用したAIツール名を記録する',
      '同じ内容を別のAIでも試して比較する',
      '使用後に必ずフィードバックを送る',
      '人間が内容を確認・修正してから使う'
    ],
    correct: 3
  }
];

// レベルアイコンはブランド準拠のモノラインSVG（絵文字は使用しません）
const RECS = [
  {
    min: 0, max: 39,
    icon: '<svg viewBox="0 0 24 24"><path d="M12 20v-8"/><path d="M12 12c0-3 2-5.5 5.5-5.5C17.5 10 15.5 12 12 12z"/><path d="M12 14c0-2.6-1.8-4.7-4.8-4.7C7.2 11.9 9 14 12 14z"/></svg>',
    level: 'AI入門前',
    message: 'AIの基礎からしっかり学ぶことで、業務効率が大きく変わります。まずは正しい知識を身につけましょう。',
    course: 'コース①「AI活用知識編」から始めましょう'
  },
  {
    min: 40, max: 59,
    icon: '<svg viewBox="0 0 24 24"><path d="M5 19c9 2 14-3 14-13-9-2-14 3-14 13z"/><path d="M8 16c2-4 5-6.5 8-7.5"/></svg>',
    level: '知識はあるが未実践',
    message: '基礎知識はありますが、実際の業務への落とし込みがカギです。手を動かして定着させましょう。',
    course: 'コース②③「実践編（文章・画像）」で体験を積みましょう'
  },
  {
    min: 60, max: 79,
    icon: '<svg viewBox="0 0 24 24"><path d="M12 15V21"/><circle cx="12" cy="9" r="5.5"/></svg>',
    level: '実践できている',
    message: '実践力があります。組織全体への展開や、より高度な活用で差をつけましょう。',
    course: '全コースセットか、伴走サービスでさらに深めましょう'
  },
  {
    min: 80, max: 100,
    icon: '<svg viewBox="0 0 24 24"><path d="M12 3c3 2 4.5 5 4.5 9 0 1.6-.5 3-1.5 4.2h-6C8 15 7.5 13.6 7.5 12c0-4 1.5-7 4.5-9z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9.2 16.5l-1.7 3.5 3-1.2M14.8 16.5l1.7 3.5-3-1.2"/></svg>',
    level: '上級者',
    message: '高い理解度と実践力があります。AIを使って自分でツールを作る段階に進みましょう。',
    course: 'コース⑤「Claude Code実践編」または伴走サービスへ'
  }
];

// ─── State ───
let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);

const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

function renderQuestion(idx) {
  const q = QUESTIONS[idx];
  const labels = ['A', 'B', 'C', 'D'];

  $('axis-label').textContent = AXES[q.axis];
  $('q-counter').textContent = `${idx + 1} / ${QUESTIONS.length}`;
  $('progress-fill').style.width = `${((idx + 1) / QUESTIONS.length) * 100}%`;
  $('question-text').textContent = `Q${idx + 1}. ${q.text}`;

  const container = $('options');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (answers[idx] === i ? ' selected' : '');
    btn.innerHTML = `<span class="option-label">${labels[i]}</span>${opt}`;
    btn.addEventListener('click', () => {
      answers[idx] = i;
      container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      $('btn-next').disabled = false;
    });
    container.appendChild(btn);
  });

  $('btn-next').disabled = answers[idx] === null;
  $('btn-back').disabled = idx === 0;
}

function calcScores() {
  const axisCorrect = new Array(5).fill(0);
  QUESTIONS.forEach((q, i) => {
    if (answers[i] === q.correct) axisCorrect[q.axis]++;
  });
  const axisPct = axisCorrect.map(c => Math.round((c / 4) * 100));
  const total = Math.round(axisPct.reduce((a, b) => a + b, 0) / 5);
  return { axisPct, total };
}

function drawRadar(canvas, scores) {
  const dpr = window.devicePixelRatio || 1;
  const size = 300;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const n = 5;
  const angles = Array.from({ length: n }, (_, i) => (Math.PI * 2 * i / n) - Math.PI / 2);

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(level => {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const x = cx + r * level * Math.cos(a);
      const y = cy + r * level * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = '#DCE9EB';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Axis lines
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.strokeStyle = '#DCE9EB';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Data polygon（ブランド ティール）
  ctx.beginPath();
  angles.forEach((a, i) => {
    const ratio = scores[i] / 100;
    const x = cx + r * ratio * Math.cos(a);
    const y = cy + r * ratio * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(91, 189, 200, 0.28)';
  ctx.fill();
  ctx.strokeStyle = '#46A6B1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  angles.forEach((a, i) => {
    const ratio = scores[i] / 100;
    const x = cx + r * ratio * Math.cos(a);
    const y = cy + r * ratio * Math.sin(a);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#46A6B1';
    ctx.fill();
  });

  // Labels
  const labelLines = [
    ['AI基礎知識'],
    ['ツール操作'],
    ['プロンプト力'],
    ['セキュリティ', '・倫理'],
    ['業務応用']
  ];
  const labelR = r + 28;
  ctx.font = `bold 11px 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif`;
  ctx.fillStyle = '#3C3C3C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  angles.forEach((a, i) => {
    const x = cx + labelR * Math.cos(a);
    const y = cy + labelR * Math.sin(a);
    const lines = labelLines[i];
    const lineH = 14;
    const totalH = (lines.length - 1) * lineH;
    lines.forEach((line, li) => {
      ctx.fillText(line, x, y - totalH / 2 + li * lineH);
    });
  });
}

function showResults() {
  showScreen('screen-results');
  const { axisPct, total } = calcScores();

  $('total-score').textContent = total;

  const canvas = $('radar-canvas');
  drawRadar(canvas, axisPct);

  // Axis score bars
  const container = $('axis-scores');
  container.innerHTML = '';
  AXES.forEach((name, i) => {
    const pct = axisPct[i];
    const item = document.createElement('div');
    item.className = 'axis-score-item';
    item.innerHTML = `
      <div class="axis-score-name">${name}</div>
      <div class="axis-score-bar-bg">
        <div class="axis-score-bar-fill" style="width:0%" data-pct="${pct}"></div>
      </div>
      <div class="axis-score-pct">${pct}点</div>
    `;
    container.appendChild(item);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.querySelectorAll('.axis-score-bar-fill').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    });
  });

  // Recommendation
  const rec = RECS.find(r => total >= r.min && total <= r.max) || RECS[RECS.length - 1];
  $('recommendation').innerHTML = `
    <div class="rec-level">
      <span class="rec-icon">${rec.icon}</span>
      レベル：${rec.level}
    </div>
    <p class="rec-message">${rec.message}</p>
    <div class="rec-course">${rec.course}</div>
  `;
}

// ─── Event listeners ───
$('btn-start').addEventListener('click', () => {
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  showScreen('screen-quiz');
  renderQuestion(current);
});

$('btn-next').addEventListener('click', () => {
  if (current < QUESTIONS.length - 1) {
    current++;
    renderQuestion(current);
  } else {
    showResults();
  }
});

$('btn-back').addEventListener('click', () => {
  if (current > 0) {
    current--;
    renderQuestion(current);
  }
});

$('btn-retry').addEventListener('click', () => {
  showScreen('screen-welcome');
});
