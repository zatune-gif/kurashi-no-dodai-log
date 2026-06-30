// ELECTRON_RUN_AS_NODE を除去してからElectronを起動する
// Claude Code / VSCode 環境では ELECTRON_RUN_AS_NODE=1 が継承されるため必要
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');

const proc = spawn(electronPath, ['.'], { env, stdio: 'inherit', cwd: __dirname });
proc.on('exit', code => process.exit(code ?? 0));
