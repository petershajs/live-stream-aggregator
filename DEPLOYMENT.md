# GitHub Pages 部署指南

本指南将帮助您将直播源聚合管理器部署到GitHub Pages。

## 📋 前置要求

1. 一个GitHub账号
2. Git已安装
3. Node.js已安装（本地开发需要）

## 🚀 部署步骤

### 第一步：创建GitHub仓库

1. 登录GitHub
2. 点击右上角的 "+" 按钮
3. 选择 "New repository"
4. 填写仓库名称（例如：`live-stream-aggregator`）
5. 选择 "Public"（公开仓库）
6. 点击 "Create repository"

### 第二步：上传代码

#### 方法A：使用命令行（推荐）

```bash
# 进入项目目录
cd d:\项目代码\zbyhj

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/live-stream-aggregator.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 方法B：使用GitHub Desktop

1. 打开GitHub Desktop
2. 选择 "File" -> "Add Local Repository"
3. 选择项目文件夹 `d:\项目代码\zbyhj`
4. 点击 "Publish repository"
5. 填写仓库名称和描述
6. 选择 "Public"
7. 点击 "Publish repository"

### 第三步：启用GitHub Pages

1. 进入你的GitHub仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Build and deployment" 部分：
   - Source 选择：**GitHub Actions**
   - （不要选择 Deploy from a branch）

5. 点击 "Save"

### 第四步：等待自动部署

1. 代码推送到GitHub后，GitHub Actions会自动运行
2. 进入仓库的 "Actions" 标签查看部署状态
3. 等待部署完成（通常需要1-3分钟）

### 第五步：访问你的应用

部署成功后：

- **管理界面**：`https://你的用户名.github.io/live-stream-aggregator/`
- **M3U文件**：`https://你的用户名.github.io/live-stream-aggregator/playlist.m3u`

## 🔄 更新直播源

### 方法一：通过Web界面（推荐）

1. 访问你的GitHub Pages网站
2. 在网页上添加、编辑或删除直播源
3. 点击"生成M3U文件"
4. 下载新的M3U文件

### 方法二：直接编辑streams.json

1. 在GitHub仓库中找到 `streams.json` 文件
2. 点击编辑按钮（铅笔图标）
3. 修改直播源数据
4. 提交更改
5. 等待GitHub Actions自动重新部署

### 方法三：本地修改后推送

```bash
# 本地修改streams.json
# 然后提交并推送
git add streams.json
git commit -m "更新直播源"
git push
```

## 📊 查看部署状态

1. 进入仓库的 "Actions" 标签
2. 可以看到所有的工作流运行记录
3. 点击最新的运行记录可以查看详细日志

## ⚙️ 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名（例如：`iptv.yourdomain.com`）
3. 提交并推送
4. 在域名DNS设置中添加CNAME记录：
   - 主机记录：`iptv`
   - 记录值：`你的用户名.github.io`

## 🐛 常见问题

### 1. 部署失败

**问题**：GitHub Actions部署失败

**解决方案**：
- 检查Actions日志查看具体错误
- 确保仓库是公开的
- 检查 `streams.json` 格式是否正确

### 2. 页面无法访问

**问题**：访问GitHub Pages显示404

**解决方案**：
- 确保部署已完成
- 检查URL是否正确
- 等待几分钟让DNS生效

### 3. M3U文件未更新

**问题**：修改直播源后M3U文件没有更新

**解决方案**：
- 确保已点击"生成M3U文件"按钮
- 等待GitHub Actions重新部署
- 清除浏览器缓存后重试

### 4. 无法编辑直播源

**问题**：在GitHub Pages上无法添加/编辑直播源

**说明**：
- GitHub Pages只提供静态文件托管
- 编辑功能需要本地运行服务器
- 建议在本地管理，然后推送到GitHub

## 📈 性能优化

### 减少文件大小

如果直播源很多，可以考虑：
- 分组创建多个M3U文件
- 只启用常用的直播源
- 定期清理无效的直播源

### 使用CDN

GitHub Pages自带CDN，无需额外配置

## 🔒 安全建议

1. 不要在仓库中存储敏感信息
2. 定期检查直播源的合法性
3. 如果需要密码保护，考虑使用其他托管方案

## 📝 维护建议

1. 定期检查直播源是否有效
2. 及时删除失效的直播源
3. 保持README文档的更新
4. 监控GitHub Actions的运行状态

## 🎯 下一步

部署成功后，你可以：

1. 分享M3U文件给朋友使用
2. 在各种播放器中导入M3U文件
3. 添加更多直播源
4. 自定义界面样式
5. 添加更多功能

---

祝你部署顺利！🎉
