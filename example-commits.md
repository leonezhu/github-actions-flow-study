# 示例Commit消息格式

这个文件展示了正确和错误的commit消息格式示例。

## ✅ 正确的Commit消息格式

以下是包含JIRA号的正确commit消息格式：

```bash
# 基本格式
git commit -m "ABC-123 修复用户登录页面的验证bug"
git commit -m "DEF-456 添加新的用户管理功能模块"
git commit -m "XYZ-789 优化数据库查询性能"

# 带冒号的格式
git commit -m "ABC-123: 修复登录页面bug"
git commit -m "DEF-456: 添加用户管理功能"

# JIRA号在中间或末尾
git commit -m "修复登录bug ABC-123"
git commit -m "添加用户管理功能 (DEF-456)"
git commit -m "优化性能 - XYZ-789"

# 多个JIRA号
git commit -m "ABC-123 DEF-456 重构用户模块"
git commit -m "修复多个问题: ABC-123, DEF-456, XYZ-789"
```

## ❌ 错误的Commit消息格式

以下commit消息会导致验证失败：

```bash
# 缺少JIRA号
git commit -m "修复登录bug"
git commit -m "添加新功能"
git commit -m "代码优化"

# JIRA号格式错误
git commit -m "abc-123 修复bug"           # 小写字母
git commit -m "ABC123 修复bug"            # 缺少连字符
git commit -m "ABC- 修复bug"             # 缺少数字
git commit -m "123-ABC 修复bug"          # 数字在前
```

## JIRA号格式规则

- **格式**: `项目前缀-数字`
- **项目前缀**: 2-10个大写字母
- **连字符**: 必须使用 `-`
- **数字**: 1个或多个数字
- **示例**: `ABC-123`, `PROJECT-456`, `HOTFIX-1`

## 测试用的JIRA号

在测试时，可以使用以下JIRA号（需要在配置文件中允许）：

- `TEST-001` - 测试功能开发
- `TEST-002` - 测试bug修复
- `DEMO-100` - 演示用例
- `SAMPLE-999` - 示例代码