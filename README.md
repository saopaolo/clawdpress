# ClawdPress

**An open-source, backend-light CMS that outputs clean, semantic HTML & CSS — built for SEO, AI/LLM visibility, and AI-assisted content creation.**

ClawdPress is for brands and agencies who need a fast, modern marketing site without the weight of a database, a plugin ecosystem, or a JavaScript runtime on every page. Edit content in a Notion-like block editor, get AI help writing and optimising copy with Claude, source images from Unsplash/Pexels/Getty/Cloudinary or your own brand DAM (Cloudinary) — and export a site that is **just HTML and CSS**, readable instantly by search engines, screen readers, and LLM crawlers.

---

## Why ClawdPress?

Most website builders trade search performance for visual convenience — heavy JS bundles, client-side hydration, and bloated markup that crawlers (including AI search engines) struggle to parse. ClawdPress refuses that trade-off:

- **Pure HTML output** — every page is valid, semantic HTML5 with proper `<section>`, `<article>`, `<dl>`/`<dt>`/`<dd>`, and `<figure>` elements. No required client-side JS.
- **SEO built in** — automatic meta tags, Open Graph, Twitter cards, canonical URLs, `schema.org` JSON-LD, `sitemap.xml`, and `robots.txt`.
- **AI-assisted content** — a Claude-powered panel for rewriting headlines, generating meta descriptions, improving copy, and surfacing internal-linking opportunities. Bring your own Anthropic API key.
- **Image search built in** — search Unsplash, Pexels, Getty Images, and your Cloudinary brand library directly from the editor. Inserted images get `alt`, `width`/`height`, `loading="lazy"`, and proper attribution automatically.
- **Backend-light by default, extensible when needed** — content lives as JSON files in `/content` (git-friendly, diffable, no database). When a brand needs a contact form, auth, or light ecommerce, connect Supabase — forms post directly to Supabase from the static HTML, no server runtime required.
- **Deploy anywhere** — `npm run export` produces a fully static `/exported-site` directory deployable to Netlify, Cloudflare Pages, S3, GitHub Pages, or any static host.

---

## Architecture

```
clawdpress/
├── app/
│   ├── editor/              # The CMS editor UI (Next.js page)
│   ├── site/[[...slug]]/    # Live preview of the generated site
│   └── api/
│       ├── ai/               # Claude content-generation endpoint
│       ├── images/           # Unified image-search endpoint
│       └── pages/            # Page content CRUD (reads/writes /content)
├── components/editor/        # Editor UI components (blocks, panels, modals)
├── lib/
│   ├── types.ts              # Core content model (Page, Block, SiteConfig...)
│   ├── build/                # HTML/CSS generation engine
│   │   ├── render-block.ts   # Block → semantic HTML
│   │   ├── generate-page.ts  # Full page → HTML document with SEO/schema
│   │   └── generate-sitemap.ts
│   ├── connectors/
│   │   ├── images/           # unsplash.ts, pexels.ts, getty.ts, cloudinary.ts
│   │   ├── ai/claude.ts       # Claude AI actions
│   │   └── supabase.ts        # Forms / auth / light backend
│   └── store/content-store.ts # Reads/writes /content JSON files
├── content/                   # YOUR SITE CONTENT (git-friendly JSON)
│   ├── site.json
│   └── pages/*.json
├── public/styles/theme.css    # Default exported stylesheet
└── scripts/export-site.ts     # CLI: content → static HTML/CSS
```

### The content model

Everything is plain JSON under `/content`. A page is a list of typed **blocks** (`hero`, `text`, `features`, `cta`, `faq`, `image`). Each block type has a corresponding renderer in `lib/build/render-block.ts` that emits hand-readable, semantic HTML — and a matching editor component in `components/editor/`.

Adding a new block type means:
1. Add its data shape to `lib/types.ts`
2. Add a renderer case in `lib/build/render-block.ts`
3. Add editor fields in `components/editor/BlockEditorPanel.tsx` and a preview in `BlockPreview.tsx`
4. Add it to the block picker in `app/editor/page.tsx`

### Image connectors

Every image provider implements the same `ImageConnector` interface (`lib/connectors/images/types.ts`):

```ts
interface ImageConnector {
  id: 'unsplash' | 'pexels' | 'getty' | 'cloudinary';
  name: string;
  licenseType: 'free' | 'licensed' | 'dam';
  isConfigured(): boolean;
  search(query: string, filters?: ImageSearchFilters): Promise<ImageSearchResult[]>;
}
```

Adding a new provider (Brandfolder, Bynder, your own DAM) is one new file + one line in `lib/connectors/images/index.ts`. The `/api/images` route and the editor's image picker work with any registered connector automatically.

---

## Getting started

```bash
git clone https://github.com/your-org/clawdpress.git
cd clawdpress
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000/editor](http://localhost:3000/editor).

### Configuring connectors (all optional)

Edit `.env` to enable any of:

| Connector | Env vars | Get credentials |
|---|---|---|
| Claude AI | (entered in-editor, BYOK) | https://console.anthropic.com |
| Unsplash | `UNSPLASH_ACCESS_KEY` | https://unsplash.com/developers |
| Pexels | `PEXELS_API_KEY` | https://www.pexels.com/api/ |
| Getty Images | `GETTY_API_KEY`, `GETTY_API_SECRET` | https://developers.gettyimages.com/ |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | https://cloudinary.com/console |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | https://supabase.com/dashboard |

ClawdPress works with **zero** connectors configured — you just won't see image search results or AI suggestions until keys are added.

---

## Exporting a static site

```bash
npm run export
```

This reads everything in `/content` and writes:

```
exported-site/
├── index.html
├── about/index.html
├── faq/index.html
├── styles.css
├── sitemap.xml
└── robots.txt
```

Deploy that directory to any static host. There is no server-side runtime requirement for the published site — Supabase-powered forms submit directly from the browser to your Supabase project.

---

## Roadmap (v0.2+)

- Theme editor (colour/font tokens written to `public/styles/theme.css`)
- Markdown/MDX import & export for git-based authoring workflows
- Media library (reusable assets across pages)
- Multi-user / agency team mode
- One-click deploy integrations (Netlify, Cloudflare Pages APIs)
- Additional block types (testimonials, pricing tables, galleries)
- Additional DAM connectors (Brandfolder, Bynder)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs welcome — especially new block types and image/DAM connectors, which follow a documented adapter pattern.

## License

MIT — see [LICENSE](./LICENSE). Free to self-host, fork, and customise. Commercial hosting and white-label support available — see project site for details.
