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
      return;
    }

    if (repoValue.length > 0) {
      showLoading(output, "Fetching commits from GitHub...");
      fetchCommitsFromGitHub(repoValue, tokenValue)
        .then(function(fetchedCommits) {
          if (fetchedCommits.length === 0) {
            showError(output, "Could not find any commits. Try pasting messages manually.");
            return;
          }
          var metrics = analyzeCommits(fetchedCommits);
          renderResults(output, metrics);
        })
        .catch(function(error) {
          var errorMessage = typeof error === "string" ? error : error.message;
          showError(output, "Error: " + (errorMessage || "Could not fetch commits from GitHub."));
        });
      return;
    }

    showError(output, "Please paste commit messages OR provide a GitHub repository URL.");
  });

  form.addEventListener("reset", function() {
    showWaiting(output, "Add commit messages above or paste a repo URL, then run the analysis.");
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
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (entry && entry.commit && entry.commit.message) {
          var firstLine = entry.commit.message.split("\n")[0];
          if (firstLine) {
            messages.push(firstLine.trim());
          }
        }
      }
      return messages;
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

  return {
    total: commits.length,
    averageLength: averageLength,
    conventionalPercent: conventionalPercent,
    imperativePercent: imperativePercent,
    warnings: warnings
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

function renderResults(container, metrics) {
  var warningBadge = metrics.warnings.length > 0 ? "warn" : "positive";
  var statusBadge = metrics.conventionalPercent >= 70 ? "Healthy" : "Mixed";

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

  var html = 
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
