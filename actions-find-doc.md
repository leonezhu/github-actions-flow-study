## 📋 GitHub Actions工作流的发现机制

关于GitHub如何发现和识别工作流文件，有以下重要规则：

### 🎯 核心原则

**GitHub Actions工作流文件必须位于默认分支（通常是`main`或`master`分支）的`.github/workflows/`目录下才能被GitHub识别和执行。**

### 📂 具体规则

**1. 分支要求**
- ✅ **默认分支**：工作流文件必须在仓库的默认分支上
- ❌ **其他分支**：仅在其他分支上的工作流文件不会被GitHub识别
- 🔄 **分支切换**：如果更改了默认分支，GitHub会从新的默认分支读取工作流

**2. 目录结构要求**
```
仓库根目录/
├── .github/
│   └── workflows/
│       └── *.yml 或 *.yaml
```

**3. 当前项目的情况**

查看当前的工作流文件 <mcfile name="release-branch-validation.yml" path=".github/workflows/release-branch-validation.yml"></mcfile>：

```yaml
name: Release Branch Validation

on:
  pull_request:
    branches:
      - 'release/**'
    types: [opened, synchronize, reopened]

jobs:
  validate-pr:  # 这就是你看到的job名称
    runs-on: ubuntu-latest
    # ...
```

### 🔍 GitHub配置页面显示逻辑

**GitHub在以下位置显示工作流：**

1. **Actions标签页**：显示所有已执行和可执行的工作流
2. **Settings > Actions**：显示工作流配置和权限设置
3. **PR页面**：显示针对该PR触发的检查状态

**显示条件：**
- 工作流文件在默认分支的`.github/workflows/`目录下
- 文件格式正确（有效的YAML语法）
- 包含必要的`name`、`on`、`jobs`字段

### ⚠️ 重要注意事项

1. **首次推送**：工作流文件首次推送到默认分支后，GitHub需要几分钟来识别
2. **语法错误**：如果YAML语法有误，工作流不会出现在列表中
3. **权限问题**：某些组织可能限制Actions的使用

### 💡 验证方法

要确认工作流是否被正确识别：
1. 进入GitHub仓库页面
2. 点击"Actions"标签
3. 查看左侧工作流列表是否包含"Release Branch Validation"
4. 创建一个针对`release/**`分支的PR来触发工作流

**总结：必须在默认分支（如master/main）上有`.github/workflows/`目录，GitHub才能识别和执行其中的工作流文件。**
        