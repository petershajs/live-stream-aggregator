const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');
const M3U_FILE = path.join(__dirname, 'public', 'playlist.m3u');

// 读取数据
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return { sources: [], channels: [] };
  }
}

// 保存数据
async function saveData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    return false;
  }
}

// 获取URL内容
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 解析M3U文件
function parseM3U(content, sourceId, sourceName) {
  const channels = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentChannel = null;
  
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      // 解析频道信息
      const info = line.substring(8);
      const nameMatch = info.match(/,([^,]+)$/);
      const groupMatch = info.match(/group-title="([^"]+)"/);
      const logoMatch = info.match(/tvg-logo="([^"]+)"/);
      const idMatch = info.match(/tvg-id="([^"]+)"/);
      
      currentChannel = {
        id: Date.now() + Math.random(),
        sourceId: sourceId,
        sourceName: sourceName,
        name: nameMatch ? nameMatch[1].trim() : '未命名频道',
        group: groupMatch ? groupMatch[1] : '未分类',
        logo: logoMatch ? logoMatch[1] : '',
        tvgId: idMatch ? idMatch[1] : '',
        enabled: true,
        url: ''
      };
    } else if (line.startsWith('http')) {
      // 频道URL
      if (currentChannel) {
        currentChannel.url = line.trim();
        channels.push(currentChannel);
        currentChannel = null;
      }
    }
  }
  
  return channels;
}

// 生成M3U文件
async function generateM3U() {
  try {
    const data = await readData();
    const enabledChannels = data.channels.filter(c => c.enabled);
    
    let m3uContent = '#EXTM3U\n';
    
    enabledChannels.forEach(channel => {
      let extinf = '#EXTINF:-1';
      if (channel.tvgId) extinf += ` tvg-id="${channel.tvgId}"`;
      if (channel.logo) extinf += ` tvg-logo="${channel.logo}"`;
      if (channel.group) extinf += ` group-title="${channel.group}"`;
      extinf += `,${channel.name}`;
      
      m3uContent += extinf + '\n';
      m3uContent += channel.url + '\n';
    });
    
    await fs.writeFile(M3U_FILE, m3uContent, 'utf8');
    return true;
  } catch (error) {
    console.error('生成M3U文件失败:', error);
    return false;
  }
}

// ==================== API路由 ====================

// 获取所有数据
app.get('/api/data', async (req, res) => {
  const data = await readData();
  res.json(data);
});

// 获取所有源
app.get('/api/sources', async (req, res) => {
  const data = await readData();
  res.json(data.sources);
});

// 添加源
app.post('/api/sources', async (req, res) => {
  try {
    const { name, url } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ success: false, error: '名称和URL不能为空' });
    }
    
    const data = await readData();
    const newSource = {
      id: Date.now(),
      name: name.trim(),
      url: url.trim(),
      enabled: true,
      lastUpdated: new Date().toISOString(),
      channelCount: 0
    };
    
    data.sources.push(newSource);
    
    const saved = await saveData(data);
    if (saved) {
      res.json({ success: true, source: newSource });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新源
app.put('/api/sources/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.sources.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '源不存在' });
    }
    
    data.sources[index] = {
      ...data.sources[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    const saved = await saveData(data);
    if (saved) {
      res.json({ success: true, source: data.sources[index] });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除源
app.delete('/api/sources/:id', async (req, res) => {
  try {
    const data = await readData();
    const sourceId = parseInt(req.params.id);
    
    // 删除源
    data.sources = data.sources.filter(s => s.id !== sourceId);
    
    // 删除该源的所有频道
    data.channels = data.channels.filter(c => c.sourceId !== sourceId);
    
    const saved = await saveData(data);
    if (saved) {
      await generateM3U();
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 解析源（获取频道列表）
app.post('/api/sources/:id/parse', async (req, res) => {
  try {
    const data = await readData();
    const source = data.sources.find(s => s.id === parseInt(req.params.id));
    
    if (!source) {
      return res.status(404).json({ success: false, error: '源不存在' });
    }
    
    // 获取M3U内容
    const content = await fetchUrl(source.url);
    
    // 解析频道
    const channels = parseM3U(content, source.id, source.name);
    
    // 删除该源的旧频道
    data.channels = data.channels.filter(c => c.sourceId !== source.id);
    
    // 添加新频道
    data.channels.push(...channels);
    
    // 更新源的频道数量
    const sourceIndex = data.sources.findIndex(s => s.id === source.id);
    data.sources[sourceIndex].channelCount = channels.length;
    data.sources[sourceIndex].lastUpdated = new Date().toISOString();
    
    const saved = await saveData(data);
    if (saved) {
      await generateM3U();
      res.json({ 
        success: true, 
        channels: channels,
        count: channels.length 
      });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    console.error('解析失败:', error);
    res.status(500).json({ success: false, error: '解析失败: ' + error.message });
  }
});

// 获取所有频道
app.get('/api/channels', async (req, res) => {
  const data = await readData();
  res.json(data.channels);
});

// 更新频道
app.put('/api/channels/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.channels.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '频道不存在' });
    }
    
    data.channels[index] = { ...data.channels[index], ...req.body };
    
    const saved = await saveData(data);
    if (saved) {
      await generateM3U();
      res.json({ success: true, channel: data.channels[index] });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量更新频道状态
app.put('/api/channels/batch', async (req, res) => {
  try {
    const { ids, enabled } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'ids必须是数组' });
    }
    
    const data = await readData();
    let updatedCount = 0;
    
    data.channels.forEach(channel => {
      if (ids.includes(channel.id)) {
        channel.enabled = enabled;
        updatedCount++;
      }
    });
    
    const saved = await saveData(data);
    if (saved) {
      await generateM3U();
      res.json({ success: true, count: updatedCount });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除频道
app.delete('/api/channels/:id', async (req, res) => {
  try {
    const data = await readData();
    const channel = data.channels.find(c => c.id === parseInt(req.params.id));
    
    if (!channel) {
      return res.status(404).json({ success: false, error: '频道不存在' });
    }
    
    data.channels = data.channels.filter(c => c.id !== parseInt(req.params.id));
    
    // 更新源的频道数量
    const sourceIndex = data.sources.findIndex(s => s.id === channel.sourceId);
    if (sourceIndex !== -1) {
      data.sources[sourceIndex].channelCount--;
    }
    
    const saved = await saveData(data);
    if (saved) {
      await generateM3U();
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成并下载M3U文件
app.get('/api/generate-m3u', async (req, res) => {
  const success = await generateM3U();
  if (success) {
    res.json({ success: true, url: '/playlist.m3u' });
  } else {
    res.status(500).json({ success: false, error: '生成失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`M3U文件地址: http://localhost:${PORT}/playlist.m3u`);
  
  // 启动时生成M3U文件
  generateM3U();
});
