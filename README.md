# Bird Companion

Bird Companion is a tiny always-on-top desktop bird that reacts to your typing rhythm with real bird calls and small character animations.

It is not an input method and it does not record what you type. The global listener only maps keyboard events into broad feedback types such as letter, space, enter, and backspace.

## Features

- Desktop pet window built with Electron.
- Global keyboard listening on Windows through `uiohook-napi`.
- Real bird-call feedback from 60 bundled call-focused samples.
- Layered SVG character rig: chirp beak, wing flutter, startle, chorus hop, sleepy nestle.
- Auto-facing behavior: the bird faces right on the left side of the screen and faces left on the right side.
- Hover-only controls and typing stats.
- English by default, with Chinese UI toggle.

## Install

Requirements:

- Windows
- Node.js 20 or newer
- npm

```powershell
git clone https://github.com/Electro-Dig/bird-companion.git
cd bird-companion
npm.cmd install
```

## Run

```powershell
npm.cmd start
```

Or use the helper script:

```powershell
.\start-bird-companion.cmd
```

The helper script installs Electron dependencies on first run if they are missing.

## Use

- Drag the transparent window to place the bird.
- Hover the bird to reveal controls.
- `M`: mute or unmute.
- `G`: toggle global keyboard listening.
- `中文` / `EN`: switch UI language.
- `-`: minimize.
- `x`: close.

When global listening is off, click the bird window and type while it has focus. When global listening is on, the bird reacts while you type in other apps.

## Privacy

Bird Companion does not store typed text.

It stores only:

- total key count
- UI language preference

The global listener ignores `Ctrl`, `Alt`, and `Meta` key combinations to avoid reacting to common shortcuts.

## Tests

```powershell
npm.cmd test
```

Electron smoke checks:

```powershell
.\start-bird-companion.cmd --smoke-test
.\start-bird-companion.cmd --smoke-global
```

Chromium may print GPU warnings during smoke checks. The check is successful when it prints `SMOKE_READY` and exits with code 0.

## Data And Licenses

The bundled bird calls are derived from xeno-canto recordings listed in `data/samples-data.js`. Each sample keeps its source URL and license metadata. Most bundled recordings use Creative Commons BY-NC-SA 4.0, so sound assets are for non-commercial use unless the original recordist grants other rights.

See `THIRD_PARTY_NOTICES.md` for attribution details.

## Development Notes

- Character animation design: `BIRD_ACTION_RIG_DESIGN.md`
- Future development analysis: `ROADMAP.md`

---

# 小鸟伴侣

小鸟伴侣是一个常驻桌面的打字反馈小鸟。它会根据你的键盘节奏播放真实鸟叫，并做出张嘴、拍翼、惊跳、合唱、休息等动作。

它不是输入法，也不会记录你输入的内容。全局监听只把按键归类为字母、空格、回车、删除等反馈类型。

## 使用方式

```powershell
npm.cmd install
npm.cmd start
```

悬停小鸟可以看到控制按钮：

- `M`：静音 / 取消静音
- `G`：开启 / 关闭全局键盘监听
- `中文` / `EN`：切换语言
- `-`：最小化
- `x`：关闭

默认是英文界面，可以切换成中文。小鸟拖到屏幕左侧时会朝右，拖到屏幕右侧时会朝左。
