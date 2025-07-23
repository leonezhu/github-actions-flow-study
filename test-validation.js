#!/usr/bin/env node

/**
 * 本地测试脚本
 * 用于在本地环境测试JIRA号和作者验证功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 模拟环境变量
process.env.BASE_SHA = 'HEAD~3';  // 测试最近3个commits
process.env.HEAD_SHA = 'HEAD';
process.env.PR_AUTHOR = 'test-user';
process.env.BASE_BRANCH = 'release/20250808';

// 导入验证脚本
const validateScript = path.join(__dirname, '.github/scripts/validate-pr.js');

function runTest() {
  console.log('🧪 开始本地测试...');
  console.log('=' .repeat(50));
  
  // 检查必要文件是否存在
  const requiredFiles = [
    '.github/scripts/validate-pr.js',
    '.github/config/release-validation.yml'
  ];
  
  console.log('📋 检查必要文件...');
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - 文件不存在`);
      return;
    }
  }
  console.log('');
  
  // 检查是否在git仓库中
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    console.log('✅ Git仓库检查通过');
  } catch (error) {
    console.log('❌ 当前目录不是Git仓库');
    console.log('请在Git仓库中运行此测试脚本');
    return;
  }
  
  // 检查是否有足够的commits
  try {
    const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    if (parseInt(commitCount) < 3) {
      console.log(`⚠️  仓库只有 ${commitCount} 个commits，建议至少有3个commits进行测试`);
    } else {
      console.log(`✅ 仓库有 ${commitCount} 个commits`);
    }
  } catch (error) {
    console.log('⚠️  无法获取commit数量');
  }
  
  console.log('');
  console.log('🔍 开始运行验证脚本...');
  console.log('=' .repeat(50));
  
  // 运行验证脚本
  try {
    require(validateScript);
  } catch (error) {
    console.error('❌ 验证脚本运行失败:', error.message);
  }
}

function showHelp() {
  console.log(`
📖 本地测试脚本使用说明
`);
  console.log('此脚本用于在本地测试GitHub Actions验证功能');
  console.log('');
  console.log('使用方法:');
  console.log('  node test-validation.js');
  console.log('');
  console.log('测试前准备:');
  console.log('1. 确保在Git仓库中运行');
  console.log('2. 确保有一些测试commits');
  console.log('3. 确保配置文件存在: .github/config/release-validation.yml');
  console.log('');
  console.log('测试内容:');
  console.log('- 检查最近3个commits的JIRA号');
  console.log('- 验证commit作者权限');
  console.log('- 验证PR作者权限（模拟用户: test-user）');
  console.log('');
  console.log('如需修改测试参数，请编辑此文件中的环境变量设置');
}

// 检查命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  runTest();
}