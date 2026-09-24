# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is an early-stage Arkanoid/Breakout clone. As of now, there is **no game code yet** — only assets and the spec-driven workflow setup:

- `assets/spritesheet-breakout.png` — sprite sheet image.
- `assets/spritesheet.js` — sprite metadata and loader (`SPRITES`, `EXPLOSION_FRAMES`, `loadSpritesheet`, `drawSprite`, `drawFrame`). Expects to run in a browser (`document`, `Image`, `canvas`); loads the PNG from a path relative to the page (`assets/spritesheet-breakout.png`).
- `assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3`.
- No `index.html`, no main game loop, no build tooling, and no `specs/` directory exist yet.

Because there is no build/test/lint tooling in the repo, there are no commands to run yet. Once an HTML entry point and game logic are added, update this section with how to run/build/test the game.

## Spec-driven workflow

This repo uses a two-step, spec-driven development flow via custom skills in `.claude/skills/`:

1. **`/spec <description>`** — collaboratively designs a spec through clarifying questions, then writes it to `specs/NN-slug.md` (created on first use) with state `Draft`. Never writes code.
2. **`/spec-impl <NN-spec-name>`** — implements a spec, but only once its state has been manually changed to `Approved` (or an equivalent word in another language) by a human reviewer. It creates a git branch `spec-NN-slug`, walks through the spec's implementation plan step by step, and pauses for review after each step. Never commits automatically.

Key rules from these skills that apply when working in this repo:

- Spec state must literally say "Approved" (or a clear equivalent) before `/spec-impl` will touch code — `Draft`, `In review`, etc. are hard blocks.
- Branch auto-creation is controlled by `specs/.spec-config.yml` (`AutoCreateBranch: true` by default). If `false`, confirm before creating/switching branches.
- Implementation follows the spec's plan exactly — deviations or ambiguities are raised to the user as options, not improvised.
- Nothing is committed automatically at any point in the workflow; committing is always an explicit user decision.

When asked to add game functionality directly (outside this workflow), it's reasonable to proceed normally — but if the user wants a larger feature planned first, point them to `/spec`.

## Sprite sheet coordinate system

`assets/spritesheet.js` defines fixed pixel regions (`sx, sy, sw, sh`) into the single spritesheet image for each visual element:

- `SPRITES.paddle`, `SPRITES.ball` — single-frame sprites.
- `SPRITES.blocks.<color>` — one frame per block color (`gray`, `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`).
- `EXPLOSION_FRAMES.<color>` — 4-frame animation strips per color, played over `EXPLOSION_DURATION` (150ms).

`drawSprite(ctx, name, x, y, w, h)` resolves sprite names dynamically: a `block_<color>` prefix indexes into `SPRITES.blocks`, anything else is looked up directly in `SPRITES` (e.g. `'paddle'`, `'ball'`). `loadSpritesheet(cb)` must be called (and its callback awaited) before any `drawSprite`/`drawFrame` call, since it lazily loads and caches the image onto an offscreen canvas.
