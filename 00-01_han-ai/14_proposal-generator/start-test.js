// テストスイートをElectronで実行するラッパー（ELECTRON_RUN_AS_NODE除去）
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
const proc = spawn(electronPath, ['test-suite.js'], { env, stdio: 'inherit', cwd: __dirname });
proc.on('exit', code => process.exit(code ?? 0));
