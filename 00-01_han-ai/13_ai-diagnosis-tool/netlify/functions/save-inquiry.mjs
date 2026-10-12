// Netlify Functions（現行形式）。処理本体は ../lib/save-inquiry.mjs。
import { createHandler } from '../lib/save-inquiry.mjs';

export default createHandler();

export const config = {
  path: '/api/save-inquiry',
  method: 'POST',
  // メール送信の踏み台化を防ぐため、同一IPからの連続送信を Netlify 側でも止める
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
