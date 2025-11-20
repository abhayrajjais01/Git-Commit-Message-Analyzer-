# Git Commit Message Analyzer UI

Front-end prototype for a GitHub commit message analyzer. It is a static site built with plain HTML (`index.html`) and a handcrafted stylesheet (`styles.css`) so you can extend it with any backend or JavaScript logic later.

## Preview

- Hero section with CTA buttons and a sample insights card
- Analyzer form for repository URL, optional token, and pasted commit messages
- Results grid that visualizes quality metrics, latest commits, and recommendations
- Guidelines section summarizing best practices for your team
- Footer credits for Priyanshu Gupta & Abhayraj Jaiswal

## Getting Started

1. Clone this repository or download the ZIP.
2. Open `index.html` in your browser (no build tools required).
3. Tweak copy or layout in `index.html`, and adjust theme tokens in `styles.css`.
4. When you are ready for real analysis, hook the form to JavaScript or a backend endpoint that calls the GitHub API and fills the result cards dynamically.

## Customization Ideas

- Replace the placeholder values in the hero sample card and result cards with live metrics.
- Validate the repository URL/token inputs and show inline messages.
- Add a loading state while commits are being fetched or parsed.
- Persist analysis history locally (LocalStorage) or send to your backend for dashboards.

## Tech Stack

- HTML5 + semantic structure (`index.html`)
- Responsive CSS with custom properties, grids, and glassmorphism accents (`styles.css`)

Feel free to fork this UI and integrate it into your Git quality tooling. Pull requests that enhance accessibility, responsiveness, or documentation are welcome.
