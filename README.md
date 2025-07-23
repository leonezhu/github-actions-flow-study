# GitHub Actions Release分支验证工作流

这个项目提供了一个GitHub Actions工作流，用于在PR合并到release分支时验证JIRA号和作者权限。

## 功能特性

✅ **JIRA号验证**
- 检查每个commit是否包含有效的JIRA号
- 自动跳过merge commit的JIRA号验证
- 支持配置允许的JIRA号白名单
- 支持通配符`*`允许所有JIRA号

✅ **作者权限验证**
- 验证PR作者是否有合并权限
- 验证所有commit作者是否有合并权限
- 支持配置允许的作者白名单
- 支持通配符`*`允许所有作者

✅ **灵活配置**
- 通过YAML配置文件管理规则
- 支持针对不同release分支的不同配置
- 详细的验证日志和错误提示

## 快速开始

### 1. 复制文件到你的项目

将以下文件复制到你的GitHub仓库：

```
.github/
├── workflows/
│   └── release-branch-validation.yml    # 主工作流文件
├── scripts/
│   └── validate-pr.js                   # 验证脚本
└── config/
    ├── release-validation.yml            # 配置文件
    └── release-validation.example.yml    # 配置示例
```

### 2. 配置验证规则

编辑 `.github/config/release-validation.yml` 文件：

```yaml
# 允许的JIRA号
allowed_jiras:
  - '*'  # 允许所有JIRA号
  # 或指定具体的JIRA号:
  # - 'ABC-123'
  # - 'DEF-456'

# 允许的作者
allowed_authors:
  - '*'  # 允许所有作者
  # 或指定具体的GitHub用户名:
  # - 'developer1'
  # - 'team-lead'
```

### 3. 提交并推送到GitHub

```bash
git add .github/
git commit -m "Add release branch validation workflow"
git push origin main
```

## 使用流程

### 1. 创建Release分支

```bash
# 创建release分支（格式：release/YYYYMMDD）
git checkout -b release/20250808
git push origin release/20250808
```

### 2. 开发和提交代码

确保每个commit消息包含JIRA号：

```bash
# ✅ 正确的commit消息格式
git commit -m "ABC-123 修复登录页面bug"
git commit -m "DEF-456 添加新的用户管理功能"
git commit -m "XYZ-789: 优化数据库查询性能"

# ❌ 错误的commit消息（缺少JIRA号）
git commit -m "修复bug"
git commit -m "添加新功能"
```

### 3. 创建Pull Request

1. 将feature分支的代码推送到GitHub
2. 创建PR，目标分支选择release分支（如`release/20250808`）
3. GitHub Actions会自动运行验证

### 4. 查看验证结果

在PR页面的"Checks"标签中查看验证结果：

- ✅ **验证通过**: 所有检查都通过，可以合并
- ❌ **验证失败**: 查看详细日志了解失败原因

## 配置说明

### JIRA号格式要求

- 格式：`项目前缀-数字`（如：`ABC-123`、`DEF-456`）
- 大小写敏感（必须大写）
- 可以在commit消息的任意位置
- **Merge commit自动跳过验证**：以下模式的commit会被自动跳过JIRA号验证
  - `Merge branch 'xxx' into yyy`
  - `Merge pull request #123 from xxx`
  - `Merge remote-tracking branch 'xxx'`
  - `Merge tag 'xxx'`
  - `Merge commit 'xxx'`

### 配置选项

#### allowed_jiras

```yaml
# 选项1: 允许所有JIRA号
allowed_jiras:
  - '*'

# 选项2: 指定具体的JIRA号
allowed_jiras:
  - 'ABC-123'
  - 'ABC-124'
  - 'DEF-456'

# 选项3: 多个项目的JIRA号
allowed_jiras:
  - 'PROJ1-001'
  - 'PROJ1-002'
  - 'PROJ2-100'
  - 'HOTFIX-001'
```

#### allowed_authors

```yaml
# 选项1: 允许所有作者
allowed_authors:
  - '*'

# 选项2: 指定具体的GitHub用户名
allowed_authors:
  - 'developer1'
  - 'developer2'
  - 'team-lead'
  - 'release-manager'

# 选项3: 团队成员配置
allowed_authors:
  - 'senior-dev1'
  - 'senior-dev2'
  - 'devops-team'
  - 'product-owner'
```

## GitHub仓库配置

### 1. 启用Actions

1. 进入GitHub仓库
2. 点击"Settings"标签
3. 在左侧菜单选择"Actions" > "General"
4. 确保"Allow all actions and reusable workflows"被选中

### 2. 配置分支保护规则（推荐）

1. 进入"Settings" > "Branches"
2. 点击"Add rule"
3. 配置以下规则：

```
Branch name pattern: release/*

☑️ Require a pull request before merging
☑️ Require status checks to pass before merging
    ☑️ Require branches to be up to date before merging
    Status checks:
    ☑️ validate-pr

☑️ Restrict pushes that create files
☑️ Do not allow bypassing the above settings
```

### 3. 配置通知（可选）

在"Settings" > "Notifications"中配置失败通知：
- Email notifications
- Slack integration
- Teams integration

## 故障排除

### 常见错误

#### 1. "无法读取配置文件"

**错误信息**:
```
❌ 无法读取配置文件 .github/config/release-validation.yml
```

**解决方案**:
- 确保配置文件存在于正确路径
- 检查YAML格式是否正确
- 确保文件已提交到仓库

#### 2. "Commit缺少JIRA号"

**错误信息**:
```
❌ JIRA号验证失败:
  - Commit 1a2b3c4d 缺少JIRA号: "修复bug"
```

**解决方案**:
- 修改commit消息包含JIRA号：`git commit --amend -m "ABC-123 修复bug"`
- 或者在配置中设置`allowed_jiras: ['*']`

#### 3. "未授权的JIRA号"

**错误信息**:
```
❌ JIRA号验证失败:
  - Commit 1a2b3c4d 包含未授权的JIRA号 XYZ-999
```

**解决方案**:
- 在配置文件中添加该JIRA号
- 或者修改commit使用授权的JIRA号

#### 4. "作者没有权限"

**错误信息**:
```
❌ 作者验证失败:
  - PR作者 username 没有合并到此分支的权限
```

**解决方案**:
- 在配置文件的`allowed_authors`中添加该用户
- 或者让有权限的用户创建PR

### 调试技巧

1. **查看详细日志**: 在GitHub Actions的运行日志中查看详细的验证信息
2. **本地测试**: 可以在本地运行验证脚本进行测试
3. **配置验证**: 使用在线YAML验证器检查配置文件格式

## 高级配置

### 自定义分支模式

如果你的release分支命名不是`release/*`格式，可以修改工作流文件：

```yaml
# .github/workflows/release-branch-validation.yml
on:
  pull_request:
    branches:
      - 'release/**'     # 标准格式
      - 'hotfix/**'      # 热修复分支
      - 'staging'        # 预发布分支
```

### 多环境配置

可以为不同的分支创建不同的配置文件：

```
.github/config/
├── release-validation.yml          # 默认配置
├── hotfix-validation.yml           # 热修复分支配置
└── staging-validation.yml          # 预发布分支配置
```

然后在脚本中根据分支名称加载不同的配置。

## 贡献

欢迎提交Issue和Pull Request来改进这个工作流！

## 许可证

MIT License