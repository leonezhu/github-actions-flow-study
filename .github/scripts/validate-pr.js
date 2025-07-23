const fs = require('fs');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// 读取配置文件
function loadConfig() {
  try {
    const configFile = fs.readFileSync('.github/config/release-validation.yml', 'utf8');
    return yaml.load(configFile);
  } catch (error) {
    console.error('❌ 无法读取配置文件 .github/config/release-validation.yml');
    console.error('请确保配置文件存在并格式正确');
    process.exit(1);
  }
}

// 从commit消息中提取JIRA号
function extractJiraNumbers(commitMessage) {
  const jiraPattern = /([A-Z]+-\d+)/g;
  const matches = commitMessage.match(jiraPattern);
  return matches || [];
}

// 获取PR中的所有commits
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
    console.error('❌ 获取commit信息失败:', error.message);
    process.exit(1);
  }
}

// 验证JIRA号
function validateJiraNumbers(commits, allowedJiras) {
  if (allowedJiras.includes('*')) {
    console.log('✅ JIRA号验证: 允许所有JIRA号');
    return true;
  }

  const errors = [];
  const foundJiras = new Set();

  commits.forEach(commit => {
    const jiraNumbers = extractJiraNumbers(commit.message);
    
    if (jiraNumbers.length === 0) {
      errors.push(`Commit ${commit.hash.substring(0, 8)} 缺少JIRA号: "${commit.message}"`);
      return;
    }

    jiraNumbers.forEach(jira => {
      foundJiras.add(jira);
      if (!allowedJiras.includes(jira)) {
        errors.push(`Commit ${commit.hash.substring(0, 8)} 包含未授权的JIRA号 ${jira}: "${commit.message}"`);
      }
    });
  });

  if (errors.length > 0) {
    console.log('❌ JIRA号验证失败:');
    errors.forEach(error => console.log(`  - ${error}`));
    return false;
  }

  console.log('✅ JIRA号验证通过');
  console.log(`  发现的JIRA号: ${Array.from(foundJiras).join(', ')}`);
  return true;
}

// 验证作者权限
function validateAuthors(commits, allowedAuthors, prAuthor) {
  if (allowedAuthors.includes('*')) {
    console.log('✅ 作者验证: 允许所有作者');
    return true;
  }

  const errors = [];
  const commitAuthors = new Set();

  // 检查PR作者
  if (!allowedAuthors.includes(prAuthor)) {
    errors.push(`PR作者 ${prAuthor} 没有合并到此分支的权限`);
  }

  // 检查commit作者
  commits.forEach(commit => {
    commitAuthors.add(commit.author);
    if (!allowedAuthors.includes(commit.author)) {
      errors.push(`Commit ${commit.hash.substring(0, 8)} 的作者 ${commit.author} 没有合并到此分支的权限`);
    }
  });

  if (errors.length > 0) {
    console.log('❌ 作者验证失败:');
    errors.forEach(error => console.log(`  - ${error}`));
    return false;
  }

  console.log('✅ 作者验证通过');
  console.log(`  PR作者: ${prAuthor}`);
  console.log(`  Commit作者: ${Array.from(commitAuthors).join(', ')}`);
  return true;
}

// 主函数
function main() {
  console.log('🔍 开始验证PR到release分支的权限...');
  console.log(`📋 目标分支: ${process.env.BASE_BRANCH}`);
  console.log(`👤 PR作者: ${process.env.PR_AUTHOR}`);
  console.log('');

  // 加载配置
  const config = loadConfig();
  console.log('📖 配置加载成功');
  console.log(`  允许的JIRA号: ${config.allowed_jiras.join(', ')}`);
  console.log(`  允许的作者: ${config.allowed_authors.join(', ')}`);
  console.log('');

  // 获取commits
  const commits = getPRCommits();
  console.log(`📝 找到 ${commits.length} 个commits`);
  console.log('');

  // 验证JIRA号
  const jiraValid = validateJiraNumbers(commits, config.allowed_jiras);
  console.log('');

  // 验证作者
  const authorValid = validateAuthors(commits, config.allowed_authors, process.env.PR_AUTHOR);
  console.log('');

  // 最终结果
  if (jiraValid && authorValid) {
    console.log('🎉 所有验证通过，PR可以合并！');
    process.exit(0);
  } else {
    console.log('❌ 验证失败，PR不能合并！');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}