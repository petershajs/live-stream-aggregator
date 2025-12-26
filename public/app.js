// 全局变量
let sources = [];
let channels = [];
let filteredChannels = [];

// 检测是否为GitHub Pages环境
const isGitHubPages = window.location.hostname.includes('github.io');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

// 加载数据
async function loadData() {
  try {
    let data;
    
    if (isGitHubPages) {
      // GitHub Pages环境：直接读取data.json文件
      const response = await fetch('data.json');
      data = await response.json();
    } else {
      // 本地环境：调用API接口
      const response = await fetch('/api/data');
      data = await response.json();
    }
    
    sources = data.sources || [];
    channels = data.channels || [];
    filteredChannels = [...channels];
    
    renderSources();
    renderChannels();
  } catch (error) {
    console.error('加载数据失败:', error);
    showToast('加载数据失败', 'error');
  }
}

// 设置事件监听
function setupEventListeners() {
  // 搜索
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  
  // 模态框关闭
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });
  
  // 点击模态框外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModals();
    });
  });
}

// ==================== 源管理 ====================

// 渲染源列表
function renderSources() {
  const container = document.getElementById('sourcesList');
  
  if (sources.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无直播源</p>
        <p>点击"添加直播源"开始添加</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sources.map(source => `
    <div class="stream-card ${source.enabled ? '' : 'disabled'}">
      <div class="stream-info">
        <h3>${escapeHtml(source.name)}</h3>
        <p class="stream-url">${escapeHtml(source.url)}</p>
        <div class="stream-meta">
          <span class="badge">${source.channelCount || 0} 个频道</span>
          ${source.lastUpdated ? `<span class="text-muted">更新于 ${formatDate(source.lastUpdated)}</span>` : ''}
        </div>
      </div>
      <div class="stream-actions">
        <button class="btn btn-primary btn-sm" onclick="parseSource(${source.id})">
          解析
        </button>
        <button class="btn btn-secondary btn-sm" onclick="editSource(${source.id})">
          编辑
        </button>
        <button class="btn ${source.enabled ? 'btn-warning' : 'btn-success'} btn-sm" 
                onclick="toggleSource(${source.id})">
          ${source.enabled ? '禁用' : '启用'}
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteSource(${source.id})">
          删除
        </button>
      </div>
    </div>
  `).join('');
}

// 打开添加源模态框
function openAddSourceModal() {
  document.getElementById('sourceModalTitle').textContent = '添加直播源';
  document.getElementById('sourceForm').reset();
  document.getElementById('sourceId').value = '';
  openModal('sourceModal');
}

// 编辑源
function editSource(id) {
  const source = sources.find(s => s.id === id);
  if (!source) return;
  
  document.getElementById('sourceModalTitle').textContent = '编辑直播源';
  document.getElementById('sourceId').value = source.id;
  document.getElementById('sourceName').value = source.name;
  document.getElementById('sourceUrl').value = source.url;
  openModal('sourceModal');
}

// 保存源
async function saveSource(e) {
  e.preventDefault();
  
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  const id = document.getElementById('sourceId').value;
  const name = document.getElementById('sourceName').value.trim();
  const url = document.getElementById('sourceUrl').value.trim();
  
  if (!name || !url) {
    showToast('请填写完整信息', 'error');
    return;
  }
  
  try {
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/api/sources/${id}` : '/api/sources';
    
    const response = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(id ? '更新成功' : '添加成功', 'success');
      closeModals();
      await loadData();
    } else {
      showToast(result.error || '操作失败', 'error');
    }
  } catch (error) {
    console.error('保存失败:', error);
    showToast('保存失败', 'error');
  }
}

// 删除源
async function deleteSource(id) {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  if (!confirm('确定要删除这个直播源吗？这将同时删除该源的所有频道。')) return;
  
  try {
    const response = await fetch(`/api/sources/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('删除成功', 'success');
      await loadData();
    } else {
      showToast(result.error || '删除失败', 'error');
    }
  } catch (error) {
    console.error('删除失败:', error);
    showToast('删除失败', 'error');
  }
}

// 切换源状态
async function toggleSource(id) {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  const source = sources.find(s => s.id === id);
  if (!source) return;
  
  try {
    const response = await fetch(`/api/sources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !source.enabled })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(source.enabled ? '已禁用' : '已启用', 'success');
      await loadData();
    } else {
      showToast(result.error || '操作失败', 'error');
    }
  } catch (error) {
    console.error('操作失败:', error);
    showToast('操作失败', 'error');
  }
}

// 解析源
async function parseSource(id) {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  const source = sources.find(s => s.id === id);
  if (!source) return;
  
  showToast('正在解析...', 'info');
  
  try {
    const response = await fetch(`/api/sources/${id}/parse`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`解析成功，获取到 ${result.count} 个频道`, 'success');
      await loadData();
    } else {
      showToast(result.error || '解析失败', 'error');
    }
  } catch (error) {
    console.error('解析失败:', error);
    showToast('解析失败', 'error');
  }
}

// ==================== 频道管理 ====================

// 渲染频道列表
function renderChannels() {
  const container = document.getElementById('channelsList');
  
  if (filteredChannels.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无频道</p>
        <p>添加直播源并解析后即可查看频道</p>
      </div>
    `;
    return;
  }
  
  // 按分组排序
  const grouped = {};
  filteredChannels.forEach(channel => {
    const group = channel.group || '未分类';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(channel);
  });
  
  let html = '';
  for (const [group, groupChannels] of Object.entries(grouped)) {
    html += `
      <div class="channel-group">
        <h3 class="group-title">${escapeHtml(group)} <span class="badge">${groupChannels.length}</span></h3>
        <div class="channel-list">
          ${groupChannels.map(channel => `
            <div class="channel-item ${channel.enabled ? '' : 'disabled'}">
              ${channel.logo ? `<img src="${escapeHtml(channel.logo)}" class="channel-logo" alt="${escapeHtml(channel.name)}" onerror="this.style.display='none'">` : ''}
              <div class="channel-info">
                <h4>${escapeHtml(channel.name)}</h4>
                <p class="channel-source">来源: ${escapeHtml(channel.sourceName)}</p>
              </div>
              <div class="channel-actions">
                <button class="btn ${channel.enabled ? 'btn-warning' : 'btn-success'} btn-sm" 
                        onclick="toggleChannel(${channel.id})">
                  ${channel.enabled ? '禁用' : '启用'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteChannel(${channel.id})">
                  删除
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// 搜索频道
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    filteredChannels = [...channels];
  } else {
    filteredChannels = channels.filter(channel => 
      channel.name.toLowerCase().includes(query) ||
      (channel.group && channel.group.toLowerCase().includes(query)) ||
      (channel.sourceName && channel.sourceName.toLowerCase().includes(query))
    );
  }
  
  renderChannels();
}

// 切换频道状态
async function toggleChannel(id) {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  const channel = channels.find(c => c.id === id);
  if (!channel) return;
  
  try {
    const response = await fetch(`/api/channels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !channel.enabled })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(channel.enabled ? '已禁用' : '已启用', 'success');
      await loadData();
    } else {
      showToast(result.error || '操作失败', 'error');
    }
  } catch (error) {
    console.error('操作失败:', error);
    showToast('操作失败', 'error');
  }
}

// 删除频道
async function deleteChannel(id) {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  if (!confirm('确定要删除这个频道吗？')) return;
  
  try {
    const response = await fetch(`/api/channels/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('删除成功', 'success');
      await loadData();
    } else {
      showToast(result.error || '删除失败', 'error');
    }
  } catch (error) {
    console.error('删除失败:', error);
    showToast('删除失败', 'error');
  }
}

// 批量操作
async function batchEnable() {
  // GitHub Pages环境不支持编辑功能
  if (isGitHubPages) {
    showToast('GitHub Pages版本仅支持查看，请在本地运行完整版', 'error');
    return;
  }
  
  const enabledChannels = filteredChannels.filter(c => c.enabled);
  if (enabledChannels.length === 0) {
    showToast('没有可操作的频道', 'warning');
    return;
  }
  
  if (!confirm(`确定要禁用所有 ${enabledChannels.length} 个已启用的频道吗？`)) return;
  
  try {
    const response = await fetch('/api/channels/batch', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: enabledChannels.map(c => c.id),
        enabled: false
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`已禁用 ${result.count} 个频道`, 'success');
      await loadData();
    } else {
      showToast(result.error || '操作失败', 'error');
    }
  } catch (error) {
    console.error('操作失败:', error);
    showToast('操作失败', 'error');
  }
}

// ==================== M3U文件 ====================

// 生成并下载M3U文件
async function generateM3U() {
  showToast('正在生成M3U文件...', 'info');
  
  try {
    const response = await fetch('/api/generate-m3u');
    const result = await response.json();
    
    if (result.success) {
      // 下载文件
      window.location.href = result.url;
      showToast('M3U文件已生成并下载', 'success');
    } else {
      showToast(result.error || '生成失败', 'error');
    }
  } catch (error) {
    console.error('生成失败:', error);
    showToast('生成失败', 'error');
  }
}

// ==================== 工具函数 ====================

// 打开模态框
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

// 关闭所有模态框
function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// 显示提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// HTML转义
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}
