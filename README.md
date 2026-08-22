# E Stewart Roofing Ltd

Demo website for E Stewart Roofing Ltd. Single self-contained `index.html` with all
CSS, JavaScript, images and video base64 embedded, so it runs standalone with no
external asset requests. Only outbound request is Google Fonts (Barlow and Inter).

Live: https://innov8-workflows.github.io/E-Stewart-Roofing/

## Do not hand-edit index.html

It is generated. The source lives in the monorepo at
`Claude v4/E Stewart Roofing/`:

- `_src/template.html` — markup, CSS and JS, with `{{ASSET:name}}` tokens
- `_src/assets/` — optimised images and video
- `build.js` — inlines every asset as a data URI and writes `index.html`

To change anything, edit the template and run:

```bash
node build.js
```

Then copy the rebuilt `index.html` here and push.

## Deployment

Deploys via GitHub Actions (`.github/workflows/deploy.yml`), not the legacy Jekyll
builder. `.nojekyll` is present so the file is served verbatim.

## Outstanding

Content still marked `[PLACEHOLDER]` in the page, pending client input: insurance
cover level, workmanship guarantee length, real Google reviews, owner name and bio,
opening hours, full area list, Instagram handle, company number, and accreditation
logo files.

---

Built by [Innov8 Workflows](https://innov8workflows.co.uk)
