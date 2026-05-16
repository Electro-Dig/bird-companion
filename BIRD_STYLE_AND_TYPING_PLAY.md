# Bird Companion 角色与打字玩法下一阶段参考

日期：2026-05-16

这份文档服务于下一轮迭代：把小鸟形象从“可爱图标”提升到“高完成度桌面角色”，同时把键盘敲击从简单反馈推进到轻量游戏化系统。

## 结论

下一步不要继续只在现有 SVG 上微调。更好的路径是先建立一套“小鸟角色设计系统”：

- 3 个高完成度外观方向：自然图鉴风、玩具贴纸风、像素宠物风。
- 每个方向至少有 4 个状态：idle、curious、busy、sleepy。
- 每个状态拆成可动部件：眼睛、嘴、翅膀、尾巴、脚、头冠。
- 先做静态形象，再做 CSS 状态动画，最后再考虑 image generation 或位图素材。

键盘计数可以作为“打字步数计”先行落地。后续不要把它做成生产力 KPI，而是做成小鸟生态系统：敲击次数变成羽毛、鸟巢、迁徙距离、清晨合唱等轻量反馈。

## 可直接参考的小鸟与可爱角色资源

### Kenney Animal Pack

链接：[Kenney Animal Pack](https://kenney.nl/assets/animal-pack)

价值：

- 免费，Creative Commons CC0。
- 包含 80 个 2D 文件。
- 动物包里有 Parrot 和 Penguin，并且同一动物有多种风格。
- OpenGameArt 镜像说明包含 separate PNG sprites、spritesheets、vector。

怎么用：

- 最适合作为“高完成度矢量游戏资产”的结构参考。
- 可以直接参考它的部件组织：大块形体、清晰轮廓、少量颜色、统一阴影。
- 如果要直接改用素材，CC0 许可最干净。

### OpenGameArt Birds Spritesheet

链接：[Birds Spritesheet](https://opengameart.org/content/birds-spritesheet)

价值：

- 标注 CC-BY 3.0 和 CC0。
- 是侧视小鸟 sprite sheet，更适合参考动作帧。
- 可用于思考“跳、飞、落下、停顿”的动作节奏。

怎么用：

- 可以把它当成像素风和动作帧参考。
- 如果直接使用，仍要保留来源记录；如果只参考动作结构，风险更低。

### OpenGameArt Bird SpriteSheet

链接：[Bird SpriteSheet](https://opengameart.org/content/bird-spritesheet)

价值：

- 有 idle、jump、walk 动作。
- 适合研究桌面宠物所需的最小动作集合。

注意：

- 许可是 GPL 2.0，不建议直接并入当前项目。
- 可以只作为“动作设计参考”，不要复制素材。

### React Kawaii

链接：[React Kawaii](https://github.com/elizabetdev/react-kawaii)

价值：

- MIT license。
- 它不是鸟类素材，但它的 SVG 可爱系统很成熟。
- 组件支持多种 mood：sad、shocked、happy、blissful、lovestruck。

怎么用：

- 参考它的表情系统，而不是参考具体形状。
- Bird Companion 可以建立类似 mood API：idle、curious、busy、alert、sleepy。
- 眼睛和嘴的变化应该成为角色可爱感的核心，而不是只靠身体抖动。

### SVG Repo Cute Bird

链接：[Cute Bird SVG Vector](https://www.svgrepo.com/svg/98082/cute-bird)

价值：

- CC0。
- 适合参考小鸟的极简轮廓。

不足：

- 完成度偏 icon，不够桌面宠物。
- 可以参考剪影，但不建议作为最终视觉上限。

## 更高完成度的小鸟设计方向

### 方向 A：自然图鉴 Kawaii

关键词：songbird、field guide、soft sticker、round body、warm beak、clear wing patch。

结构：

- 圆润身体，但保留鸟类识别点：短嘴、头冠、尾羽、脚爪、翅斑。
- 颜色来自真实鸟类，但做低饱和、低对比处理。
- 身体使用 2-3 层渐变，翅膀使用一块清晰深色形。

适合当前项目，因为鸟叫声本身来自真实鸟类，视觉也应该保留一点自然感。

### 方向 B：玩具贴纸鸟

关键词：vinyl toy、soft 3D、desktop sticker、thick outline、tiny feet。

结构：

- 更像一个桌面玩具，身体更大，脚更短，眼睛更有高光。
- 用粗描边和柔和阴影提升完成度。
- 可以把不同鸟种变成不同贴纸皮肤。

适合做“可爱漂亮”，但要注意别太像儿童贴纸，避免失去现在的安静气质。

### 方向 C：像素 Shimeji 鸟

关键词：pixel pet、16-bit companion、idle hop、tiny wing flap。

结构：

- 不追求复杂渐变，而追求可读 silhouette。
- 需要至少 4 帧：idle、blink、hop、chirp。
- 像素风应该用统一网格，而不是普通 SVG 随便方块化。

适合做桌面宠物感，但不适合作为唯一主视觉。建议作为一个可切换皮肤。

## image generation 的合理用法

可以用 image generation 生成参考图，但不要直接把生成位图塞进 Electron。

推荐流程：

1. 生成 6 张概念图：自然图鉴鸟 2 张、玩具贴纸鸟 2 张、像素宠物鸟 2 张。
2. 从每张里提取可复用结构：身体比例、眼睛、翅膀形状、色板。
3. 手工重建为 SVG 或 sprite sheet。
4. 做 3 个候选皮肤，放入外观切换系统。

这样能保留 AI 的探索效率，又能保证项目里的最终资产是可控、可动、可维护的。

## 键盘计数与玩法参考

### Keyboard Counter

链接：[Keyboard Counter](https://keyboardcounter.org/)

启发：

- 最基本的价值就是实时计数。
- 适合用作“键盘步数计”：总敲击、会话敲击、实时速度。
- 它强调本地处理和不上传数据，这一点和 Bird Companion 的隐私边界一致。

### Keys Per Second

链接：[KPS Test](https://kpsecond.netlify.app/)

启发：

- KPS 不只是总数，还可以是节奏强度。
- 它有 Classic、Time Attack、osu!mania、Keybinds 等模式。
- Bird Companion 可以把 KPS 映射成鸟的活跃状态：低速轻啾，中速歪头，高速小群飞。

### MiniWebTool Click Counter

链接：[Click Counter](https://miniwebtool.com/click-counter/)

启发：

- 计数器可以有多个、可以设置 step、可以有 CPS、峰值、session timer、视觉反馈。
- Bird Companion 不需要这么重，但可以吸收三个东西：session、peak burst、floating number feedback。

### Keybara

链接：[Keybara.io](https://www.playkeybaraio.com/)

启发：

- 打字游戏常见结构：leaderboard、friend battles、typing races、accuracy、error heatmaps、per-key stats、streaks、session logs。
- Bird Companion 不适合做竞速大系统，但可以做个人小循环：每日小鸟、连续打字 streak、安静统计。

### Star Rune

链接：[Creative Bloq: Star Rune](https://www.creativebloq.com/3d/video-game-design/explosive-new-game-aims-to-teach-the-ipad-generation-to-type)

启发：

- 重点不是完整单词，而是“每一次 keystroke 都有奖励”。
- 这非常适合 Bird Companion：每次敲击都有一个微小、非打扰的鸟类动作。
- 可以把 space、shift、caps、enter 等特殊键转成节奏事件，而不是只处理字母。

### ClickClack

链接：[ClickClack Typing Trainer](https://apps.apple.com/us/app/clickclack-typing-trainer/id6740695697)

启发：

- 进阶统计包括 WPM、accuracy、consistency、mistyped keys、n-gram analysis、keyboard overlay、typing sound effects。
- Bird Companion 目前不要记录完整文本，也不要分析错误字词。
- 可以只做匿名统计：总敲击、session、控制键比例、burst、KPS。

## Bird Companion 的玩法延展

### 第一层：键盘步数计

已经适合当前原型：

- total keys：累计敲击。
- session：本次打开后的敲击。
- KPS：短期节奏强度。

显示原则：

- 默认隐藏。
- 悬停按钮下方显示。
- 不打断用户正在输入的事情。

### 第二层：鸟类生态反馈

把数字变成有趣的自然意象：

- 每 100 次敲击，小鸟掉一根羽毛。
- 每 500 次敲击，树枝长一片叶子。
- 每 1000 次敲击，解锁一种鸟叫声或皮肤。
- 高 KPS 时出现“忙碌鸟群”。
- 长时间停顿时小鸟睡着。

### 第三层：轻挑战

不要做重型游戏，可以做 1 分钟以内的小挑战：

- 100 keys sunrise：100 次敲击点亮清晨。
- quiet streak：连续稳定打字让小鸟安心。
- chorus minute：1 分钟内触发几次 enter，小鸟合唱。
- migration：今天敲击越多，小鸟飞得越远。

### 第四层：隐私友好的统计

只保存：

- 总敲击数。
- 本次会话敲击数。
- 近期时间戳，用于 KPS。
- 控制键类别计数。

不保存：

- 真实输入内容。
- 完整按键序列。
- 应用窗口名称。
- 粘贴板内容。

## 下一步推荐

下一轮最值得做的是“Bird Skin Pack v1”：

1. 从 Kenney Animal Pack 和 React Kawaii 提炼形状语言。
2. 设计 3 个 SVG 小鸟皮肤：field、toy、pixel。
3. 每个皮肤保留同样的部件位置，方便复用 CSS 动画。
4. 外观按钮从二态切换升级成 skin cycle。
5. 计数达到 100、500、1000 时触发一次小型 milestone feedback。
