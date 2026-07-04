# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Purpose

Project 00「半農半AI」の公開サイト・関連ツール群。GitHub Pages（公開）+ Netlify（13番）+ Electron（14番）で構成。

## Environment

- OS: Windows 11 Pro
- Shell: PowerShell 5.1（`&&` 不可。`;` または `if ($?) {}` を使う）
- Local path: `C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log`

## Repository Structure

| パス | 内容 | 実行環境 |
|---|---|---|
| `index.html` 他ルートHTML | GitHub Pages 公開サイト | ブラウザ |
| `00-01_han-ai/13_ai-diagnosis-tool/` | AI活用診断ツール | Netlify（Functions付き） |
| `00-01_han-ai/14_proposal-generator/` | 提案書生成Electronアプリ | Electron |
| `00-01_han-ai/15_prompt-library/` | プロンプトライブラリ | ブラウザ |
| `00-01_han-ai/training-materials/` | 研修資料（Pythonスクリプト） | ローカル実行 |
| `00-02_hannou/` | 農業関連コンテンツ | GitHub Pages |
| `00-03_seikatsu-kiban/` | 生活基盤関連コンテンツ | GitHub Pages |

## Key Paths

- クライアントデータ出力先（14番）: `C:\Users\ooto\work\中小企業向けAI活用支援事業\クライアント`
- GitHub Pages URL: `https://zatune-gif.github.io/kurashi-no-dodai-log/`

## Quality Standards

CLAUDE.md in ClaudeCodeTest1（`C:\Users\ooto\work\ClaudeCode\ClaudeCodeTest1\CLAUDE.md`）のルールブックを参照。

### Top-level rules（never skip）

1. **「見ただけで判断できるか」** — 初見のユーザーが見た瞬間に意味・目的が分かること
2. **略語禁止**
3. **インライン style 禁止**
4. **alert/confirm/prompt 禁止** — カスタムモーダルを使う
5. **エラー返り値は `{ ok: true, data }` / `{ ok: false, error }` 形式**
6. **APIキーはメインプロセスのみ保持**（`.env` 管理、レンダラー露出禁止）
7. **著作権表記は `© [年] ざつね屋`**
