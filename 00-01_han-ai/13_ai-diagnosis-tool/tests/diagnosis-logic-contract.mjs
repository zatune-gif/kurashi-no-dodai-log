import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../diagnosis-simple.js', import.meta.url), 'utf8');
const questionsSource = source
  .split('const QUESTIONS = ')[1]
  ?.split('\n\nconst STAGE_INFO')[0];
assert.ok(questionsSource, 'QUESTIONS definition must remain readable');

const stageSource = source.match(/function getStage\(score\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(stageSource, 'getStage definition must remain readable');

const sandbox = {};
vm.runInNewContext(
  `const QUESTIONS = ${questionsSource}\n${stageSource}\nglobalThis.contract = { QUESTIONS, getStage };`,
  sandbox,
);

const { QUESTIONS, getStage } = sandbox.contract;
assert.equal(QUESTIONS.length, 12, 'the diagnosis must keep all 12 questions');
assert.deepEqual(
  JSON.parse(JSON.stringify(QUESTIONS.map((question) => Array.from(question.options, ({ score }) => score)))),
  Array.from({ length: 12 }, () => [0, 3, 7, 10]),
  'each question must keep the established four-point score scale',
);
assert.equal(
  crypto.createHash('sha256').update(JSON.stringify(QUESTIONS)).digest('hex'),
  '3b86d94630a3b493975693683ac9936e1f24568f43c4131305a4d3995232e828',
  'question wording, answers, scores, and insight copy must not change in this UI task',
);

for (const [score, expected] of [
  [0, '準備期'], [30, '準備期'], [31, '導入期'], [60, '導入期'],
  [61, '活用期'], [80, '活用期'], [81, '推進期'], [100, '推進期'],
]) {
  assert.equal(getStage(score), expected, `stage boundary ${score}`);
}

assert.match(source, /\/\.netlify\/functions\/generate-comment/,
  'the existing recommendation endpoint must remain unchanged');
assert.doesNotMatch(source, /fetch\([^)]*https?:\/\//,
  'the browser flow must not add a direct external API destination');

const pricesHtml = fs.readFileSync(new URL('../prices.html', import.meta.url), 'utf8');
const detailHtml = fs.readFileSync(new URL('../detail.html', import.meta.url), 'utf8');
assert.match(pricesHtml, /① AI活用知識編（90分）<\/th><td>60,000円<\/td><td>80,000円/);
assert.match(pricesHtml, /⑤ 実践編 Claude Code特化（120分・グループMAX3名）<\/th><td colspan="2">180,000円/);
assert.match(pricesHtml, /AI経営改善パッケージ（期間3か月　計16時間分）<\/th><td colspan="2">360,000円/);
assert.match(detailHtml, /AI活用伴走・月2回\|100,000円\/月/);
assert.match(detailHtml, /全コースセット（①②③④\+⑤グループ・10名）\|560,000円/);

console.log('diagnosis logic contract: 23 checks PASS');
