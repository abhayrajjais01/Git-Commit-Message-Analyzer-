// script.js
// Git Commit Message Analyzer - runs in-browser. Handles UI interactions,
// optional GitHub API fetch for the latest commits, and computes quality
// metrics for commit subject lines (conventional commits, imperative tone,
// length, and vagueness heuristics).

// Regular expression used to detect Conventional Commits-style prefixes
// Matches: "feat:", "fix(scope):", "docs:", etc.
var conventionalPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert|hotfix)(\(.+\))?:\s+/i;

// Imperative verbs recognized by the analyzer (used to check imperative mood)
var imperativeVerbs = [
  "add",
  "fix",
  "update",
  "remove",
  "improve",
  "refactor",
  "optimize",
  "document",
  "test",
  "clean",
  "guard",
  "handle",
  "support",
  "merge",
  "release",
  "bump"
];
// Entry point: wire up event handlers after DOM is ready.
// - Submits the analyzer form, reads inputs, and triggers analysis or
//   a GitHub fetch depending on provided values.
window.onload = function() {
  var form = document.getElementById("analyzer-form");
  var textarea = document.getElementById("commit-input");
  var output = document.getElementById("analysis-output");
  var repoInput = document.getElementById("repo-input");
  var tokenInput = document.getElementById("token-input");
  var timeline = document.getElementById("commit-timeline");
  var languagesContainer = document.getElementById("languages-usage");

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    var repoValue = repoInput ? repoInput.value.trim() : "";
    var tokenValue = tokenInput ? tokenInput.value.trim() : "";
    var textareaValue = textarea.value;

    var lines = textareaValue.split(/\r?\n/);
    var commits = [];

    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (trimmed.length > 0) {
        commits.push(trimmed);
      }
    }

    if (repoValue.length > 0) {
      showLoading(output, "Fetching commits from GitHub...");
      if (timeline) {
        showTimelineLoading(timeline);
      }
      if (languagesContainer) {
        showLanguagesLoading(languagesContainer);
      }
      fetchCommitsFromGitHub(repoValue, tokenValue)
        .then(function(result) {
          if (!result.messages.length) {
            showError(output, "Could not find any commits. Try pasting messages manually.");
            if (timeline) {
              showTimelinePlaceholder(
                timeline,
                "We could not load commits for this repository."
              );
            }
            if (languagesContainer) {
              showLanguagesPlaceholder(
                languagesContainer,
                "We could not load languages for this repository."
              );
            }
            return;
          }
          var metrics = analyzeCommits(result.messages);
          renderResults(output, metrics);
          if (timeline) {
            renderCommitTimeline(timeline, result.details);
          }
          if (languagesContainer) {
            renderLanguagesChart(languagesContainer, result.languages || {});
          }
        })
        .catch(function(error) {
          var errorMessage = typeof error === "string" ? error : error.message;
          showError(output, "Error: " + (errorMessage || "Could not fetch commits from GitHub."));
          if (timeline) {
            showTimelinePlaceholder(
              timeline,
              "Could not fetch commits for this repository."
            );
          }
          if (languagesContainer) {
            showLanguagesPlaceholder(
              languagesContainer,
              "Could not fetch languages for this repository."
            );
          }
        });
      return;
    }

    showError(output, "Please paste commit messages OR provide a GitHub repository URL.");
    if (timeline) {
      showTimelinePlaceholder(
        timeline,
        "Provide commit messages or a repo URL to see commits."
      );
    }
  });

  form.addEventListener("reset", function() {
    showWaiting(output, "Add commit messages above or paste a repo URL, then run the analysis.");
    if (timeline) {
      showTimelinePlaceholder(
        timeline,
        "Enter a GitHub repository URL and run the analysis to see recent commits."
      );
    }
    if (languagesContainer) {
      showLanguagesPlaceholder(
        languagesContainer,
        "Enter a GitHub repository URL and run the analysis to see language usage."
      );
    }
  });
};

/**
 * Fetch the most recent commits from a GitHub repository using the REST API.
 * Returns the subject lines and lightweight metadata for display in the timeline.
 * @param {string} repoUrl - repository URL or path (e.g. https://github.com/user/repo)
 * @param {string} token - optional GitHub personal access token for private repos/
 *                         higher rate limits
 * @returns {Promise<{messages: string[], details: Object[], languages: Object}>}
 */
function fetchCommitsFromGitHub(repoUrl, token) {
  var parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return Promise.reject("Invalid GitHub repository URL.");
  }

  var apiUrl = "https://api.github.com/repos/" + parsed.owner + "/" + parsed.name + "/commits?per_page=10";
  var languagesUrl = "https://api.github.com/repos/" + parsed.owner + "/" + parsed.name + "/languages";

  var options = {
    headers: {
      "Accept": "application/vnd.github+json"
    }
  };

  if (token && token.length > 0) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  var commitsPromise = fetch(apiUrl, options)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("GitHub API returned error: " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      var messages = [];
      var details = [];
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (!entry || !entry.commit) {
          continue;
        }
        var firstLine = entry.commit.message
          ? entry.commit.message.split("\n")[0]
          : "";
        var trimmed = firstLine ? firstLine.trim() : "(no subject)";
        if (trimmed) {
          messages.push(trimmed);
        }
        var authorName =
          (entry.commit.author && entry.commit.author.name) ||
          (entry.commit.committer && entry.commit.committer.name) ||
          "Unknown author";
        var authorDate =
          (entry.commit.author && entry.commit.author.date) ||
          (entry.commit.committer && entry.commit.committer.date) ||
          "";
        details.push({
          message: trimmed,
          author: authorName,
          date: authorDate,
          sha: entry.sha ? entry.sha.substring(0, 7) : "—",
          url: entry.html_url || ""
        });
      }
      return {
        messages: messages,
        details: details
      };
    });

  var languagesPromise = fetch(languagesUrl, options)
    .then(function(response) {
      if (!response.ok) {
        // If languages endpoint fails (e.g., permissions), just return empty data
        return {};
      }
      return response.json();
    })
    .catch(function() {
      return {};
    });

  return Promise.all([commitsPromise, languagesPromise]).then(function(results) {
    var commitsData = results[0];
    var languagesData = results[1] || {};
    return {
      messages: commitsData.messages,
      details: commitsData.details,
      languages: languagesData
    };
  });
}

function parseRepoUrl(rawUrl) {
  // Parse a raw repository URL or shorthand into { owner, name }.
  // Accepts full URLs or shorthand like `github.com/user/repo` or `user/repo`.
  if (!rawUrl) {
    return null;
  }

  var urlToParse = rawUrl.trim();

  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = "https://" + urlToParse;
  }

  try {
    var url = new URL(urlToParse);
    var path = url.pathname.replace(/^\/+/, "");
    var parts = path.split("/");

    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      name: parts[1].replace(/\.git$/, "")
    };
  } catch (error) {
    return null;
  }
}

function analyzeCommits(commits) {
  // Compute metrics over an array of commit subject lines:
  // - average length, percent matching conventional commits
  // - percent using imperative mood, number of warnings, and overall rating
  var totalLength = 0;
  var conventionalCount = 0;
  var imperativeCount = 0;
  var longCount = 0;
  var vagueCount = 0;

  for (var i = 0; i < commits.length; i++) {
    var message = commits[i];

    totalLength += message.length;

    if (conventionalPattern.test(message)) {
      conventionalCount += 1;
    }

    if (isImperative(message)) {
      imperativeCount += 1;
    }

    if (message.length > 72) {
      longCount += 1;
    }

    if (isVague(message)) {
      vagueCount += 1;
    }
  }

  var averageLength = Math.round(totalLength / commits.length);
  var conventionalPercent = Math.round((conventionalCount / commits.length) * 100);
  var imperativePercent = Math.round((imperativeCount / commits.length) * 100);

  var warnings = [];
  if (longCount > 0) {
    var warningText = longCount + (longCount === 1 ? " commit is" : " commits are") + " longer than 72 characters.";
    warnings.push(warningText);
  }
  if (vagueCount > 0) {
    var warningText = vagueCount + (vagueCount === 1 ? " commit looks" : " commits look") + " vague. Add more detail.";
    warnings.push(warningText);
  }
  if (conventionalCount === 0) {
    warnings.push("No commits use the Conventional Commits format (feat:, fix:, etc.).");
  }

  var rating = calculateRating({
    conventionalPercent: conventionalPercent,
    imperativePercent: imperativePercent,
    averageLength: averageLength,
    warningsCount: warnings.length,
    total: commits.length,
    longCount: longCount,
    vagueCount: vagueCount
  });

  return {
    total: commits.length,
    averageLength: averageLength,
    conventionalPercent: conventionalPercent,
    imperativePercent: imperativePercent,
    warnings: warnings,
    rating: rating
  };
}

function isImperative(message) {
  // Strip conventional prefix (if present) and check the first word against
  // the list of imperative verbs. Returns true when subject appears to be
  // in the imperative mood.
  var cleaned = message.replace(conventionalPattern, "").trim();
  var parts = cleaned.split(/\s+/);
  var firstWord = parts[0] ? parts[0].toLowerCase() : "";

  for (var i = 0; i < imperativeVerbs.length; i++) {
    if (imperativeVerbs[i] === firstWord) {
      return true;
    }
  }
  return false;
}

function isVague(message) {
  // Heuristic checks for vague or overly short commit subjects. This is
  // intentionally simple — it catches obvious cases like "update" or "stuff"
  // and very short messages that likely lack useful context.
  var lowercase = message.toLowerCase();

  if (lowercase.startsWith("update") ||
      lowercase.startsWith("changes") ||
      lowercase.startsWith("stuff")) {
    return true;
  }

  if (lowercase.length < 10) {
    return true;
  }

  return false;
}

function calculateRating(metrics) {
  // Combine multiple metrics into a single 0-100 score and produce a
  // human-friendly rating level and badge. Input `metrics` should include:
  // { conventionalPercent, imperativePercent, averageLength, warningsCount, total, longCount, vagueCount }
  var score = 0;
  var maxScore = 100;
  
  // Conventional commits score (0-30 points)
  if (metrics.conventionalPercent >= 80) {
    score += 30;
  } else if (metrics.conventionalPercent >= 50) {
    score += 20;
  } else if (metrics.conventionalPercent > 0) {
    score += 10;
  }
  // 0% conventional commits gets 0 points
  
  // Imperative tone score (0-25 points)
  if (metrics.imperativePercent >= 80) {
    score += 25;
  } else if (metrics.imperativePercent >= 50) {
    score += 15;
  } else if (metrics.imperativePercent > 0) {
    score += 5;
  }
  
  // Length score (0-20 points) - ideal is 30-72 chars
  if (metrics.averageLength >= 30 && metrics.averageLength <= 72) {
    score += 20;
  } else if (metrics.averageLength >= 20 && metrics.averageLength < 100) {
    score += 10;
  } else if (metrics.averageLength >= 10) {
    score += 5;
  }
  
  // Warnings penalty (0-25 points deducted)
  var warningPenalty = 0;
  if (metrics.warningsCount === 0) {
    score += 25; // Bonus for no warnings
  } else if (metrics.warningsCount === 1) {
    score += 15;
  } else if (metrics.warningsCount === 2) {
    score += 5;
  }
  // 3+ warnings get 0 bonus points
  
  // Additional penalties for critical issues
  if (metrics.conventionalPercent === 0) {
    score -= 10; // Heavy penalty for no conventional commits
  }
  if (metrics.vagueCount > metrics.total * 0.5) {
    score -= 15; // Penalty if more than 50% are vague
  }
  if (metrics.longCount > metrics.total * 0.5) {
    score -= 10; // Penalty if more than 50% are too long
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Determine rating based on score
  if (score >= 75) {
    return { level: "Good", score: score, badge: "positive" };
  } else if (score >= 50) {
    return { level: "Average", score: score, badge: "neutral" };
  } else if (score >= 30) {
    return { level: "Bad", score: score, badge: "warn" };
  } else {
    return { level: "Need Improvement", score: score, badge: "warn" };
  }
}

function renderResults(container, metrics) {
  // Render the analysis results into HTML cards. `metrics` comes from analyzeCommits().
  var warningBadge = metrics.warnings.length > 0 ? "warn" : "positive";
  var statusBadge = metrics.conventionalPercent >= 70 ? "Healthy" : "Mixed";
  var rating = metrics.rating || { level: "Average", score: 50, badge: "neutral" };

  var warningsHtml = "";
  if (metrics.warnings.length > 0) {
    warningsHtml = "<ul>";
    for (var i = 0; i < metrics.warnings.length; i++) {
      warningsHtml += "<li>" + metrics.warnings[i] + "</li>";
    }
    warningsHtml += "</ul>";
  } else {
    warningsHtml = "<p>No major issues detected. Great job!</p>";
  }

  var ratingDescription = "";
  if (rating.level === "Good") {
    ratingDescription = "Excellent commit quality! Your commits follow best practices.";
  } else if (rating.level === "Average") {
    ratingDescription = "Decent commit quality. There's room for improvement in some areas.";
  } else if (rating.level === "Bad") {
    ratingDescription = "Commit quality needs attention. Consider following conventional commit formats.";
  } else {
    ratingDescription = "Commit quality requires significant improvement. Review the guidelines below.";
  }

  var html = 
    '<article class="result-card result-card--rating">' +
      '<header>' +
        '<p>Overall Rating</p>' +
        '<span class="badge ' + rating.badge + ' rating-badge">' + rating.level + '</span>' +
      '</header>' +
      '<div class="rating-score">' +
        '<span class="score-value">' + rating.score + '</span>' +
        '<span class="score-label">/ 100</span>' +
      '</div>' +
      '<p class="rating-description">' + ratingDescription + '</p>' +
    '</article>' +
    '<article class="result-card">' +
      '<header>' +
        '<p>Message Stats</p>' +
        '<span class="badge positive">' + metrics.total + ' commits</span>' +
      '</header>' +
      '<ul>' +
        '<li><strong>Average length:</strong> ' + metrics.averageLength + ' chars</li>' +
        '<li><strong>Conventional format:</strong> ' + metrics.conventionalPercent + '%</li>' +
        '<li><strong>Imperative tone:</strong> ' + metrics.imperativePercent + '%</li>' +
      '</ul>' +
    '</article>' +
    '<article class="result-card">' +
      '<header>' +
        '<p>Quick insights</p>' +
        '<span class="badge neutral">' + statusBadge + '</span>' +
      '</header>' +
      '<p>Keep subjects short (under 72 chars) and start with action words like "add", "fix", or "improve".</p>' +
    '</article>' +
    '<article class="result-card">' +
      '<header>' +
        '<p>Warnings</p>' +
        '<span class="badge ' + warningBadge + '">' + (metrics.warnings.length > 0 ? "Action" : "Clear") + '</span>' +
      '</header>' +
      warningsHtml +
    '</article>';

  container.innerHTML = html;
}

function showWaiting(container, message) {
  // Display a neutral 'waiting for input' card in the results area.
  container.innerHTML = 
    '<article class="result-card">' +
      '<header>' +
        '<p>Waiting for input</p>' +
        '<span class="badge neutral">Idle</span>' +
      '</header>' +
      '<p>' + message + '</p>' +
    '</article>';
}

function showLoading(container, message) {
  // Display a loading/working card while analysis or network calls are in progress.
  container.innerHTML = 
    '<article class="result-card">' +
      '<header>' +
        '<p>Loading</p>' +
        '<span class="badge neutral">Working</span>' +
      '</header>' +
      '<p>' + message + '</p>' +
    '</article>';
}

function showError(container, message) {
  // Display an error card when something goes wrong (validation or network).
  container.innerHTML = 
    '<article class="result-card">' +
      '<header>' +
        '<p>Error</p>' +
        '<span class="badge warn">Issue</span>' +
      '</header>' +
      '<p>' + message + '</p>' +
    '</article>';
}

function renderCommitTimeline(container, commits) {
  // Render the timeline (list) of fetched commits including author/date/sha.
  if (!container) {
    return;
  }
  if (!commits.length) {
    showTimelinePlaceholder(container, "No commits to show yet.");
    return;
  }

  var itemsHtml = "";
  for (var i = 0; i < commits.length; i++) {
    var commit = commits[i];
    itemsHtml +=
      "<li>" +
      "<h3>" +
      commit.message +
      "</h3>" +
      "<p><strong>Author:</strong> " +
      commit.author +
      "</p>" +
      "<p><strong>Date:</strong> " +
      formatCommitDate(commit.date) +
      "</p>" +
      "<p><strong>SHA:</strong> " +
      commit.sha +
      "</p>" +
      (commit.url
        ? '<a class="chip good" href="' +
          commit.url +
          '" target="_blank" rel="noopener noreferrer">View on GitHub</a>'
        : "") +
      "</li>";
  }

  container.innerHTML =
    '<article class="result-card">' +
    "<header>" +
    "<p>Latest commits</p>" +
    '<span class="badge positive">' +
    commits.length +
    " fetched</span>" +
    "</header>" +
    '<ol class="timeline">' +
    itemsHtml +
    "</ol>" +
    "</article>";
}

function showTimelinePlaceholder(container, message) {
  // Placeholder content shown when no timeline data is available.
  if (!container) {
    return;
  }
  container.innerHTML =
    '<article class="result-card">' +
    "<header>" +
    "<p>Commit timeline</p>" +
    '<span class="badge neutral">Idle</span>' +
    "</header>" +
    "<p>" +
    (message ||
      "Enter a GitHub repository URL and run the analysis to see recent commits.") +
    "</p>" +
    "</article>";
}

function showTimelineLoading(container) {
  // Visual indicator used while commits are being fetched for the timeline.
  if (!container) {
    return;
  }
  container.innerHTML =
    '<article class="result-card">' +
    "<header>" +
    "<p>Fetching commits</p>" +
    '<span class="badge neutral">Working</span>' +
    "</header>" +
    "<p>Contacting GitHub for the latest commits...</p>" +
    "</article>";
}

function renderLanguagesChart(container, languages) {
  // Render a simple horizontal bar chart for languages using bytes of code.
  if (!container) {
    return;
  }

  var keys = Object.keys(languages || {});
  if (!keys.length) {
    showLanguagesPlaceholder(
      container,
      "No language data was reported for this repository."
    );
    return;
  }

  var totalBytes = 0;
  for (var i = 0; i < keys.length; i++) {
    totalBytes += languages[keys[i]] || 0;
  }
  if (totalBytes === 0) {
    showLanguagesPlaceholder(
      container,
      "No language data was reported for this repository."
    );
    return;
  }

  // Sort languages descending by bytes
  keys.sort(function(a, b) {
    return (languages[b] || 0) - (languages[a] || 0);
  });

  var itemsHtml = "";
  for (var j = 0; j < keys.length; j++) {
    var lang = keys[j];
    var bytes = languages[lang] || 0;
    var percent = (bytes / totalBytes) * 100;
    var percentLabel = percent.toFixed(1).replace(/\.0$/, "");

    itemsHtml +=
      '<div class="language-row">' +
        '<div class="language-row-header">' +
          "<span>" + lang + "</span>" +
          "<span>" + percentLabel + "%</span>" +
        "</div>" +
        '<div class="language-bar-track">' +
          '<div class="language-bar-fill" style="width: ' + percent + '%;"></div>' +
        "</div>" +
      "</div>";
  }

  container.innerHTML =
    '<article class="result-card">' +
      "<header>" +
        "<p>Language usage</p>" +
        '<span class="badge positive">' + keys.length + " languages</span>" +
      "</header>" +
      '<div class="languages-chart">' +
        itemsHtml +
      "</div>" +
    "</article>";
}

function showLanguagesPlaceholder(container, message) {
  if (!container) {
    return;
  }
  container.innerHTML =
    '<article class="result-card">' +
      "<header>" +
        "<p>Repository languages</p>" +
        '<span class="badge neutral">Idle</span>' +
      "</header>" +
      "<p>" +
        (message ||
          "Enter a GitHub repository URL and run the analysis to see language usage.") +
      "</p>" +
    "</article>";
}

function showLanguagesLoading(container) {
  if (!container) {
    return;
  }
  container.innerHTML =
    '<article class="result-card">' +
      "<header>" +
        "<p>Loading languages</p>" +
        '<span class="badge neutral">Working</span>' +
      "</header>" +
      "<p>Contacting GitHub for repository language statistics...</p>" +
    "</article>";
}

function formatCommitDate(dateString) {
  // Format an ISO date string for display; fall back to original string if parse fails.
  if (!dateString) {
    return "Unknown date";
  }
  var parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    return dateString;
  }
  return parsedDate.toLocaleString();
}
