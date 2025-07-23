const fs = require('fs');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Load configuration file
function loadConfig() {
  try {
    const configFile = fs.readFileSync('.github/config/release-validation.yml', 'utf8');
    return yaml.load(configFile);
  } catch (error) {
    console.error('❌ Unable to read configuration file .github/config/release-validation.yml');
    console.error('Please ensure the configuration file exists and is properly formatted');
    process.exit(1);
  }
}

// Extract JIRA numbers from commit message
function extractJiraNumbers(commitMessage) {
  const jiraPattern = /([A-Z]+-\d+)/g;
  const matches = commitMessage.match(jiraPattern);
  return matches || [];
}

// Check if it's a merge commit
function isMergeCommit(commitMessage) {
  // Check common merge commit patterns
  const mergePatterns = [
    /^Merge branch/i,
    /^Merge pull request/i,
    /^Merge remote-tracking branch/i,
    /^Merge tag/i,
    /^Merge commit/i
  ];
  
  return mergePatterns.some(pattern => pattern.test(commitMessage.trim()));
}

// Get all commits in the PR
function getPRCommits() {
  try {
    const baseRef = process.env.BASE_SHA;
    const headRef = process.env.HEAD_SHA;
    
    const commitRange = `${baseRef}..${headRef}`;
    const commits = execSync(`git log --format="%H|%an|%s" ${commitRange}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        const [hash, author, message] = line.split('|');
        return { hash, author, message };
      });
    
    return commits;
  } catch (error) {
    console.error('❌ Failed to get commit information:', error.message);
    process.exit(1);
  }
}

// Validate JIRA numbers
function validateJiraNumbers(commits, allowedJiras) {
  if (allowedJiras.includes('*')) {
    console.log('✅ JIRA validation: All JIRA numbers allowed');
    return true;
  }

  const errors = [];
  const foundJiras = new Set();

  commits.forEach(commit => {
    // Skip JIRA validation for merge commits
    if (isMergeCommit(commit.message)) {
      console.log(`⏭️  Skip merge commit: ${commit.hash.substring(0, 8)} "${commit.message}"`);
      return;
    }

    const jiraNumbers = extractJiraNumbers(commit.message);
    
    if (jiraNumbers.length === 0) {
      errors.push(`Commit ${commit.hash.substring(0, 8)} missing JIRA number: "${commit.message}"`);
      return;
    }

    jiraNumbers.forEach(jira => {
      foundJiras.add(jira);
      if (!allowedJiras.includes(jira)) {
        errors.push(`Commit ${commit.hash.substring(0, 8)} contains unauthorized JIRA number ${jira}: "${commit.message}"`);
      }
    });
  });

  if (errors.length > 0) {
    console.log('❌ JIRA validation failed:');
    errors.forEach(error => console.log(`  - ${error}`));
    return false;
  }

  console.log('✅ JIRA validation passed');
  console.log(`  Found JIRA numbers: ${Array.from(foundJiras).join(', ')}`);
  return true;
}

// Validate author permissions
function validateAuthors(commits, allowedAuthors, prAuthor) {
  if (allowedAuthors.includes('*')) {
    console.log('✅ Author validation: All authors allowed');
    return true;
  }

  const errors = [];
  const commitAuthors = new Set();

  // Check PR author
  if (!allowedAuthors.includes(prAuthor)) {
    errors.push(`PR author ${prAuthor} does not have permission to merge to this branch`);
  }

  // Check commit authors
  commits.forEach(commit => {
    commitAuthors.add(commit.author);
    if (!allowedAuthors.includes(commit.author)) {
      errors.push(`Author ${commit.author} of commit ${commit.hash.substring(0, 8)} does not have permission to merge to this branch`);
    }
  });

  if (errors.length > 0) {
    console.log('❌ Author validation failed:');
    errors.forEach(error => console.log(`  - ${error}`));
    return false;
  }

  console.log('✅ Author validation passed');
  console.log(`  PR author: ${prAuthor}`);
  console.log(`  Commit authors: ${Array.from(commitAuthors).join(', ')}`);
  return true;
}

// Main function
function main() {
  console.log('🔍 Starting validation of PR permissions to release branch...');
  console.log(`📋 Target branch: ${process.env.BASE_BRANCH}`);
  console.log(`👤 PR author: ${process.env.PR_AUTHOR}`);
  console.log('');

  // Load configuration
  const config = loadConfig();
  console.log('📖 Configuration loaded successfully');
  console.log(`  Allowed JIRA numbers: ${config.allowed_jiras.join(', ')}`);
  console.log(`  Allowed authors: ${config.allowed_authors.join(', ')}`);
  console.log('');

  // Get commits
  const commits = getPRCommits();
  console.log(`📝 Found ${commits.length} commits`);
  console.log('');

  // Validate JIRA numbers
  const jiraValid = validateJiraNumbers(commits, config.allowed_jiras);
  console.log('');

  // Validate authors
  const authorValid = validateAuthors(commits, config.allowed_authors, process.env.PR_AUTHOR);
  console.log('');

  // Final result
  if (jiraValid && authorValid) {
    console.log('🎉 All validations passed, PR can be merged!');
    process.exit(0);
  } else {
    console.log('❌ Validation failed, PR cannot be merged!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}