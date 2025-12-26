# 快速开始指南

## 🚀 5分钟快速部署

### 方式一：本地运行（用于管理直播源）

```bash
# 1. 安装依赖
npm install

# 2. 启动服务器
npm start

# 3. 打开浏览器访问
http://localhost:3000
```

### 方式二：部署到GitHub Pages（用于分享M3U文件）

```bash
# 1. 初始化Git仓库
git init
git add .
git commit -m "Initial commit"

# 2. 推送到GitHub（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/live-stream-aggregator.git
git branch -M main
git push -u origin main

# 3. 在GitHub仓库设置中启用GitHub Pages
# Settings -> Pages -> Source选择"GitHub Actions"

# 4. 等待部署完成后访问
https://你的用户名.github.io/live-stream-aggregator/
```

## 📺 添加你的第一个直播源

1. 点击"添加直播源"按钮
2. 填写信息：
   - 名称：CCTV-1
   - 分组：央视
   - 直播地址：http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8
3. 点击"保存"

## 📥 生成并下载M3U文件

1. 点击"生成M3U文件"按钮
2. 点击"下载M3U"按钮
3. 将下载的文件导入到播放器中

## 🎬 在播放器中使用

### VLC Media Player
1. 打开VLC
2. 媒体 -> 打开网络串流
3. 输入M3U文件的URL或选择文件
4. 点击播放

### PotPlayer
1. 打开PotPlayer
2. 右键 -> 打开 -> 打开链接
3. 输入M3U文件URL
4. 点击确定

### IINA (macOS)
1. 打开IINA
2. 文件 -> 打开网络
3. 输入M3U文件URL
4. 点击打开

## 📋 常用直播源示例

### 央视
```
CCTV-1: http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8
CCTV-2: http://ivi.bupt.edu.cn/hls/cctv2hd.m3u8
CCTV-3: http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8
CCTV-4: http://ivi.bupt.edu.cn/hls/cctv4hd.m3u8
CCTV-5: http://ivi.bupt.edu.cn/hls/cctv5hd.m3u8
CCTV-6: http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8
```

### 卫视
```
湖南卫视: http://ivi.bupt.edu.cn/hls/hunanhd.m3u8
浙江卫视: http://ivi.bupt.edu.cn/hls/zjhd.m3u8
江苏卫视: http://ivi.bupt.edu.cn/hls/jshd.m3u8
东方卫视: http://ivi.bupt.edu.cn/hls/dftv.m3u8
```

### 注意
以上直播源仅供参考，实际可用性取决于源提供者。

## 🔍 批量导入示例

### M3U格式
```
#EXTM3U
#EXTINF:-1 tvg-logo="" group-title="央视",CCTV-1
http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8
#EXTINF:-1 tvg-logo="" group-title="央视",CCTV-2
http://ivi.bupt.edu.cn/hls/cctv2hd.m3u8
```

### JSON格式
```json
[
  {
    "name": "CCTV-1",
    "group": "央视",
    "url": "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8",
    "logo": ""
  }
]
```

## 💡 使用技巧

1. **分组管理**：使用分组功能整理不同类型的直播源
2. **搜索筛选**：使用搜索框快速找到特定直播源
3. **禁用测试**：暂时禁用不稳定的直播源
4. **定期更新**：定期检查并更新直播源地址

## 🆘 遇到问题？

- 查看完整的 [README.md](README.md)
- 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 了解部署详情
- 提交Issue获取帮助

---

开始使用吧！🎉
