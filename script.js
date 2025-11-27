var conventionalPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert|hotfix)(\(.+\))?:\s+/i;

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

window.onload = function() {
  var form = document.getElementById("analyzer-form");
  var textarea = document.getElementById("commit-input");
  var output = document.getElementById("analysis-output");
  var repoInput = document.getElementById("repo-input");
  var tokenInput = document.getElementById("token-input");
  var timeline = document.getElementById("commit-timeline");

  if (!form || !textarea || !output) {
    console.log("Error: Could not find required elements on page");
    return;
  }

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

    if (commits.length > 0) {
      var metrics = analyzeCommits(commits);
      renderResults(output, metrics);
      if (timeline) {
        showTimelinePlaceholder(
          timeline,
          "Timeline updates when you fetch commits from GitHub."
        );
      }
      return;
    }

    if (repoValue.length > 0) {
      showLoading(output, "Fetching commits from GitHub...");
      if (timeline) {
        showTimelineLoading(timeline);
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
            return;
          }
          var metrics = analyzeCommits(result.messages);
          renderResults(output, metrics);
          if (timeline) {
            renderCommitTimeline(timeline, result.details);
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
  });
};

function fetchCommitsFromGitHub(repoUrl, token) {
  var parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return Promise.reject("Invalid repository URL. Example: https://github.com/facebook/react");
  }

  var apiUrl = "https://api.github.com/repos/" + parsed.owner + "/" + parsed.name + "/commits?per_page=10";

  var options = {
    headers: {
      "Accept": "application/vnd.github+json"
    }
  };

  if (token && token.length > 0) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  return fetch(apiUrl, options)
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
}

function parseRepoUrl(rawUrl) {
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

function formatCommitDate(dateString) {
  if (!dateString) {
    return "Unknown date";
  }
  var parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    return dateString;
  }
  return parsedDate.toLocaleString();
}
