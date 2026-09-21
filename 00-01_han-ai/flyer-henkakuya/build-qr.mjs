// QRコード生成 + ロゴマーク切り出し
// - qr-shindan.png : AI活用準備度診断（Netlify・安定URL）本番用
// - qr-hp.png      : ざつね屋Webサイト（v3公開準備中）暫定。公開後に再生成・実機スキャン必須
// - logo-mark.png  : assets/logo.png からイラスト部だけを切り出し（テキスト部は不使用）
import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(dir, 'assets');

const URL_SHINDAN = 'https://shindan.zatuneya.com/'; // 旧: ai-shindan-zatuneya.netlify.app（ムームーDNSでCNAME→Netlify、カスタムドメイン追加後に有効）
const URL_HP = 'https://zatuneya.com'; // zatuneya.com 有効（現状は準備中ページ zatune-gif/zatuneya-holding を配信、本HP差し替え待ち）

const qrOpts = {
  errorCorrectionLevel: 'M',
  margin: 2,          // quiet zone（モジュール単位）
  scale: 24,          // 印刷用に大きめ（後段で実寸配置）
  color: { dark: '#111111', light: '#FFFFFF' },
};

await QRCode.toFile(path.join(assets, 'qr-shindan.png'), URL_SHINDAN, qrOpts);
await QRCode.toFile(path.join(assets, 'qr-hp.png'), URL_HP, qrOpts);
console.log('QR: qr-shindan.png / qr-hp.png 生成完了');

// ロゴマーク切り出し：logo.png = 1774x887。イラスト部は左側 約 x:20..585 / y:120..775
const meta = await sharp(path.join(assets, 'logo-src.png')).metadata();
console.log('logo-src.png', meta.width + 'x' + meta.height);
const box = { left: 55, top: 60, width: 640, height: 760 }; // イラスト部のみ（テキスト部除外）
console.log('extract box', JSON.stringify(box), 'within', meta.width + 'x' + meta.height);
const cropBuf = await sharp(path.join(assets, 'logo-src.png')).extract(box).png().toBuffer();
await sharp(cropBuf).trim({ threshold: 15 }).png().toFile(path.join(assets, 'logo-mark.png'));
const m2 = await sharp(path.join(assets, 'logo-mark.png')).metadata();
console.log('logo-mark.png', m2.width + 'x' + m2.height, '（テキスト部を含まないこと・後段スクショで要確認）');

// 代表イラスト肖像：profile-portrait-2.jpg（HP流用・900x1349の全体イラスト）から人物のバストのみ切り出し
const pm = await sharp(path.join(assets, 'portrait-src.jpg')).metadata().catch(() => null);
if (pm) {
  console.log('portrait-src.jpg', pm.width + 'x' + pm.height);
  const pbox = { left: 452, top: 180, width: 398, height: 560 };
  await sharp(path.join(assets, 'portrait-src.jpg'))
    .extract(pbox)
    .toFile(path.join(assets, 'portrait.jpg'));
  const pm2 = await sharp(path.join(assets, 'portrait.jpg')).metadata();
  console.log('portrait.jpg', pm2.width + 'x' + pm2.height, '（人物バストのみ・見出し文字が入っていないこと要確認）');
}

