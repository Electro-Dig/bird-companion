# Bird Companion Roadmap

This project is strongest when it is treated as a small character system, not just a keyboard soundboard. The next work should deepen the relation between typing rhythm, bird behavior, and desktop presence.

## Current Baseline: v0.2

Version 0.2 establishes the app as a real desktop pet:

- one canonical bird character, with the weaker alternate skins removed;
- automatic left/right facing based on screen position;
- persistent total key count plus session stats on hover;
- feedback frequency control for every 1, 3, or 5 valid keys;
- global volume control;
- bilingual UI and README;
- organized source folders for main process, renderer, docs, and tests.

This gives the project a stable base: the next work should improve character believability and daily-use comfort rather than add many unrelated features.

## 1. Character Animation

The current SVG rig already separates body, wing, beak, eye, tail, feet, and leaf. The next useful step is a proper action table:

- Idle loop: breathing, blink, tiny foot shift, leaf sway.
- Single key: quick beak chirp, cheek pulse, small tail balance.
- Fast typing: wing flutter and branch bounce.
- Backspace: alert snap, eye pop, short recoil.
- Enter: chorus hop with repeated beak chatter.
- Long pause: sleepy nestle, closed eyes, lower posture.

The important design rule is contact. The feet must stay anchored to the branch unless a jump action is explicitly happening. This keeps the bird believable as a desktop pet.

## 2. Sound Feedback System

The current sound system maps key rhythm to bird-call banks. It can become more musical:

- Rhythm-aware call selection: fast bursts use shorter, brighter calls; slow typing uses softer calls.
- Phrase memory: repeated letters form small call motifs instead of isolated random calls.
- Density control: reduce volume and probability during very long typing sessions to avoid fatigue.
- Time-of-day mood: morning calls are brighter, night mode becomes softer and sleepier.
- Bird personality profiles: calm, curious, noisy, shy, focused.

The main constraint is that the app should remain pleasant during real work. It should respond enough to feel alive, but not become an alarm.

## 3. Typing Play

Typing stats can become a light game layer without turning the app into a productivity tracker:

- Daily flock count: total calls triggered today.
- Streak nest: gentle visual nest growth from typing sessions.
- Migration trail: unlock small background accents after sustained use.
- Rhythm badges: calm typing, burst typing, long-focus typing.
- No text content storage: only aggregate counts and timing.

This should stay ambient. The pet should reward rhythm and consistency, not shame speed or productivity.

## 4. Desktop Pet Behavior

The project can borrow from desktop pet conventions while staying minimal:

- Edge awareness: perch near screen edges, look inward automatically.
- Drag response: wobble while being dragged, settle after release.
- Window avoidance: optional mode to keep away from cursor or active window.
- Sleep mode: lower CPU/audio activity after inactivity.
- Tiny context menu: global listening, mute, language, reset stats.

The current frameless transparent window is a good base. The next technical step is polished packaging and autostart support.

## 5. Visual Direction

The strongest current visual identity is the original round orange-blue bird. Keep that as the canonical character and improve it through parts, poses, and motion instead of adding more skins.

Potential refinements:

- Better foot and branch contact.
- Cleaner beak open shapes.
- More expressive wing silhouette for flutter.
- A small set of accessory states: leaf, feather, tiny note bubble.
- Optional high-resolution design pass after the motion language stabilizes.

If the style ever moves to pixel art, switch to a sprite-sheet workflow. For the current smooth desktop pet, SVG rigging is the better production path.

## 6. Packaging And Distribution

Before a public release:

- Add `electron-builder` or a similar packager.
- Produce a signed or clearly documented Windows build.
- Add a first-run permission explanation for global keyboard listening.
- Keep a portable zip option for quick testing.
- Add release notes and versioned changelog.

## 7. Privacy And Trust

This project listens to keys, so trust must be explicit:

- Document exactly what is captured.
- Keep text content out of storage.
- Keep aggregate stats local.
- Make global listening opt-in.
- Keep source code small enough to audit.

This is not just a technical concern. It is part of the product experience.

## 8. Possible Product Forms

- Desktop pet: best current direction.
- Browser toy: useful for demos, but weaker as a daily companion.
- Browser extension: possible for web-only typing feedback, but less charming.
- Input method: not recommended for now; too much system responsibility and privacy weight.
- Creative writing companion: promising if it adds gentle soundscapes, session moods, and exportable typing rituals.

Recommended next milestone: keep the app as a desktop pet, improve the action rig, package a Windows preview build, then test whether the sound feedback remains pleasant over a full day of normal typing.

## Suggested Milestones

### v0.3: Better Character Acting

- Fix foot/branch contact in every motion state.
- Add explicit beak-open and beak-closed frames.
- Add wing-flutter frames for fast typing.
- Add drag and release reactions.
- Add a small action scheduler so sound events and SVG part animations stay synchronized.

### v0.4: Daily Companion Layer

- Add daily key count separate from all-time total.
- Add reset controls for session, day, and all-time stats.
- Add soft daily summaries without storing text content.
- Add optional quiet hours and night-mode call banks.
- Add a small tray menu for mute, global listening, reset, language, and quit.

### v0.5: Distribution Preview

- Add Windows portable zip and installer builds.
- Add first-run onboarding for global keyboard listening and privacy.
- Add app icon, signed metadata if available, and release notes.
- Add a simple update path or clear manual update instructions.

### Later Experiments

- Multiple bird personalities with distinct sound density and animation temperament.
- Sprite-sheet renderer if the visual style moves toward pixel art.
- Ambient writing mode: longer phrases, quieter calls, and session mood changes.
- Community call packs, with license checks before importing sounds.
