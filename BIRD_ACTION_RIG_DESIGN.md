# Bird Companion Action Rig Design

This pass treats the original natural bird as the main character and turns it into a small SVG rig, not a static illustration.

## Core Decision

The correct mental model is close to a lightweight game character:

- Keep a base character silhouette.
- Split reusable parts into separate layers.
- Animate those layers in response to input states.
- Avoid storing typed content; only react to rhythm and key type.

For this Electron prototype, the best asset format is layered inline SVG. It gives the same "separate parts" control as a sprite sheet, while staying crisp at any scale and avoiding many cropped PNG files.

## Parts

- `rig-body`: main body and belly mass.
- `rig-wing`: the flapping/tucking wing.
- `rig-beak-upper` and `rig-beak-lower`: chirping mouth shape.
- `rig-eye-open` and `rig-eye-closed`: blink, startle, sleepy states.
- `rig-tail`: small balance and rhythm flick.
- `rig-feet`: grip and landing compression.
- `rig-leaf`: tiny secondary motion on the head.

## Motion States

| Feedback mood | Motion action | Character behavior |
| --- | --- | --- |
| idle | `perch` | Slow breathing and occasional blink. |
| curious | `tilt` | Whole body tilts, beak opens once, tail flicks. |
| busy | `flutter` | Wing flaps, beak opens, feet compress, tail flicks. |
| alert | `startle` | Body pops up, eye enlarges, wing snaps open, beak opens. |
| chorus | `chorus-hop` | Repeated beak chatter, wing flap, hop, feet grip. |
| sleepy | `nestle` | Eye closes, wing tucks, body settles lower. |

## Sprite Sheet vs SVG Rig

A sheet like the reference image is still useful, but at the design stage:

1. Draw character poses and separate parts.
2. Decide which parts must move independently.
3. Rebuild those parts as SVG groups or symbols.
4. Animate the groups with CSS/JS.

Only export cropped PNG frames if the final visual style is pixel art or painterly raster animation. For the current smooth desktop pet, inline SVG groups are the better implementation base.

## Current Prototype Scope

This version keeps the original bird as the only shipped character because it is already readable and charming at desktop-pet scale. Earlier A2/L1 experiments were removed so the prototype can focus on one mature action system.

Implemented actions:

- Chirp: upper beak lifts slightly while the lower beak opens wider.
- Flutter: wing rotates upward, tail flicks, feet compress, leaf bobs.
- Startle: body pops, eye enlarges, wing snaps higher, beak opens.
- Chorus: repeated beak chatter plus wing and tail rhythm.
- Nestle: eye closes and wing tucks inward.

If the visual direction later moves to pixel art, the next step should be a sprite/action sheet with cleanly separated frames. If it stays as a smooth floating desktop pet, continue extending the SVG rig with more facial, wing, tail, and perch states.
