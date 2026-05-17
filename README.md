# Bird Companion

[English](#english) | [中文](#中文)

<p align="center">
  <img src="src/renderer/bird-mark.svg" width="180" alt="Bird Companion mascot">
</p>

## English

Bird Companion is a tiny always-on-top desktop bird that reacts to your typing rhythm with bird calls, motion, and lightweight typing stats. It is built as an Electron desktop pet rather than a browser page, so it can sit on your desktop, be dragged around, and optionally listen for global keyboard activity.

### Highlights

- Desktop pet window with transparent, frameless, always-on-top behavior.
- Bird calls driven by typing rhythm, with mute, volume, and feedback-frequency controls.
- Feedback frequency modes: `1`, `3`, or `5` keys per bird-call response.
- Persistent total key counter and session typing speed display.
- Optional global listening for cross-app typing feedback.
- Automatic facing direction: the bird looks inward from the left or right side of the screen.
- English/Chinese interface toggle. English is the default.

### Install

Requirements:

- Windows 10/11
- Node.js 20+

```powershell
git clone https://github.com/Electro-Dig/bird-companion.git
cd bird-companion
npm install
npm start
```

You can also run the helper script after dependencies are installed:

```powershell
.\start-bird-companion.cmd
```

### Use

- Drag the bird window to place it on the desktop.
- Hover the bird to reveal the controls and detail panels.
- Press `M` to mute/unmute.
- Press `G` to toggle global keyboard listening.
- Press `中` / `EN` to switch language.
- Press the feedback-rate button to cycle through `1`, `3`, and `5`.
- Use `-` / `+` in the sound panel to adjust volume.

The visible key badge shows your saved total key count. The expanded stats panel shows total keys, session keys, and current keys per second. If global listening is off, only focused-window typing is counted. If global listening is on, cross-app typing can be counted while the app is running.

### Privacy

Bird Companion counts typing events but does not store typed characters or text content. Persistent local storage only keeps the total key count, language, bird style, and sound settings.

### Project Structure

```text
bird-companion/
  data/                  Bird-call metadata and bundled assets
  docs/                  Design notes, research, and roadmap
  src/main/              Electron main process and global keyboard bridge
  src/renderer/          Desktop pet UI, mascot, animation, audio logic
  tests/                 Node-based unit and smoke-oriented tests
```

### Development

```powershell
npm test
npm run smoke
```

`npm test` verifies the sound engine, global key translation, mascot style state, i18n copy, settings, window orientation, and typing stats. `npm run smoke` opens Electron in smoke-test mode and verifies the renderer boots successfully.

### Roadmap

Possible next directions are collected in [docs/ROADMAP.md](docs/ROADMAP.md). Short version:

- richer bird action rig: wing flaps, beak-open chirps, hops, sleep, attention, and idle loops;
- packaged Windows release with installer and auto-start options;
- daily typing summaries and reset controls;
- more sound personalities and call-bank selection;
- optional Pomodoro/focus modes driven by typing rhythm;
- mascot skin system based on higher-quality sprite or vector rigs.

### Audio Credits

The bundled bird calls are derived from xeno-canto recordings listed in `data/samples-data.js`. Each sample keeps its source URL and license metadata. Most bundled recordings use Creative Commons BY-NC-SA 4.0, so sound assets are for non-commercial use unless the original recordist grants other rights.

### License

See [LICENSE.md](LICENSE.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## 中文

Bird Companion 是一个常驻桌面的小鸟宠物。它会根据键盘输入节奏发出鸟叫、做出动作反馈，并展示轻量的打字统计。它不是浏览器页面，而是一个 Electron 桌面应用，所以可以悬浮在桌面、拖动摆放，也可以选择开启全局键盘监听。

### 亮点

- 透明、无边框、始终置顶的桌面宠物窗口。
- 根据打字节奏触发鸟叫、动画和视觉反馈。
- 支持静音、整体音量、反馈频率调整。
- 反馈频率支持每 `1`、`3`、`5` 次按键触发一次鸟叫。
- 默认显示累计按键次数，悬停后显示本次输入和当前 KPS。
- 支持可选的全局键盘监听，用于其他软件中的打字反馈。
- 自动判断朝向：放在屏幕左侧时朝右，放在右侧时朝左。
- 支持中英文界面切换，默认英文。

### 安装

环境要求：

- Windows 10/11
- Node.js 20+

```powershell
git clone https://github.com/Electro-Dig/bird-companion.git
cd bird-companion
npm install
npm start
```

依赖安装完成后，也可以运行启动脚本：

```powershell
.\start-bird-companion.cmd
```

### 使用

- 拖动小鸟窗口，把它放在桌面合适的位置。
- 鼠标悬停在小鸟身上，会显示控制按钮和信息面板。
- 点击 `M` 静音/取消静音。
- 点击 `G` 开启/关闭全局键盘监听。
- 点击 `中` / `EN` 切换语言。
- 点击反馈频率按钮，在 `1`、`3`、`5` 之间循环。
- 在声音面板里用 `-` / `+` 调整整体音量。

默认可见的小徽章显示累计按键次数。展开后的统计面板显示累计按键、本次按键和当前每秒按键数。如果没有开启全局监听，只有应用窗口获得焦点时才会计数和反馈；开启全局监听后，应用运行期间可以统计其他软件中的键盘输入。

### 隐私

Bird Companion 只统计按键事件，不保存具体输入的字符或文本内容。本地持久化只保存累计按键次数、语言、小鸟形象和声音设置。

### 项目结构

```text
bird-companion/
  data/                  鸟叫元数据和内置声音资源
  docs/                  设计记录、调研和路线图
  src/main/              Electron 主进程和全局键盘桥接
  src/renderer/          桌面宠物 UI、小鸟形象、动画和音频逻辑
  tests/                 Node 单元测试和 smoke 测试
```

### 开发

```powershell
npm test
npm run smoke
```

`npm test` 会检查声音引擎、全局按键转换、小鸟形象状态、国际化文案、设置、窗口朝向和打字统计。`npm run smoke` 会以 smoke-test 模式打开 Electron，确认渲染进程可以正常启动。

### 后续方向

更完整的规划见 [docs/ROADMAP.md](docs/ROADMAP.md)。核心方向包括：

- 更成熟的小鸟动作骨架：扇翅、张嘴鸣叫、跳跃、睡眠、注意力、待机循环；
- Windows 安装包、开机启动和托盘控制；
- 每日打字总结、重置按钮和长期统计；
- 更多声音人格和鸟叫库选择；
- 基于输入节奏的番茄钟/专注模式；
- 基于高质量 sprite 或 vector rig 的小鸟皮肤系统。

### 声音来源

内置鸟叫来自 `data/samples-data.js` 中列出的 xeno-canto 录音。每条声音都保留了来源链接和授权信息。多数内置录音使用 Creative Commons BY-NC-SA 4.0，因此声音资源默认只适合非商业用途，除非原录音者另行授权。

### 许可证

见 [LICENSE.md](LICENSE.md) 和 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
