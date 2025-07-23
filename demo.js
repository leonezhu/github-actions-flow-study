#!/usr/bin/env node

/**
 * 演示脚本
 * 展示GitHub Actions验证工作流的不同配置场景
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function runDemo() {
  console.log('🎯 GitHub Actions Release分支验证演示');
  console.log('=' .repeat(60));
  console.log('');
  
  // 场景1: 宽松配置（允许所有）
  console.log('📋 场景1: 宽松配置（允许所有JIRA号和作者）');
  console.log('-' .repeat(50));
  
  try {
    const result1 = execSync(
      'export BASE_SHA=HEAD~2 && export HEAD_SHA=HEAD && export PR_AUTHOR=test-user && export BASE_BRANCH=release/20250808 && node .github/scripts/validate-pr.js',
      { encoding: 'utf8', shell: true }
    );
    console.log(result1);
  } catch (error) {
    console.log('❌ 验证失败:', error.stdout);
  }
  
  console.log('');
  console.log('📋 场景2: 严格配置（限制特定JIRA号和作者）');
  console.log('-' .repeat(50));
  
  // 临时替换配置文件
  const originalConfig = fs.readFileSync('.github/config/release-validation.yml', 'utf8');
  const strictConfig = fs.readFileSync('.github/config/release-validation-strict.yml', 'utf8');
  
  try {
    // 使用严格配置
    fs.writeFileSync('.github/config/release-validation.yml', strictConfig);
    
    const result2 = execSync(
      'export BASE_SHA=HEAD~2 && export HEAD_SHA=HEAD && export PR_AUTHOR=test-user && export BASE_BRANCH=release/20250808 && node .github/scripts/validate-pr.js',
      { encoding: 'utf8', shell: true }
    );
    console.log(result2);
  } catch (error) {
    console.log('❌ 验证失败:', error.stdout);
  } finally {
    // 恢复原始配置
    fs.writeFileSync('.github/config/release-validation.yml', originalConfig);
  }
  
  console.log('');
  console.log('📋 场景3: 测试未授权作者');
  console.log('-' .repeat(50));
  
  try {
    // 使用严格配置和未授权作者
    fs.writeFileSync('.github/config/release-validation.yml', strictConfig);
    
    const result3 = execSync(
      'export BASE_SHA=HEAD~2 && export HEAD_SHA=HEAD && export PR_AUTHOR=unauthorized-user && export BASE_BRANCH=release/20250808 && node .github/scripts/validate-pr.js',
      { encoding: 'utf8', shell: true }
    );
    console.log(result3);
  } catch (error) {
    console.log('验证结果（预期失败）:');
    console.log(error.stdout);
  } finally {
    // 恢复原始配置
    fs.writeFileSync('.github/config/release-validation.yml', originalConfig);
  }
  
  console.log('');
  console.log('🎉 演示完成！');
  console.log('');
  console.log('📖 总结:');
  console.log('- 场景1展示了宽松配置下的成功验证');
  console.log('- 场景2展示了严格配置下的成功验证（因为我们的commits符合要求）');
  console.log('- 场景3展示了未授权作者的失败验证');
  console.log('');
  console.log('💡 提示:');
  console.log('- 修改 .github/config/release-validation.yml 来调整验证规则');
  console.log('- 查看 README.md 了解详细的配置和使用说明');
  console.log('- 在GitHub仓库中启用此工作流来自动验证PR');
}

if (require.main === module) {
  runDemo();
}