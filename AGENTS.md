# AGENTS.md

## Purpose

This repository is a reference implementation for a very specific class of project:

- A simple static website
- A small set of user-editable input fields
- A live visual preview
- A print-ready or PDF-ready final document
- No backend
- GitHub Pages deployment

Use this document when building the same kind of project again, either manually or through an AI coding agent.

The goal is to avoid re-discovering architecture decisions that already worked here.

## Project Type This Covers

This architecture is appropriate when all of the following are true:

- The user edits a few text or date fields in the browser.
- The page immediately reflects those changes in a formatted layout.
- The final output should be a visually controlled PDF.
- The project should be hostable as static files only.
- The project should work on GitHub Pages.

Examples:

- certificates
- awards
- diplomas
- participation documents
- printable club forms
- simple invitations
- event confirmations

This architecture is not the right default for:

- multi-user applications
- stored user data
- login systems
- server-rendered PDFs
- complex multi-page document generation
- template libraries with hundreds of variants

## Core Architecture

The project uses a static three-layer architecture:

1. `index.html`
   Defines the page structure, form controls, preview layout, and script/style imports.
2. `styles.css`
   Controls the visual design for screen and print/PDF output.
3. `script.js`
   Wires inputs to preview text, handles date formatting, and exports the preview as a PDF.

There is no build step, no framework, and no backend.

This is intentional.

The simplicity is a feature:

- low deployment friction
- easy GitHub Pages hosting
- fast editing
- low maintenance
- no package manager required

## Runtime Model

The runtime model is:

1. The browser loads a static HTML page.
2. The form on the left contains user inputs.
3. The certificate preview on the right contains text placeholders marked with `data-bind` attributes.
4. `script.js` listens to field changes.
5. On every change, the preview text is updated in-place.
6. When the user clicks `PDF herunterladen`, the preview DOM is rasterized to canvas.
7. That canvas is written into a single-page A4 portrait PDF.

This is the key pattern to reuse.

## Why This Architecture Was Chosen

### 1. Static hosting was required

GitHub Pages works best with plain static assets.

That rules out any solution that depends on:

- a Node server
- server-side PDF generation
- authenticated APIs
- runtime database access

### 2. Browser print dialogs are unreliable for polished output

Direct browser printing introduced problems such as:

- browser headers and footers
- date/time metadata
- page numbers
- paper size surprises
- print scaling differences between browsers

Because of that, the project moved to direct PDF creation in JavaScript instead of relying on `window.print()` as the primary path.

### 3. The PDF must be one page with stable layout

The screen preview and the exported PDF both use the same certificate DOM.

This minimizes drift between what the user sees and what gets exported.

## Current File Map

- `index.html`
  Main page and document structure.
- `styles.css`
  Screen layout, certificate design, and print sizing.
- `script.js`
  Binding logic, date handling, and PDF export.
- `logo.png`
  Project-specific header image used inside the certificate.
- `vendor/html2canvas.min.js`
  Converts DOM to canvas.
- `vendor/jspdf.umd.min.js`
  Creates the final PDF.
- `vendor/flatpickr.min.js`
  Date picker widget.
- `vendor/flatpickr-de.js`
  German locale for the date picker.
- `vendor/flatpickr.min.css`
  Styles for the date picker.
- `.github/workflows/deploy-pages.yml`
  GitHub Pages deployment workflow.

## Structural Pattern To Reuse

### HTML pattern

The page is split into two areas:

1. A control panel with form inputs
2. A preview shell with the print/PDF document

This split is recommended because:

- users can edit fields without touching the final layout
- the preview stays visually clean
- the export target is explicit and isolated

The preview document should be a single root element, for example:

```html
<article class="certificate" id="certificate">
    ...exported content...
</article>
```

That single root element is the export boundary.

Do not export the whole page.

Only export the document container.

### Data binding pattern

The preview uses repeated `data-bind` attributes, for example:

```html
<span data-bind="eventName">Vereinsmeisterschaft 2026</span>
```

This is a good pattern for small static apps because:

- it avoids framework complexity
- it keeps the bindings visible in the HTML
- it makes repeated text replacement easy

In JavaScript, keep a `fields` object that maps logical names to input elements.

Then update all matching `[data-bind='name']` elements in one pass.

## PDF Export Pattern To Reuse

### Recommended export path

Use this stack:

- `html2canvas` to render the preview element into a canvas
- `jsPDF` to insert that rendered image into a PDF page

This is the stable path used here.

### Why not use browser print as the primary export

Avoid using browser print as the main PDF path when output must look controlled.

Common problems:

- browser header/footer metadata cannot be reliably disabled from code
- page margins vary
- scaling changes across browsers
- users may accidentally print two pages

### Why html2pdf was abandoned here

This project originally tried `html2pdf`, but the export path failed with image parsing issues.

The working solution is the lower-level combination:

- `html2canvas`
- `jsPDF`

That combination is the preferred reusable solution for similar projects.

### Image compatibility rule

Before export, convert the logo image to a JPEG data URL when needed.

Reason:

- some PDF/image stacks are sensitive to certain image inputs
- converting the logo to a known-safe raster format improves reliability

This project does that in `toJpegDataUrl()`.

If a future project uses additional images, apply the same rule to all export-critical images.

## Date Input Pattern To Reuse

Use a localized date picker rather than the browser default `input type="date"`.

Reason:

- native browser date controls vary by OS and browser
- format control is inconsistent
- first day of week may not match user expectations

Here the chosen solution is `flatpickr` with German localization.

Configured behavior:

- Monday-first weeks
- German locale
- visible date format `DD/MM/YYYY`
- stable underlying date format for processing

This is the correct pattern whenever locale-specific date UX matters.

## Styling Pattern To Reuse

### Screen layout

Use a two-column layout on desktop:

- left: controls
- right: preview

Collapse to one column on smaller screens.

### Export document sizing

The certificate is explicitly sized to A4 portrait proportions.

Use physical page units for export-sensitive layout:

- `210mm x 297mm` for A4 portrait

That should appear in both:

- print CSS
- export logic

This is important because PDF generation should target the same aspect ratio as the visual document.

### Single export root

The export element should have:

- fixed width target
- fixed minimum height target
- controlled padding
- hidden overflow during export

This reduces accidental layout drift.

### Print CSS still matters

Even when direct PDF export is used, keep print CSS in place.

Reason:

- it preserves a fallback path
- it makes the document predictable in browser print previews
- it documents the intended page geometry

## JavaScript Pattern To Reuse

Use plain JavaScript with these responsibilities separated clearly:

### 1. DOM references

Create top-level references for:

- form
- export root
- action button
- all input fields
- key images if export depends on them

### 2. formatting helpers

Keep small pure helper functions for:

- date normalization
- year extraction
- image conversion
- fallback formatting

### 3. preview updater

Maintain one `updatePreview()` function that fully redraws bound text values.

This is the central state-sync function.

Do not spread preview mutations across many unrelated listeners.

### 4. export handler

Keep one explicit async export function bound to the PDF button.

That function should:

1. verify required libraries exist
2. temporarily enforce export sizing
3. normalize images if needed
4. render the export root to canvas
5. create the PDF
6. restore temporary DOM changes in `finally`

That `finally` restoration step is important and should always be preserved.

## Reusable Build Recipe

When creating a similar project, follow this sequence.

### Step 1: define the document content first

Before coding, list the final printable document from top to bottom.

Example template:

- logo
- title
- fixed text
- recipient name
- achievement line
- event line
- closing text
- city and year

Do not start with form inputs.

Start with the final document.

### Step 2: mark variable fields

Identify which parts are dynamic.

Examples:

- person name
- event name
- placing
- date
- city

Only these should be editable inputs.

### Step 3: build the preview document HTML

Create the final printable DOM first.

Use `data-bind` attributes for every dynamic text placeholder.

### Step 4: build the control form

Add one input per dynamic field.

Keep labels explicit.

Keep the control surface smaller than the preview surface.

### Step 5: write the binding logic

Implement `updatePreview()` and register `input` and `change` listeners.

### Step 6: lock the printable geometry

Pick the page format early.

Examples:

- A4 portrait
- A4 landscape
- custom certificate ratio

Then make both CSS and PDF export code match that exact geometry.

### Step 7: add direct PDF export

Use:

- `html2canvas`
- `jsPDF`

Keep the export target restricted to the document root.

### Step 8: localize any special widgets

If the project uses dates, numbers, or locale-sensitive formatting, install that explicitly.

Do not rely on browser defaults.

### Step 9: deploy as static site

Use GitHub Pages with a workflow that matches the actual branch in use.

In this repository, both `main` and `master` are supported because branch mismatches caused avoidable confusion.

## Rules For Future AI Agents

If an AI agent is asked to build a similar project, it should follow these rules.

### Required decisions

- Use a static site unless the user explicitly needs a backend.
- Use a dedicated preview/export root element.
- Use direct PDF generation, not browser print, as the primary export path.
- Use local vendored browser libraries when reliability matters.
- Use explicit page dimensions for export-sensitive layouts.
- Use localized date input when locale matters.

### Avoid these mistakes

- Do not start with a framework unless there is a clear need.
- Do not assume browser print headers/footers can be disabled by code.
- Do not let the export root be the whole page.
- Do not mix screen-only UI controls into the exported region.
- Do not rely on native date input behavior for locale-sensitive UX.
- Do not assume GitHub Pages is deploying from the branch you expect.
- Do not use remote CDN-only dependencies if the site should be robust and self-contained.

### Preferred implementation order

1. final document structure
2. screen preview styling
3. field binding
4. PDF export
5. localized date picker
6. deployment workflow

## Common Failure Modes

### PDF export does nothing

Check:

- required vendor scripts are loaded
- the export button is bound
- browser console errors exist

### PDF export fails on images

Check:

- image paths are correct
- the image is fully loaded before export
- export-critical images are converted to JPEG data URLs if necessary

### PDF output is more than one page

Check:

- export root uses correct A4 proportions
- CSS size and PDF size match
- padding and typography are not too large
- overflow is controlled

### GitHub Pages shows stale behavior

Check:

- the workflow actually ran
- the correct branch triggered deployment
- the latest commit included all vendor files
- the page was hard reloaded

### Date picker format looks wrong

Check:

- locale file is loaded
- `flatpickr.localize(...)` was applied
- `altFormat` matches the intended user-facing format

## Acceptance Checklist For Similar Projects

A similar project is done when all of the following are true:

- The user can edit all required fields.
- The preview updates immediately.
- The final document looks correct without editing HTML manually.
- The exported PDF is one page.
- The PDF page size matches the intended paper format.
- No browser header/footer metadata appears in the main export path.
- The project works as plain static files.
- The project is deployable on GitHub Pages.
- The branch configuration matches the actual repository branch.

## Minimal Reusable Stack

For projects of this type, prefer this stack by default:

- HTML
- CSS
- vanilla JavaScript
- `html2canvas`
- `jsPDF`
- `flatpickr` for localized date input when needed
- GitHub Actions for Pages deployment

This should be the default starting point unless a future project has requirements that clearly justify something more complex.

## Final Recommendation

If the next project is “small form in browser -> polished single-page PDF”, start from this repository structure directly.

Do not redesign the technical approach unless one of these changes:

- multiple templates are needed
- multi-page PDF generation is needed
- persistent saved documents are needed
- backend validation is needed
- branded theming becomes significantly more complex

Until then, this architecture is the correct baseline.