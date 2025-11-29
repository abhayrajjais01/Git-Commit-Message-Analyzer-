# Git Commit Message Analyzer

A fully functional web application that analyzes Git commit messages for quality, convention compliance, and best practices. Built with plain HTML, CSS, and vanilla JavaScript - no build tools or frameworks required.

## Features

- **Hero section** with CTA buttons and a sample insights card showing key metrics
- **Analyzer form** accepting repository URLs, optional GitHub personal access tokens, and manual commit message input
- **Live commit analysis** that evaluates:
  - Average commit message length (ideal: 30-72 characters)
  - Conventional Commits format compliance (feat:, fix:, chore:, docs:, style:, refactor:, perf:, test:, build:, ci:, revert:, hotfix:)
  - Imperative tone usage percentage (action verbs: add, fix, update, remove, improve, refactor, optimize, document, test, clean, guard, handle, support, merge, release, bump)
  - Detection of vague messages and messages exceeding 72 characters
- **Comprehensive Rating System** with scoring algorithm:
  - **Good** (75-100): Excellent commit quality following best practices
  - **Average** (50-74): Decent quality with room for improvement
  - **Bad** (30-49): Quality needs attention
  - **Need Improvement** (0-29): Significant improvement required
- **GitHub API integration** to fetch and analyze the 10 most recent commits from any public repository
- **Commit timeline** displaying fetched commits with author, date, SHA, and direct GitHub links
- **Results grid** showing overall rating, message statistics, quick insights, and warnings
- **Guidelines section** explaining best practices: structure, scope, detail, and automation
- **Modern frosted glass UI** with gradient backgrounds, smooth transitions, and responsive layout
- **No build tools required** — pure HTML5, CSS3, and vanilla JavaScript
- **Privacy-focused** — all analysis happens in-browser, nothing is stored on servers

## Getting Started

1. Clone this repository or download the ZIP.
2. Open `index.html` in your browser (no build tools required).
3. Use the analyzer in two ways:
   - **Paste commit messages**: Enter one commit message per line in the textarea
   - **GitHub repository**: Enter a GitHub repo URL (e.g., `github.com/facebook/react`) to fetch commits automatically
4. Click "Run analysis" to see results instantly.

## How It Works

The analyzer examines each commit message and generates a comprehensive quality report:

### Analysis Metrics
- **Conventional Commits Format**: Checks if messages start with `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `revert:`, or `hotfix:`
- **Imperative Tone**: Detects action verbs like "add", "fix", "update", "remove", and others to ensure commands are in imperative mood
- **Message Length**: Warns when messages exceed 72 characters or are under 10 characters
- **Vagueness Detection**: Flags messages starting with "update", "changes", "stuff", or lacking sufficient detail

### Scoring Algorithm
The rating score combines multiple factors:
- **Conventional Commits** (0-30 points): Higher percentage yields more points
- **Imperative Tone** (0-25 points): Based on usage of action verbs
- **Message Length** (0-20 points): Ideal range is 30-72 characters
- **Warnings** (0-25 bonus points): No warnings grant bonus points; warnings reduce the score
- **Penalties**: Critical issues (0% conventional format, >50% vague/long messages) apply deductions

### Data Fetching
When a GitHub repository URL is provided, the analyzer uses the GitHub REST API to fetch the 10 most recent commits, extracting the subject line and metadata for each.

## Supported Commit Types

The analyzer recognizes the following conventional commit types:
- `feat:` — A new feature
- `fix:` — A bug fix
- `chore:` — Maintenance tasks, dependency updates
- `docs:` — Documentation changes
- `style:` — Code formatting, missing semicolons, etc.
- `refactor:` — Code changes that neither fix bugs nor add features
- `perf:` — Performance improvements
- `test:` — Adding or updating tests
- `build:` — Changes to build system or dependencies
- `ci:` — CI/CD configuration changes
- `revert:` — Reverting a previous commit
- `hotfix:` — Critical production fixes

## Supported Imperative Verbs

The analyzer checks for these imperative verbs to encourage command-style commit messages:
- add, fix, update, remove, improve, refactor, optimize, document, test, clean, guard, handle, support, merge, release, bump

## Tech Stack

- **HTML5** (`index.html`) — Semantic structure and form elements
- **CSS3** (`styles.css`) — Responsive design with CSS Grid, custom properties, modern styling, and gradient backgrounds
- **Vanilla JavaScript** (`script.js`) — Beginner-friendly, well-commented code for analysis logic and GitHub API integration
- **Fonts** — Inter font family from Google Fonts for a modern appearance

## File Structure

```
Git-Commit-Message-Analyzer/
├── index.html      # Main HTML structure with hero, form, and results sections
├── styles.css      # Complete styling, responsive layout, and UI components
├── script.js       # Analysis engine, GitHub API integration, and result rendering
└── README.md       # This file
```

## Usage Examples

### Example 1: Analyze Pasted Commits
1. Open the application in your browser
2. In the "Commit messages" textarea, paste:
   ```
   feat: add OAuth authentication
   fix: resolve login redirect issue
   docs: update API documentation
   ```
3. Click "Run analysis"
4. Review the rating, statistics, and warnings

### Example 2: Analyze Repository Commits
1. Enter a GitHub repository URL: `https://github.com/facebook/react`
2. (Optional) Add a personal access token for private repos
3. Click "Run analysis"
4. View the 10 most recent commits in the timeline with authors and dates

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs or suggest enhancements via issues
- Submit pull requests with improvements to functionality, accessibility, or documentation
- Help improve the analysis algorithm or add new metrics

## License

This project is open source and available for personal and commercial use.

## Credits

Created by **Priyanshu Gupta** and **Abhayraj Jaiswal** as part of an OJT project.
