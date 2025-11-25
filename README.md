# Git Commit Message Analyzer

A fully functional web application that analyzes Git commit messages for quality, convention compliance, and best practices. Built with plain HTML, CSS, and vanilla JavaScript - no build tools or frameworks required.

## Features

- **Hero section** with CTA buttons and a sample insights card
- **Analyzer form** for repository URL, optional GitHub token, and pasted commit messages
- **Live analysis** that calculates:
  - Average commit message length
  - Conventional Commits format compliance percentage
  - Imperative tone usage percentage
  - Warnings for long or vague messages
- **GitHub API integration** to fetch recent commits from any public repository
- **Results grid** that visualizes quality metrics, insights, and recommendations
- **Guidelines section** summarizing best practices for your team
- **Responsive design** that works on desktop and mobile devices

## Getting Started

1. Clone this repository or download the ZIP.
2. Open `index.html` in your browser (no build tools required).
3. Use the analyzer in two ways:
   - **Paste commit messages**: Enter one commit message per line in the textarea
   - **GitHub repository**: Enter a GitHub repo URL (e.g., `github.com/facebook/react`) to fetch commits automatically
4. Click "Run analysis" to see results instantly.

## How It Works

The analyzer checks commit messages for:
- **Conventional Commits format**: Messages starting with `feat:`, `fix:`, `docs:`, etc.
- **Imperative tone**: Action words like "add", "fix", "update", "remove"
- **Length**: Flags messages longer than 72 characters
- **Clarity**: Identifies vague messages that need more detail

## Tech Stack

- **HTML5** (`index.html`) - Semantic structure and form elements
- **CSS3** (`styles.css`) - Responsive design with custom properties, CSS Grid, and modern styling
- **Vanilla JavaScript** (`script.js`) - Beginner-friendly code with detailed comments for analysis logic and GitHub API integration

## File Structure

```
Git-Commit-Message-Analyzer/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Analysis logic and GitHub API integration
└── README.md       # This file
```

## Customization Ideas

- Add more analysis metrics (e.g., emoji usage, issue references)
- Implement LocalStorage to save analysis history
- Add export functionality (CSV, JSON)
- Create visual charts for commit trends over time
- Add support for GitLab or Bitbucket repositories

Feel free to fork this project and integrate it into your Git quality tooling. Pull requests that enhance functionality, accessibility, or documentation are welcome.
