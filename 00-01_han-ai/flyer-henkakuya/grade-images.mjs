// ヒーロー画像（hero.jpg）の青みがかった淡い色味に、他の表面写真を合わせる
// 元画像は assets/_raw/ に退避してから上書き。再実行は _raw から掛け直す。
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const A = path.join(dir, 'assets');
const RAW = path.join(A, '_raw');
fs.mkdirSync(RAW, { recursive: true });

// hero は基準色なので軽め、他は明るさを hero(平均≈152) に寄せてから同じグレードを掛ける
const TARGET_LUMA = 152;
const jobs = [
  { f: 'hero.jpg',         maxLift: 1.06 },
  { f: 'pkg.jpg',          maxLift: 1.10 },
  { f: 'svc-training.jpg', maxLift: 1.34 },
  { f: 'svc-order.jpg',    maxLift: 1.30 },
  { f: 'svc-banso.jpg',    maxLift: 1.38 },
];

for (const { f, maxLift } of jobs) {
  const src = path.join(A, f);
  const raw = path.join(RAW, f);
  if (!fs.existsSync(raw)) fs.copyFileSync(src, raw);

  const st = await sharp(raw).stats();
  const mean = (st.channels[0].mean + st.channels[1].mean + st.channels[2].mean) / 3;
  const bright = Math.min(maxLift, Math.max(0.8, TARGET_LUMA / mean));

  await sharp(raw)
    .modulate({ saturation: 0.62, brightness: bright })   // 彩度を落とす＋明るさを揃える
    .linear(                                              // 冷色キャスト＋黒を持ち上げてフェード感
      [0.95, 0.97, 1.0],                                 // R,G,B ゲイン（Bを一番残す）
      [6,    8,    14],                                   // R,G,B オフセット（B多め＝青寄り）
    )
    .gamma(1.02)
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toFile(src + '.tmp');
  fs.renameSync(src + '.tmp', src);

  const st2 = await sharp(src).stats();
  const m2 = st2.channels.slice(0, 3).map((c) => Math.round(c.mean));
  console.log(f.padEnd(18), 'bright x' + bright.toFixed(2), ' -> mean RGB', m2.join(','));
}
console.log('完了：_raw に原本、assets 直下がグレード後');
