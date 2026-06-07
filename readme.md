# Climbing Certificates

Simple one-page certificate generator for a German climbing club. Fill in the fields in the browser and print the page to PDF.

## Local use

Open `index.html` in a browser, or serve the repository with any static web server.

## GitHub Pages

This repository includes a GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

After pushing the repository to GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set the source to **GitHub Actions**.
4. Push to `main` and GitHub will publish the site automatically.

The page includes a print button and print-specific styles so the certificate can be saved as a PDF.