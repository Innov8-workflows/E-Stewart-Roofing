# E Stewart Roofing Ltd

Static SEO website for E Stewart Roofing Ltd, a family-run roofing and building
contractor covering Glasgow, Ayrshire and Central Scotland.

Live: https://innov8-workflows.github.io/E-Stewart-Roofing/

34 pages plus a 404: home, a services hub with 15 service pages, an areas hub with
9 town pages, gallery, reviews, about, FAQs, contact, privacy and terms.

## This folder is build output. Do not hand-edit it.

Every `.html` file here is generated. The source lives in the monorepo at
`Claude v4/E Stewart Roofing/site/`:

| File | What it holds |
|---|---|
| `src/data.js` | business facts, locations, gallery, general FAQs, and the `pending` list |
| `src/services.js` | the 15 service pages: answer, intro, signs, process, FAQs |
| `src/lib.js` | shared page shell, head, nav, footer, JSON-LD graph, Lucide icons |
| `src/pages.js` | home, services hub, service pages, areas hub, location pages |
| `src/pages-info.js` | about, contact, our work, reviews, FAQs, privacy, terms, 404 |
| `src/site.css` `src/pages.css` | styles (concatenated and content-hashed at build) |
| `src/site.js` | nav, gallery lightbox, WhatsApp quote form |

To change anything:

```bash
cd "K:/AI/innov8 Workflows/Claude v4/E Stewart Roofing/site" && node generate.js && node check.js
```

Then copy `_site/` over this folder and push. `check.js` must report **no problems**
before deploying: it catches dead internal links, missing assets, malformed JSON-LD,
duplicate titles and descriptions, and pages with the wrong number of `h1` elements.

## Accuracy rules

Everything in `biz` in `data.js` is a public business claim and comes from the client's
onboarding submission. Nothing may be invented. Anything the client has not confirmed
sits in `pending`, renders with a visible placeholder chip, and is printed in the build
report. Accreditations are **not** claimed: the van carries Checkatrade, MyBuilder and
City and Guilds marks but no files or membership numbers were supplied.

Review cards are clearly labelled samples and there is deliberately **no**
`aggregateRating` in the schema, because a star rating without real reviews earns a
manual penalty.

## SEO, GEO and AEO

- Unique title, meta description and canonical on every page; one `h1` per page
- `RoofingContractor` + `LocalBusiness` JSON-LD with `areaServed`, `hasOfferCatalog`,
  postal address and `foundingDate`; `Service` schema per service page;
  `BreadcrumbList` throughout
- `FAQPage` schema on the FAQ page and on service and area pages. **Deliberately not on
  the homepage** — the FAQ block was removed from it, and FAQPage schema may only
  describe questions actually visible on the page carrying it
- Answer-first "In short" block opening every service and area page, written to stand
  alone when an answer engine lifts it out
- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended and
  the rest; `llms.txt` summarises the site for language models
- `sitemap.xml` with 34 URLs

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`), not the legacy Jekyll builder.
`.nojekyll` is present.

## Domain

`www.estewartroofingltd.co.uk` is the client's preferred domain and is **not live yet**.
The site currently canonicalises to the GitHub Pages URL. To cut over: change `SITE_URL`
in `src/data.js`, add a `CNAME` file to this folder, point DNS at GitHub Pages, and
rebuild. Nothing else needs touching, because every internal link is relative.

---

Built by [Innov8 Workflows](https://innov8workflows.co.uk)
