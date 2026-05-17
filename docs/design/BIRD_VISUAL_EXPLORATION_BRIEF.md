# Bird Companion 开放式小鸟形象探索 Brief

日期：2026-05-16

本轮目标不是继续改现有 SVG，而是先充分发散，生成一批差异足够大的小鸟形象。后续从图像中挑选方向，再手工转成可动画、可维护的 SVG。

## 真实参考素材检查

我已下载并检查：

- OpenGameArt Birds Spritesheet：`reference-downloads/birds.png`
- Kenney Animal Pack：`reference-downloads/kenney-animalpack.zip`
- 参考 contact sheet：`reference-downloads/reference-contact-sheet.png`

可确认的素材结构：

- OpenGameArt Birds Spritesheet 是 384x128 的侧视小鸟 sprite，适合研究飞行动作和低分辨率轮廓。
- Kenney Animal Pack 包含 Parrot 和 Penguin 的 round、square、outline、without details 等变体，适合研究小尺寸可读性、统一模板和高完成度扁平动物资产。

## 来源与许可

- [Kenney Animal Pack](https://kenney.nl/assets/animal-pack)：页面标注 Creative Commons CC0，适合直接参考或改造。
- [OpenGameArt Animal Pack mirror](https://opengameart.org/content/animal-pack)：同样标注 CC0，并说明包含 separate PNG sprites、spritesheets、vector。
- [OpenGameArt Birds Spritesheet](https://opengameart.org/content/birds-spritesheet)：页面列出 CC-BY 3.0 和 CC0，适合参考动作结构。
- [React Kawaii](https://github.com/elizabetdev/react-kawaii)：MIT，适合参考 mood / 表情系统，不应临摹具体组件。
- [SVG Repo Cute Bird](https://www.svgrepo.com/svg/98082/cute-bird)：CC0，适合参考极简鸟类剪影。

## 本轮生成策略

这次 contact sheet 必须避免之前的问题：

- 不要同一个圆鸟换颜色。
- 不要都站在同一根树枝上。
- 不要都用同一种渐变和眼睛。
- 不要先考虑能否马上转 SVG，先找角色方向。
- 每个概念都要有独立 silhouette、材质、性格、动作潜力。

## 12 个生成方向

A. 打字机麻雀  
复古办公小物，身体像打字机按键，半机械半毛绒，适合“啄键”动作。

B. 霓虹夜莺  
赛博透明羽毛，修长流线，拖动时有光轨，适合夜间模式。

C. 棉花云团鸟  
几乎是蓬松圆球，软毛玩偶质感，反应慢半拍，治愈感强。

D. 折纸翠鸟  
尖喙、锐角翅膀、几何折面，适合快速、精确、快捷键感。

E. 墨水乌鸦幼鸟  
大头、乱翅、墨水晕染，聪明淘气，吐出墨点音符。

F. 水晶蜂鸟  
极小身体、长喙、宝石尾巴、透明玻璃材质，适合高 KPS 高频振翅。

G. 面包小鸡  
烘焙面包 / 软陶质感，圆滚滚、短翅、掉芝麻，亲和力强。

H. 蒸汽朋克啄木鸟  
长喙、齿轮背包、铜件皮革，像打孔机一样连续啄键。

I. 星尘猫头鹰  
大圆眼、披风翅、夜空绒布和星点刺绣，适合夜班陪伴。

J. 像素文鸟  
8-bit / 16-bit 宠物，块状头身、阶梯尾，适合 Shimeji 动作。

K. 盆栽鹦鹉  
鸟身和植物结合，尾羽像嫩芽，陶盆底座，像会说话的小绿植。

L. 宇航企鹅雏鸟  
短胖身体、透明头盔、小推进器，软萌科幻，拖动时微重力漂浮。

## Contact Sheet Prompt

```text
Create an image generation contact sheet for a desktop pet app: "a draggable little bird companion that chirps when the user types on the keyboard." Show 12 highly distinct bird character concepts in a clean 4x3 grid, labeled A-L clearly under each concept.

Each bird must have a strong readable silhouette, full body view, isolated on a plain warm off-white background, consistent scale, suitable for later SVG vectorization. Use clean shapes, clear edges, minimal clutter, expressive poses, no complex background.

A: retro typewriter sparrow, round compact body, mechanical keycap details, cream black brass brown, serious tiny office assistant, pecking a keyboard key.
B: neon cyber nightingale, sleek long neck and glowing tail feathers, translucent futuristic material, electric blue magenta teal black, cool mysterious, leaving light trails.
C: fluffy cloud bird, round cotton ball body, tiny wings and feet, soft plush cloud material, warm white pastel pink sky blue, sleepy gentle, bouncing softly.
D: origami kingfisher, sharp beak and angular folded wings, paper low-poly vector style, cyan blue orange white navy, agile precise, diving toward a key.
E: ink baby crow, oversized head, messy little wings, watercolor ink wash style, black grey blue purple, clever mischievous, chirping ink-note droplets.
F: crystal hummingbird, tiny body, long beak, gemstone tail, transparent glass crystal material, emerald rose ice blue gold, hyperactive, hovering near cursor.
G: bread chick, plump bun-like body, soft baked clay texture, toast gold cream caramel orange, silly affectionate, pecking crumbs on keycap.
H: steampunk woodpecker, long beak, crest, gear backpack, brass leather rivets, copper brown black deep red gold, focused engineer, rhythmic pecking.
I: stardust owl, big round eyes, face disk, cape-like wings, velvet night-sky material with embroidered stars, midnight blue silver gold lavender, calm wise, blinking beside cursor.
J: pixel finch, blocky round head, square body, stair-step tail, 8-bit pixel art style, red beak grey white coral black outline, energetic retro game pet, jumping on a key.
K: plant parrot, bird body mixed with leaves, sprout tail, small terracotta pot base, natural botanical illustration style, fresh green lemon yellow terracotta white, cheerful mimic, shaking leafy wings.
L: astronaut penguin chick, short round body, clear space helmet, tiny jetpack, soft sci-fi toy style, black white silver orange pale blue, brave clumsy explorer, floating in low gravity.

Requirements: 4 columns x 3 rows, A-L labels, no watermark, no logo, no text except the A-L labels, no background scene, no photorealism, crisp vector-friendly character concept art, readable silhouette, simple color blocking, clean contour lines, desktop pet mascot design sheet.
```

## 后续 SVG 化原则

选中方向后，不直接照描整张生成图。应该提取：

- silhouette
- 色板
- 五官比例
- 可动画部件
- 与打字行为的关系

然后重建为项目内 SVG，并确保能拆成 `body / wing / eye / beak / tail / feet / accessory`。
