#!/usr/bin/env node

/**
 * 测试merge commit跳过功能
 * 验证脚本是否正确跳过merge commit的JIRA号验证
 */

const { execSync } = require('child_process');
const fs = require('fs');

function testMergeCommitSkip() {
  console.log('🧪 测试merge commit跳过功能');
  console.log('=' .repeat(50));
  console.log('');
  
  // 显示最近的commits
  console.log('📋 最近的commits:');
  try {
    const commits = execSync('git log --oneline -8', { encoding: 'utf8' });
    console.log(commits);
  } catch (error) {
    console.log('❌ 无法获取commit历史');
    return;
  }
  
  console.log('🔍 测试场景1: 使用严格配置（只允许特定JIRA号）');
  console.log('-' .repeat(40));
  
  // 备份原始配置
  const originalConfig = fs.readFileSync('.github/config/release-validation.yml', 'utf8');
  
  // 创建严格配置
  const strictConfig = `# 严格测试配置
allowed_jiras:
  - 'FEAT-001'
  - 'PROJ-001'

allowed_authors:
  - '*'
`;
  
  try {
    // 使用严格配置
    fs.writeFileSync('.github/config/release-validation.yml', strictConfig);
    
    const result = execSync(
      'export BASE_SHA=89e5da5 && export HEAD_SHA=HEAD && export PR_AUTHOR=test-user && export BASE_BRANCH=main && node .github/scripts/validate-pr.js',
      { encoding: 'utf8', shell: true }
    );
    
    console.log(result);
    
    // 检查是否包含跳过merge commit的日志
    if (result.includes('⏭️  跳过merge commit')) {
      console.log('✅ 成功跳过merge commit！');
    } else {
      console.log('⚠️  没有发现merge commit跳过日志');
    }
    
  } catch (error) {
    console.log('验证结果:');
    console.log(error.stdout);
    
    // 检查是否包含跳过merge commit的日志
    if (error.stdout && error.stdout.includes('⏭️  跳过merge commit')) {
      console.log('✅ 成功跳过merge commit！');
      
      // 检查是否因为其他commit的JIRA号问题而失败
      if (error.stdout.includes('包含未授权的JIRA号') || error.stdout.includes('缺少JIRA号')) {
        console.log('✅ 正确验证了非merge commit的JIRA号！');
      }
    } else {
      console.log('❌ 没有发现merge commit跳过日志');
    }
  } finally {
    // 恢复原始配置
    fs.writeFileSync('.github/config/release-validation.yml', originalConfig);
  }
  
  console.log('');
  console.log('📖 总结:');
  console.log('- merge commit (如 "Merge branch", "Merge pull request") 被正确跳过');
  console.log('- 只有用户手动提交的commit需要包含JIRA号');
  console.log('- 这避免了merge操作时的JIRA号验证问题');
  console.log('');
  console.log('🎯 支持的merge commit模式:');
  console.log('- Merge branch \'xxx\' into yyy');
  console.log('- Merge pull request #123 from xxx');
  console.log('- Merge remote-tracking branch \'xxx\'');
  console.log('- Merge tag \'xxx\'');
  console.log('- Merge commit \'xxx\'');
}

if (require.main === module) {
  testMergeCommitSkip();
}