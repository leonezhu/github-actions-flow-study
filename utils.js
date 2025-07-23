// 工具函数文件
// 用于演示多个commits的验证

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function validateJiraFormat(jiraNumber) {
  const pattern = /^[A-Z]+-\d+$/;
  return pattern.test(jiraNumber);
}

module.exports = {
  formatDate,
  validateJiraFormat
};