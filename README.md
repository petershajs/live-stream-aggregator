# 📺 直播源聚合管理器

一个简单易用的直播源聚合工具，可以管理多个直播源并生成标准的M3U播放列表文件，支持部署到GitHub Pages。

## ✨ 功能特性

- 🎯 **直播源管理**：添加、编辑、删除直播源
- 🔄 **批量导入**：支持M3U格式和JSON格式的批量导入
- 📊 **智能筛选**：按名称、分组、状态筛选直播源
- 📥 **M3U生成**：一键生成标准M3U播放列表文件
- 🌐 **GitHub Pages**：支持一键部署到GitHub Pages
- 📱 **响应式设计**：完美支持桌面和移动设备
- 🎨 **美观界面**：现代化的UI设计，操作简单直观

## 🚀 快速开始

### 本地运行

1. **克隆项目**
```bash
git clone https://github.com/your-username/live-stream-aggregator.git
cd live-stream-aggregator
```

2. **安装依赖**
```bash
npm install
```

3. **启动服务器**
```bash
npm start
```

4. **访问应用**
打开浏览器访问：`http://localhost:3000`

### 开发模式

使用nodemon自动重启：
```bash
npm run dev
```

## 📖 使用说明

### 添加直播源

1. 点击"添加直播源"按钮
2. 填写直播源信息：
   - **名称**：直播源的显示名称（必填）
   - **分组**：直播源的分组（可选）
   - **直播地址**：直播流的URL地址（必填）
   - **Logo地址**：直播源Logo的URL（可选）
3. 点击"保存"按钮

### 编辑直播源

1. 在直播源列表中找到要编辑的直播源
2. 点击"编辑"按钮
3. 修改信息后点击"保存"

### 批量导入

支持两种格式：

#### M3U格式
```
#EXTM3U
#EXTINF:-1 tvg-logo="" group-title="央视",CCTV-1
http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8
#EXTINF:-1 tvg-logo="" group-title="央视",CCTV-2
http://ivi.bupt.edu.cn/hls/cctv2hd.m3u8
```

#### JSON格式
```json
[
  {
    "name": "CCTV-1",
    "group": "央视",
    "url": "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8",
    "logo": ""
  },
  {
    "name": "CCTV-2",
    "group": "央视",
    "url": "http://ivi.bupt.edu.cn/hls/cctv2hd.m3u8",
    "logo": ""
  }
]
```

### 生成M3U文件

1. 确保已添加直播源并启用
2. 点击"生成M3U文件"按钮
3. 点击"下载M3U"按钮下载文件
4. 将M3U文件导入到播放器中使用

### 筛选直播源

- **搜索**：在搜索框输入关键词，按名称或地址筛选
- **分组筛选**：选择特定分组查看
- **状态筛选**：查看已启用或已禁用的直播源

## 🌐 部署到GitHub Pages

### 方法一：使用GitHub Actions（推荐）

1. **创建GitHub仓库**
   - 将代码推送到GitHub仓库
   - 确保仓库是公开的

2. **启用GitHub Pages**
   - 进入仓库的Settings
   - 找到Pages选项
   - 在Source中选择"GitHub Actions"

3. **配置GitHub Actions**
   - 项目已包含`.github/workflows/deploy.yml`
   - 推送代码到main或master分支会自动部署
   - 部署完成后会获得一个GitHub Pages URL

4. **访问应用**
   - 部署成功后，访问：`https://your-username.github.io/live-stream-aggregator/`
   - M3U文件地址：`https://your-username.github.io/live-stream-aggregator/playlist.m3u`

### 方法二：手动部署

1. **生成M3U文件**
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('streams.json', 'utf8'));
const enabledStreams = data.streams.filter(s => s.enabled);
let m3uContent = '#EXTM3U\n';
enabledStreams.forEach(stream => {
  m3uContent += '#EXTINF:-1 tvg-logo=\"' + stream.logo + '\" group-title=\"' + stream.group + '\",' + stream.name + '\n';
  m3uContent += stream.url + '\n';
});
fs.writeFileSync('public/playlist.m3u', m3uContent);
console.log('M3U文件已生成');
"
```

2. **上传到GitHub Pages**
   - 将`public`文件夹的内容上传到GitHub Pages分支
   - 或使用GitHub Desktop等工具推送

## 📁 项目结构

```
live-stream-aggregator/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions部署配置
├── public/
│   ├── index.html              # 前端页面
│   ├── style.css               # 样式文件
│   ├── app.js                  # 前端逻辑
│   └── playlist.m3u            # 生成的M3U文件
├── streams.json                # 直播源数据（本地）
├── server.js                   # 后端服务器
├── package.json                # 项目配置
├── .gitignore                  # Git忽略文件
└── README.md                   # 项目说明
```

## 🎯 API接口

### 获取所有直播源
```
GET /api/streams
```

### 添加直播源
```
POST /api/streams
Content-Type: application/json

{
  "name": "直播源名称",
  "group": "分组名称",
  "url": "直播地址",
  "logo": "Logo地址"
}
```

### 更新直播源
```
PUT /api/streams/:id
Content-Type: application/json

{
  "name": "直播源名称",
  "group": "分组名称",
  "url": "直播地址",
  "logo": "Logo地址",
  "enabled": true
}
```

### 删除直播源
```
DELETE /api/streams/:id
```

### 批量导入
```
POST /api/streams/import
Content-Type: application/json

{
  "streams": [
    {
      "name": "直播源名称",
      "group": "分组名称",
      "url": "直播地址",
      "logo": "Logo地址"
    }
  ]
}
```

### 生成M3U文件
```
GET /api/generate-m3u
```

## 📝 配置说明

### 修改端口

在`server.js`中修改：
```javascript
const PORT = process.env.PORT || 3000;
```

或使用环境变量：
```bash
PORT=8080 npm start
```

### 自定义直播源

编辑`streams.json`文件：
```json
{
  "streams": [
    {
      "id": 1,
      "name": "直播源名称",
      "logo": "Logo地址",
      "url": "直播地址",
      "group": "分组名称",
      "enabled": true
    }
  ]
}
```

## 🎬 支持的播放器

生成的M3U文件可以在以下播放器中使用：

- VLC Media Player
- PotPlayer
- IINA (macOS)
- MPV Player
- Kodi
- Plex
- Emby
- Jellyfin
- IPTV Smarters
- TiviMate
- 以及所有支持M3U格式的播放器

## 🔧 技术栈

- **后端**：Node.js + Express
- **前端**：原生HTML/CSS/JavaScript
- **部署**：GitHub Pages + GitHub Actions

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## ⚠️ 注意事项

1. 请确保使用的直播源合法合规
2. 部署到GitHub Pages时，仓库需要设置为公开
3. GitHub Pages有流量限制，适合个人使用
4. 直播源的可用性取决于源提供者

## 📞 联系方式

如有问题或建议，请提交Issue。

---

**享受您的直播体验！** 🎉
