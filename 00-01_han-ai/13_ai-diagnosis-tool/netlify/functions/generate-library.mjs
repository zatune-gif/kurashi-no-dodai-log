// Netlify Functions（現行形式）。処理本体は ../lib/generate-library.mjs。
import { createHandler } from '../lib/generate-library.mjs';

export default createHandler();

export const config = {
  path: '/api/generate-library',
  method: 'POST',
  // Claude API を呼ぶため費用が発生する。同一IPからの連続呼び出しを Netlify 側でも止める
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
