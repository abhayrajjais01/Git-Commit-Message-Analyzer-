# Git Commit Message Analyzer

A fully functional web application that analyzes Git commit messages for quality, convention compliance, and best practices. Built with plain HTML, CSS, and vanilla JavaScript - no build tools or frameworks required.

## 🚀 Features

### Core Analysis Capabilities
- **Live commit analysis** that evaluates:
  - Average commit message length (ideal: 30-72 characters)
  - Conventional Commits format compliance (feat:, fix:, chore:, docs:, style:, refactor:, perf:, test:, build:, ci:, revert:, hotfix:)
  - Imperative tone usage percentage (action verbs: add, fix, update, remove, improve, refactor, optimize, document, test, clean, guard, handle, support, merge, release, bump)
  - Detection of vague messages and messages exceeding 72 characters

### Comprehensive Rating System
The analyzer uses a sophisticated scoring algorithm (0-100 points) that evaluates multiple factors:
- **Good** (75-100): Excellent commit quality following best practices
- **Average** (50-74): Decent quality with room for improvement
- **Bad** (30-49): Quality needs attention
- **Need Improvement** (0-29): Significant improvement required

### GitHub Integration
- **Repository Analysis**: Enter any GitHub repository URL to automatically fetch and analyze the 10 most recent commits
- **Commit Timeline**: View fetched commits with author information, commit date, SHA, and direct links to GitHub
- **Language Statistics**: Visualize repository language usage with a horizontal bar chart showing the percentage of code written in each language
- **Private Repository Support**: Optional GitHub personal access token for analyzing private repositories

### User Interface
- **Hero section** with CTA buttons and a sample insights card showing key metrics
- **Analyzer form** accepting repository URLs, optional GitHub personal access tokens, and manual commit message input
- **Results grid** showing overall rating, message statistics, quick insights, and warnings
- **Guidelines section** explaining best practices: structure, scope, detail, and automation


### Technical Highlights
- **No build tools required** — pure HTML5, CSS3, and vanilla JavaScript
- **Privacy-focused** — all analysis happens in-browser, nothing is stored on servers
- **Fully responsive** — works seamlessly on desktop, tablet, and mobile devices

## 📦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for GitHub API integration and Google Fonts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Git-Commit-Message-Analyzer.git
   cd Git-Commit-Message-Analyzer
   ```

2. **Or download as ZIP**
   - Click the "Download ZIP" button on GitHub
   - Extract the ZIP file to your desired location

3. **Open the application**
   - Simply open `index.html` in your web browser
   - No build tools, package managers, or server setup required!

### Quick Start

The analyzer supports two input methods:

1. **Manual Input**: Paste commit messages directly into the textarea (one per line)
2. **GitHub Repository**: Enter a GitHub repository URL to automatically fetch and analyze commits

Click "Run analysis" to see instant results!

## 🔍 How It Works

The analyzer examines each commit message and generates a comprehensive quality report using multiple metrics and heuristics.

### Analysis Metrics

#### 1. Conventional Commits Format
Checks if messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- Valid prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `revert:`, `hotfix:`
- Supports optional scope: `feat(scope): description`
- Calculates percentage of commits following the format

#### 2. Imperative Tone Detection
Analyzes whether commit messages use imperative mood (command form):
- Recognizes action verbs: add, fix, update, remove, improve, refactor, optimize, document, test, clean, guard, handle, support, merge, release, bump
- Strips conventional commit prefixes before analysis
- Calculates percentage of commits using imperative tone

#### 3. Message Length Analysis
Evaluates commit message length against best practices:
- **Ideal range**: 30-72 characters (Git standard)
- **Warnings**: Messages exceeding 72 characters or under 10 characters
- Calculates average length across all commits

#### 4. Vagueness Detection
Identifies vague or unhelpful commit messages:
- Flags messages starting with generic terms: "update", "changes", "stuff"
- Detects very short messages (< 10 characters) that lack context
- Lists specific commits that need improvement

### Scoring Algorithm

The rating system (0-100 points) combines multiple weighted factors:

| Factor | Points | Criteria |
|--------|--------|----------|
| **Conventional Commits** | 0-30 | 80%+ = 30pts, 50-79% = 20pts, 1-49% = 10pts, 0% = 0pts |
| **Imperative Tone** | 0-25 | 80%+ = 25pts, 50-79% = 15pts, 1-49% = 5pts, 0% = 0pts |
| **Message Length** | 0-20 | 30-72 chars = 20pts, 20-99 chars = 10pts, 10-19 chars = 5pts |
| **Warnings Bonus** | 0-25 | No warnings = 25pts, 1 warning = 15pts, 2 warnings = 5pts, 3+ = 0pts |
| **Penalties** | -10 to -15 | No conventional format (-10pts), >50% vague (-15pts), >50% too long (-10pts) |

### GitHub API Integration

When a GitHub repository URL is provided:
1. **Repository Parsing**: Extracts owner and repository name from various URL formats
2. **Commits Fetching**: Uses GitHub REST API to retrieve the 10 most recent commits
3. **Language Statistics**: Fetches repository language data and visualizes usage percentages
4. **Metadata Extraction**: Collects author, date, SHA, and commit URLs for the timeline display
5. **Error Handling**: Gracefully handles API rate limits, private repos, and network errors

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

## 📊 Repository Language Statistics

When analyzing a GitHub repository, the application automatically fetches and displays language usage statistics:

- **Automatic Detection**: Uses GitHub's language detection API
- **Visual Chart**: Horizontal bar chart showing percentage of code for each language
- **Sorted Display**: Languages sorted by code volume (bytes)
- **Percentage Calculation**: Shows exact percentage contribution of each language
- **No Manual Input Required**: Automatically fetched when a repository URL is provided

This feature helps you understand the technology stack of any repository at a glance.

## 🛠️ Tech Stack

This project is built with pure web technologies - no frameworks, build tools, or dependencies required:

- **HTML5** (`index.html`) 
  - Semantic structure and accessible form elements
  - Modern HTML5 features and best practices
  
- **CSS3** (`styles.css`)
  - Responsive design with CSS Grid and Flexbox
  - CSS custom properties (variables) for theming
  - Modern styling with gradient backgrounds and smooth transitions
  - Mobile-first responsive breakpoints
  
- **Vanilla JavaScript** (`script.js`)
  - ES5-compatible code (no transpilation needed)
  - Well-commented, beginner-friendly codebase
  - GitHub REST API integration
  - Client-side analysis engine
  - DOM manipulation and event handling
  
- **External Resources**
  - **Google Fonts**: Inter font family for modern typography
  - **GitHub REST API**: For fetching repository data and commits

## 📁 File Structure

```
Git-Commit-Message-Analyzer/
├── index.html      # Main HTML structure with hero, form, results, and guidelines sections
├── styles.css      # Complete styling, responsive layout, and UI components
├── script.js       # Analysis engine, GitHub API integration, and result rendering
└── README.md       # Project documentation (this file)
```

### File Descriptions

- **`index.html`**: Contains the complete HTML structure including:
  - Hero section with sample output card
  - Analyzer form for input
  - Results display area
  - Commit timeline section
  - Repository languages visualization section
  - Guidelines section
  - Footer

- **`styles.css`**: Comprehensive styling including:
  - CSS custom properties for theming
  - Responsive grid layouts
  - Modern UI components (cards, badges, buttons)
  - Smooth transitions and hover effects
  - Mobile-responsive breakpoints

- **`script.js`**: Core functionality including:
  - Commit message analysis algorithms
  - GitHub API integration
  - Result rendering and UI updates
  - Form handling and validation
  - Language statistics visualization

## 💡 Usage Examples

### Example 1: Analyze Pasted Commits

**Scenario**: You have a list of commit messages and want to check their quality.

1. Open `index.html` in your browser
2. Scroll to the "Analyzer Section"
3. In the "Commit messages" textarea, paste your commits (one per line):
   ```
   feat: add OAuth authentication flow
   fix: resolve login redirect issue
   docs: update API documentation
   chore: update dependencies
   refactor: improve error handling
   ```
4. Click "Run analysis"
5. Review the results:
   - Overall rating and score
   - Message statistics (average length, conventional format %, imperative tone %)
   - Quick insights and warnings
   - Specific commits that need improvement

### Example 2: Analyze GitHub Repository

**Scenario**: You want to analyze commits from a public GitHub repository.

1. Enter a GitHub repository URL in the "Repository URL" field:
   - Full URL: `https://github.com/facebook/react`
   - Shorthand: `github.com/facebook/react`
   - Or just: `facebook/react`
2. (Optional) For private repositories, add your GitHub personal access token
3. Click "Run analysis"
4. View comprehensive results:
   - **Analysis Results**: Overall rating and commit quality metrics
   - **Commit Timeline**: The 10 most recent commits with author, date, SHA, and GitHub links
   - **Language Statistics**: Visual breakdown of programming languages used in the repository

### Example 3: Using GitHub Personal Access Token

**Scenario**: Analyzing a private repository or avoiding rate limits.

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` scope for private repos
   - Or use `public_repo` scope for public repositories only
2. Enter the repository URL
3. Paste your token in the "Personal access token" field
4. Click "Run analysis"
5. The analyzer will use your token for authentication and higher rate limits

## 🤝 Contributing

Contributions are welcome! This project is part of an OJT (On-the-Job Training) project, and we appreciate any help to make it better.

### How to Contribute

1. **Report Issues**: Found a bug or have a feature request? Open an issue describing the problem or enhancement
2. **Submit Pull Requests**: 
   - Fork the repository
   - Create a feature branch (`git checkout -b feature/amazing-feature`)
   - Make your changes
   - Commit with clear messages following conventional commits
   - Push to your branch (`git push origin feature/amazing-feature`)
   - Open a Pull Request

### Areas for Contribution

- **Analysis Algorithm**: Improve scoring metrics or add new quality checks
- **UI/UX**: Enhance the user interface or improve accessibility
- **Documentation**: Improve README, add code comments, or create guides
- **Features**: Add new analysis capabilities or visualization options
- **Performance**: Optimize code or improve API usage

### Code Style

- Follow existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

## ❓ Troubleshooting

### Common Issues

**Q: The analyzer shows "Could not fetch commits from GitHub"**
- **A**: Check that the repository URL is correct and the repository is public (or use a personal access token for private repos)
- **A**: Verify your internet connection
- **A**: GitHub API may have rate limits - wait a few minutes and try again, or use a personal access token

**Q: Language statistics are not showing**
- **A**: Some repositories may not have language data available
- **A**: Very new or empty repositories might not have language statistics yet
- **A**: Check that the repository URL is correct

**Q: The analysis seems incorrect**
- **A**: Make sure commit messages are pasted one per line
- **A**: Check that you're analyzing the subject line (first line) of commits, not the full commit message body

**Q: Personal access token not working**
- **A**: Ensure the token has the correct scopes (`repo` for private repos, `public_repo` for public repos)
- **A**: Check that the token hasn't expired
- **A**: Verify the token is copied correctly (no extra spaces)

### GitHub API Rate Limits

- **Unauthenticated requests**: 60 requests per hour per IP
- **Authenticated requests**: 5,000 requests per hour
- **Solution**: Use a GitHub personal access token to increase rate limits

## 📄 License

This project is open source and available for personal and commercial use.

## 👥 Credits

Created by **Priyanshu Gupta** and **Abhayraj Jaiswal** as part of an OJT (On-the-Job Training) project.

---

**Made with ❤️ using vanilla JavaScript, HTML, and CSS**
