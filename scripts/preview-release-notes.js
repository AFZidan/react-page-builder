#!/usr/bin/env node

/**
 * Preview release notes based on commits since last tag
 * Usage: node scripts/preview-release-notes.js [from-tag]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color + args.join(" ") + colors.reset);
}

function exec(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
}

// Get current version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
);
const currentVersion = packageJson.version;

// Get last tag or use argument
let fromTag = process.argv[2];
if (!fromTag) {
  const tags = exec('git tag -l "v*" --sort=-version:refname');
  fromTag = tags.split("\n")[0] || "HEAD~10"; // Last 10 commits if no tags
}

log(colors.blue, "\n📦 Release Notes Preview");
log(colors.cyan, "========================\n");
log(colors.bright, `Version: ${currentVersion}`);
log(colors.bright, `Changes since: ${fromTag}\n`);

// Get commits since last tag
const commits = exec(
  `git log ${fromTag}..HEAD --pretty=format:"%s|||%h|||%an" --no-merges`
);

if (!commits) {
  log(colors.yellow, "⚠️  No commits found since last tag");
  process.exit(0);
}

// Categorize commits
const categories = {
  features: [],
  fixes: [],
  docs: [],
  style: [],
  refactor: [],
  perf: [],
  test: [],
  chore: [],
  ci: [],
  build: [],
  breaking: [],
  other: [],
};

commits.split("\n").forEach((line) => {
  const [message, hash, author] = line.split("|||");
  const commit = { message, hash, author };

  if (message.includes("BREAKING CHANGE")) {
    categories.breaking.push(commit);
  } else if (message.startsWith("feat")) {
    categories.features.push(commit);
  } else if (message.startsWith("fix")) {
    categories.fixes.push(commit);
  } else if (message.startsWith("docs")) {
    categories.docs.push(commit);
  } else if (message.startsWith("style")) {
    categories.style.push(commit);
  } else if (message.startsWith("refactor")) {
    categories.refactor.push(commit);
  } else if (message.startsWith("perf")) {
    categories.perf.push(commit);
  } else if (message.startsWith("test")) {
    categories.test.push(commit);
  } else if (message.startsWith("chore")) {
    categories.chore.push(commit);
  } else if (message.startsWith("ci")) {
    categories.ci.push(commit);
  } else if (message.startsWith("build")) {
    categories.build.push(commit);
  } else {
    categories.other.push(commit);
  }
});

// Generate release notes
let releaseNotes = `# Release v${currentVersion}\n\n`;

if (categories.breaking.length > 0) {
  log(colors.bright + colors.yellow, "⚠️  BREAKING CHANGES");
  releaseNotes += "## ⚠️ BREAKING CHANGES\n\n";
  categories.breaking.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

if (categories.features.length > 0) {
  log(colors.green, "✨ Features");
  releaseNotes += "## ✨ Features\n\n";
  categories.features.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

if (categories.fixes.length > 0) {
  log(colors.green, "🐛 Bug Fixes");
  releaseNotes += "## 🐛 Bug Fixes\n\n";
  categories.fixes.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

if (categories.docs.length > 0) {
  log(colors.blue, "📚 Documentation");
  releaseNotes += "## 📚 Documentation\n\n";
  categories.docs.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

if (categories.perf.length > 0) {
  log(colors.cyan, "⚡ Performance");
  releaseNotes += "## ⚡ Performance\n\n";
  categories.perf.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

const otherCategories = [
  { key: "refactor", title: "♻️  Refactoring", color: colors.cyan },
  { key: "style", title: "💄 Styling", color: colors.cyan },
  { key: "test", title: "✅ Tests", color: colors.cyan },
  { key: "build", title: "🏗️  Build", color: colors.cyan },
  { key: "ci", title: "👷 CI/CD", color: colors.cyan },
  { key: "chore", title: "🔧 Chores", color: colors.cyan },
];

otherCategories.forEach(({ key, title, color }) => {
  if (categories[key].length > 0) {
    log(color, title);
    releaseNotes += `## ${title}\n\n`;
    categories[key].forEach((c) => {
      console.log(`  - ${c.message} (${c.hash})`);
      releaseNotes += `- ${c.message} (${c.hash})\n`;
    });
    console.log("");
    releaseNotes += "\n";
  }
});

if (categories.other.length > 0) {
  log(colors.yellow, "📦 Other Changes");
  releaseNotes += "## 📦 Other Changes\n\n";
  categories.other.forEach((c) => {
    console.log(`  - ${c.message} (${c.hash})`);
    releaseNotes += `- ${c.message} (${c.hash})\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

// Get contributors
const contributors = exec(
  `git log ${fromTag}..HEAD --pretty=format:"%an" --no-merges | sort -u`
);
if (contributors) {
  const contributorList = contributors.split("\n");
  log(colors.blue, "👥 Contributors");
  releaseNotes += "## 👥 Contributors\n\n";
  contributorList.forEach((contributor) => {
    console.log(`  - ${contributor}`);
    releaseNotes += `- ${contributor}\n`;
  });
  console.log("");
  releaseNotes += "\n";
}

// Save to file
const outputFile = "release-notes-preview.md";
fs.writeFileSync(outputFile, releaseNotes);

log(colors.green, `\n✓ Release notes saved to: ${outputFile}`);
log(colors.cyan, "\nTo use these notes:");
log(colors.cyan, "  1. Review and edit if needed");
log(colors.cyan, "  2. Copy to GitHub release when creating a new version");
log(colors.cyan, "  3. Or they will be auto-generated when you push a tag\n");
