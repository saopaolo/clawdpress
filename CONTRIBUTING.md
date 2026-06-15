# Contributing to ClawdPress

Thanks for your interest in ClawdPress! The project is intentionally structured so that the most common contributions — new block types and new image/DAM connectors — follow a small, predictable pattern.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Adding a new block type

1. **Define the data shape** in `lib/types.ts` — add a `*BlockData` interface and include it in the `BlockData` union and `BlockType`.
2. **Add the HTML renderer** in `lib/build/render-block.ts` — a new `case` in `renderBlock()` that returns semantic HTML (no inline styles; classes go in `public/styles/theme.css`).
3. **Add the CSS** for your block's classes in `public/styles/theme.css`.
4. **Add the editor preview** in `components/editor/BlockPreview.tsx`.
5. **Add the editor fields** in `components/editor/BlockEditorPanel.tsx`.
6. **Add sensible defaults** in `components/editor/block-defaults.ts`.
7. **Register it** in the block picker (`BLOCK_TYPES` in `app/editor/page.tsx`).

## Adding a new image/DAM connector

1. Create `lib/connectors/images/<provider>.ts` implementing the `ImageConnector` interface from `lib/connectors/images/types.ts`.
2. Register it in `lib/connectors/images/index.ts`.
3. Add its env vars to `.env.example` and the README table.

No changes to the editor UI or API routes are needed — both iterate the connector registry.

## Code style

- TypeScript strict mode. Avoid `any` where a real type is easy to express (adapters dealing with third-party JSON are the accepted exception).
- Keep generated HTML hand-readable — this is a core product value, not just an implementation detail.
- Prefer plain CSS classes over inline styles in anything that ends up in exported output.

## Pull requests

- Keep PRs focused — one block type or one connector per PR is easiest to review.
- Describe what the exported HTML looks like for any new block type.
- If your change affects the content schema (`lib/types.ts`), note any migration implications for existing `/content/pages/*.json` files.
