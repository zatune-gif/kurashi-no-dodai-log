// Netlify Functions（現行形式）。処理本体は ../lib/generate-comment.mjs。
import { createHandler } from '../lib/generate-comment.mjs';

export default createHandler();

export const config = {
  path: '/api/generate-comment',
  method: 'POST',
};
