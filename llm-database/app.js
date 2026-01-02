// LLM Database Manager - 简洁高效版
const API_BASE = '/api';
const USE_SERVER = location.protocol !== 'file:';

// 状态
let models = [];
let editIndex = -1;
let benchmarks = {};
let knownBenchmarks = []; // 已知的所有 benchmark 名称
let maintainedSet = new Set(); // 已维护的记录（通过 slug 标识）

// DOM 元素
const tableBody = document.getElementById('table-body');
const editPanel = document.getElementById('edit-panel');
const editForm = document.getElementById('edit-form');
const searchInput = document.getElementById('search');
const filterType = document.getElementById('filter-type');
const filterDeveloper = document.getElementById('filter-developer');
const countEl = document.getElementById('count');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadModels();
    loadMaintainedStatus();
    collectKnownBenchmarks();
    renderTable();
    updateDeveloperFilter();
    setupEventListeners();
    setupColumnResizers();
    setupPanelResizer();
    setupBenchmarkSuggestions();
});

// 加载维护状态（从 localStorage）
function loadMaintainedStatus() {
    try {
        const stored = localStorage.getItem('llm_maintained');
    if (stored) {
            maintainedSet = new Set(JSON.parse(stored));
        }
        } catch (e) {
        console.warn('Failed to load maintained status');
}
}

// 保存维护状态
function saveMaintainedStatus() {
    localStorage.setItem('llm_maintained', JSON.stringify([...maintainedSet]));
}

// 切换维护状态
window.toggleMaintained = function(slug) {
    if (maintainedSet.has(slug)) {
        maintainedSet.delete(slug);
    } else {
        maintainedSet.add(slug);
    }
    saveMaintainedStatus();
    renderTable();
};

// 检查是否已维护
function isMaintained(model) {
    return maintainedSet.has(model.slug || model.name);
}

// 收集已知的 benchmark 名称
function collectKnownBenchmarks() {
    const allNames = new Set();
    models.forEach(m => {
        if (m.benchmarks) {
            Object.keys(m.benchmarks).forEach(name => allNames.add(name));
    }
    });
    knownBenchmarks = [...allNames].sort();
}

// 事件监听
function setupEventListeners() {
    // 新增按钮
    document.getElementById('add-btn').addEventListener('click', () => {
        editIndex = -1;
        resetForm();
        document.getElementById('panel-title').textContent = '新增模型';
        document.getElementById('delete-btn').style.display = 'none';
        openPanel();
        });

    // 关闭面板
    document.getElementById('close-panel').addEventListener('click', closePanel);

    // 表单提交
    editForm.addEventListener('submit', handleSubmit);

    // 重置表单
    document.getElementById('reset-form').addEventListener('click', resetForm);

    // 删除按钮
    document.getElementById('delete-btn').addEventListener('click', handleDelete);

    // 搜索和筛选
    searchInput.addEventListener('input', renderTable);
    filterType.addEventListener('change', renderTable);
    filterDeveloper.addEventListener('change', renderTable);
    document.getElementById('filter-maintained').addEventListener('change', renderTable);

    // 导入导出
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);

    // 标签页切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // 自动生成 slug
    document.getElementById('name').addEventListener('input', e => {
        if (editIndex === -1) {
            document.getElementById('slug').value = generateSlug(e.target.value);
        }
    });

    // Benchmark 添加
    document.getElementById('add-benchmark').addEventListener('click', addBenchmark);
    document.getElementById('benchmark-score').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addBenchmark();
        }
    });

    // OpenRouter 自动填充
    document.getElementById('fetch-openrouter').addEventListener('click', fetchFromOpenRouter);

    // 翻译按钮
    document.getElementById('translate-btn').addEventListener('click', translateDescription);
}

// 数据加载
async function loadModels() {
    if (USE_SERVER) {
        try {
            const res = await fetch(`${API_BASE}/models`);
            models = await res.json();
        } catch (e) {
            console.warn('Server unavailable, using localStorage');
            loadFromStorage();
        }
    } else {
        loadFromStorage();
    }
}

function loadFromStorage() {
    const stored = localStorage.getItem('llm_database');
    if (stored) {
        try {
            models = JSON.parse(stored);
        } catch (e) {
            models = [];
        }
    }
}

async function saveModels() {
    localStorage.setItem('llm_database', JSON.stringify(models));
    if (USE_SERVER) {
        try {
            await fetch(`${API_BASE}/models`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(models)
            });
        } catch (e) {
            console.warn('Failed to sync with server');
        }
    }
}

// 表格渲染
function renderTable() {
    const filtered = getFilteredModels();
    countEl.textContent = `${filtered.length} 条记录`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <h3>暂无数据</h3>
                    <p>点击"新增"按钮添加模型</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map((model, i) => {
        const realIndex = models.indexOf(model);
        const isOpen = model.model_type !== 'closed';
        const maintained = isMaintained(model);
        const slug = model.slug || model.name;
        return `
            <tr data-index="${realIndex}" class="${realIndex === editIndex ? 'selected' : ''} ${maintained ? 'maintained' : ''}">
                <td class="col-name">${esc(model.name || '-')}</td>
                <td class="col-developer">${esc(model.developer || '-')}</td>
                <td class="col-type">
                    <span class="type-tag ${isOpen ? 'type-open' : 'type-closed'}">
                        ${isOpen ? '开源' : '闭源'}
                    </span>
                </td>
                <td class="col-family">${esc(model.family || '-')}</td>
                <td class="col-params">${model.params_total ? model.params_total + 'B' : '-'}</td>
                <td class="col-date">${model.release_date || '-'}</td>
                <td class="col-maintained">
                    <button class="maintain-btn ${maintained ? 'done' : ''}" onclick="toggleMaintained('${esc(slug)}')" title="${maintained ? '点击取消维护标记' : '点击标记为已维护'}">
                        ${maintained ? '✓' : '○'}
                    </button>
                </td>
                <td class="col-actions">
                    <div class="action-btns">
                        <button onclick="editModel(${realIndex})">编辑</button>
                        <button class="del-btn" onclick="confirmDelete(${realIndex})">删除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getFilteredModels() {
    const search = searchInput.value.toLowerCase();
    const type = filterType.value;
    const developer = filterDeveloper.value;
    const maintainedFilter = document.getElementById('filter-maintained').value;

    return models.filter(m => {
        // 搜索匹配
        const matchSearch = !search || 
            (m.name || '').toLowerCase().includes(search) ||
            (m.developer || '').toLowerCase().includes(search) ||
            (m.family || '').toLowerCase().includes(search) ||
            (m.short_name || '').toLowerCase().includes(search);

        // 类型筛选
        const matchType = !type || m.model_type === type;

        // 开发者筛选
        const matchDev = !developer || m.developer === developer;

        // 维护状态筛选
        const maintained = isMaintained(m);
        const matchMaintained = !maintainedFilter || 
            (maintainedFilter === 'yes' && maintained) ||
            (maintainedFilter === 'no' && !maintained);

        return matchSearch && matchType && matchDev && matchMaintained;
    });
}

function updateDeveloperFilter() {
    const developers = [...new Set(models.map(m => m.developer).filter(Boolean))].sort();
    filterDeveloper.innerHTML = '<option value="">全部开发者</option>' +
        developers.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
}

// 编辑模型
window.editModel = function(index) {
    editIndex = index;
    const model = models[index];
    
    document.getElementById('panel-title').textContent = '编辑模型';
    document.getElementById('delete-btn').style.display = 'block';
    
    populateForm(model);
    openPanel();
    renderTable(); // 更新选中状态
};

// 确认删除
window.confirmDelete = function(index) {
    if (confirm('确定要删除这个模型吗？')) {
        models.splice(index, 1);
        saveModels();
        renderTable();
        updateDeveloperFilter();
        if (editIndex === index) {
            closePanel();
        }
        toast('已删除');
    }
};

// 表单处理
async function handleSubmit(e) {
    e.preventDefault();
    
    const model = collectFormData();

    if (editIndex >= 0) {
        models[editIndex] = model;
        toast('已更新');
    } else {
        models.push(model);
        toast('已添加');
    }

    await saveModels();
    renderTable();
    updateDeveloperFilter();
    closePanel();
}

function handleDelete() {
    if (editIndex >= 0 && confirm('确定要删除这个模型吗？')) {
        models.splice(editIndex, 1);
        saveModels();
        renderTable();
        updateDeveloperFilter();
        closePanel();
        toast('已删除');
    }
}

function collectFormData() {
    const isOpen = document.querySelector('input[name="model_type"]:checked').value === 'open';

    return {
        // 基础信息
        openrouter_id: val('openrouter_id'),
        model_type: isOpen ? 'open' : 'closed',
        name: val('name'),
        short_name: val('short_name'),
        slug: val('slug'),
        developer: val('developer'),
        family: val('family'),
        model_series: val('model_series'),
        branch_type: val('branch_type'),
        release_date: val('release_date'),
        version: val('version'),
        logo_url: val('logo_url'),
        description: val('description'),
        description_zh: val('description_zh'),

        // 技术规格
        architecture: val('architecture'),
        params_total: num('params_total'),
        params_active: num('params_active'),
        context_window: num('context_window'),
        max_output_tokens: num('max_output_tokens'),
        training_tokens: num('training_tokens'),
        vocab_size: num('vocab_size'),
        knowledge_cutoff: val('knowledge_cutoff'),
        layers: num('layers'),
        attention_mechanism: val('attention_mechanism'),
        fine_tuning_method: checked('fine_tuning_method'),

        // 商用
        license: val('license'),
        commercial_use_allowed: document.getElementById('commercial_use_allowed').checked,
        free_tier_available: document.getElementById('free_tier_available').checked,
        pricing_input: num('pricing_input'),
        pricing_output: num('pricing_output'),
        model_size: num('model_size'),
        tensor_type: val('tensor_type'),
        model_format: val('model_format'),
        num_files: num('num_files'),
        quantization_available: checked('quantization_available'),
        inference_frameworks: checked('inference_frameworks'),

        // 能力
        modalities_input: checked('modalities_input'),
        modalities_output: checked('modalities_output'),
        languages: val('languages').split(',').map(s => s.trim()).filter(Boolean),
        supports_tool_use: document.getElementById('supports_tool_use').checked,
        supports_json_mode: document.getElementById('supports_json_mode').checked,
        supports_vision: document.getElementById('supports_vision').checked,
        coding_capable: document.getElementById('coding_capable').checked,
        supports_reasoning: document.getElementById('supports_reasoning').checked,

        // 链接
        url_paper: val('url_paper'),
        url_huggingface: val('url_huggingface'),
        url_github: val('url_github'),
        url_demo: val('url_demo'),
        url_api_docs: val('url_api_docs'),
        url_blog: val('url_blog'),
        url_website: val('url_website'),
        metadata: parseMetadata(val('metadata')),

        // 评分
        score_arena_elo: num('score_arena_elo'),
        benchmarks: { ...benchmarks },

        // 时间戳
        created_at: editIndex >= 0 ? models[editIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

function populateForm(model) {
    // OpenRouter ID
    setVal('openrouter_id', model.openrouter_id);

    // 类型
    document.querySelector(`input[name="model_type"][value="${model.model_type || 'open'}"]`).checked = true;

    // 基础信息
    setVal('name', model.name);
    setVal('short_name', model.short_name);
    setVal('slug', model.slug);
    setVal('developer', model.developer);
    setVal('family', model.family);
    setVal('model_series', model.model_series);
    setVal('branch_type', model.branch_type);
    setVal('release_date', model.release_date);
    setVal('version', model.version);
    setVal('logo_url', model.logo_url);
    setVal('description', model.description);
    setVal('description_zh', model.description_zh);

    // 技术规格
    setVal('architecture', model.architecture);
    setVal('params_total', model.params_total);
    setVal('params_active', model.params_active);
    setVal('context_window', model.context_window);
    setVal('max_output_tokens', model.max_output_tokens);
    setVal('training_tokens', model.training_tokens);
    setVal('vocab_size', model.vocab_size);
    setVal('knowledge_cutoff', model.knowledge_cutoff);
    setVal('layers', model.layers);
    setVal('attention_mechanism', model.attention_mechanism);
    setChecked('fine_tuning_method', model.fine_tuning_method || []);

    // 商用
    setVal('license', model.license);
    document.getElementById('commercial_use_allowed').checked = !!model.commercial_use_allowed;
    document.getElementById('free_tier_available').checked = !!model.free_tier_available;
    setVal('pricing_input', model.pricing_input);
    setVal('pricing_output', model.pricing_output);
    setVal('model_size', model.model_size);
    setVal('tensor_type', model.tensor_type);
    setVal('model_format', model.model_format);
    setVal('num_files', model.num_files);
    setChecked('quantization_available', model.quantization_available || []);
    setChecked('inference_frameworks', model.inference_frameworks || []);

    // 能力
    setChecked('modalities_input', model.modalities_input || []);
    setChecked('modalities_output', model.modalities_output || []);
    setVal('languages', (model.languages || []).join(', '));
    document.getElementById('supports_tool_use').checked = !!model.supports_tool_use;
    document.getElementById('supports_json_mode').checked = !!model.supports_json_mode;
    document.getElementById('supports_vision').checked = !!model.supports_vision;
    document.getElementById('coding_capable').checked = !!model.coding_capable;
    document.getElementById('supports_reasoning').checked = !!model.supports_reasoning;

    // 链接
    setVal('url_paper', model.url_paper);
    setVal('url_huggingface', model.url_huggingface);
    setVal('url_github', model.url_github);
    setVal('url_demo', model.url_demo);
    setVal('url_api_docs', model.url_api_docs);
    setVal('url_blog', model.url_blog);
    setVal('url_website', model.url_website);

    // 元数据
    const metaText = Object.entries(model.metadata || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
    setVal('metadata', metaText);

    // 评分
    setVal('score_arena_elo', model.score_arena_elo);
    benchmarks = { ...(model.benchmarks || {}) };
    renderBenchmarks();

    // 切回第一个标签
    document.querySelector('.tab').click();
}

function resetForm() {
    editForm.reset();
    benchmarks = {};
    renderBenchmarks();
    document.querySelector('.tab').click();
}

// Benchmark 管理
function addBenchmark() {
    const nameInput = document.getElementById('benchmark-name');
    const scoreInput = document.getElementById('benchmark-score');
    const name = nameInput.value.trim();
    const score = parseFloat(scoreInput.value);

    if (!name || isNaN(score)) {
        toast('请输入有效的名称和分数');
        return;
    }

    benchmarks[name] = score;
    nameInput.value = '';
    scoreInput.value = '';
    nameInput.focus();
    renderBenchmarks();
}

function renderBenchmarks() {
    const list = document.getElementById('benchmark-list');
    const entries = Object.entries(benchmarks);

    if (entries.length === 0) {
        list.innerHTML = '<div style="color: #999; font-size: 12px;">暂无评分数据</div>';
        return;
    }

    list.innerHTML = entries.map(([name, score]) => `
        <div class="benchmark-item">
            <span class="name">${esc(name)}</span>
            <span class="score">${score}</span>
            <button type="button" class="remove" onclick="removeBenchmark('${esc(name)}')">&times;</button>
        </div>
    `).join('');
}

window.removeBenchmark = function(name) {
    delete benchmarks[name];
    renderBenchmarks();
};

// 面板控制
function openPanel() {
    editPanel.classList.add('open');
}

function closePanel() {
    editPanel.classList.remove('open');
    editIndex = -1;
    renderTable();
}

// 导入导出
function exportData() {
    if (models.length === 0) {
        toast('没有数据可导出');
        return;
}
    const jsonl = models.map(m => JSON.stringify(m)).join('\n');
    const blob = new Blob([jsonl], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llm_database_${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
    toast('导出成功');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target.result.trim();
            let imported = [];

            if (content.startsWith('[')) {
                imported = JSON.parse(content);
    } else {
                imported = content.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
            }

            models = [...models, ...imported];
            await saveModels();
            renderTable();
            updateDeveloperFilter();
            toast(`导入 ${imported.length} 条记录`);
        } catch (err) {
            toast('导入失败: 格式错误');
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// 工具函数
function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function num(id) {
    const v = val(id);
    return v ? parseFloat(v) : null;
}

function checked(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function setChecked(name, values) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(el => {
        el.checked = (values || []).includes(el.value);
    });
}

function parseMetadata(text) {
    const meta = {};
    if (!text) return meta;
    text.split('\n').forEach(line => {
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
            let value = match[2].trim();
            if (!isNaN(value) && value !== '') value = parseFloat(value);
            meta[match[1].trim()] = value;
        }
    });
    return meta;
    }

function generateSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '');
}

function esc(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

// 列宽调整
function setupColumnResizers() {
    const table = document.getElementById('data-table');
    const headers = table.querySelectorAll('th');

    headers.forEach(th => {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        th.appendChild(resizer);
        
        let startX, startWidth;
        
        resizer.addEventListener('mousedown', e => {
            startX = e.pageX;
            startWidth = th.offsetWidth;
            resizer.classList.add('resizing');
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
    });

        function onMouseMove(e) {
            const diff = e.pageX - startX;
            th.style.width = Math.max(50, startWidth + diff) + 'px';
            th.style.minWidth = th.style.width;
        }
        
        function onMouseUp() {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });
}

// 面板宽度调整
function setupPanelResizer() {
    const panel = document.getElementById('edit-panel');
    const resizer = document.getElementById('panel-resizer');
    
    let startX, startWidth;
    
    resizer.addEventListener('mousedown', e => {
        startX = e.pageX;
        startWidth = panel.offsetWidth;
        resizer.classList.add('resizing');
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });
    
    function onMouseMove(e) {
        const diff = startX - e.pageX;
        const newWidth = Math.min(800, Math.max(350, startWidth + diff));
        panel.style.width = newWidth + 'px';
    }
    
    function onMouseUp() {
        resizer.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// OpenRouter API 调用
async function fetchFromOpenRouter() {
    const openrouterId = val('openrouter_id');
    if (!openrouterId) {
        toast('请先输入 OpenRouter ID');
        return;
    }

    const btn = document.getElementById('fetch-openrouter');
    const originalText = btn.textContent;
    btn.textContent = '获取中...';
    btn.disabled = true;

    try {
        // 调用 OpenRouter API 获取所有模型列表
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error('API 请求失败');
        
        const data = await res.json();
        const model = data.data.find(m => m.id === openrouterId);
        
        if (!model) {
            toast(`未找到模型: ${openrouterId}`);
            return;
        }

        // 自动填充字段
        fillFromOpenRouterData(model);
        toast('已从 OpenRouter 获取数据');
    } catch (err) {
        console.error('OpenRouter API error:', err);
        toast('获取失败: ' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// 从 OpenRouter 数据填充表单
function fillFromOpenRouterData(orModel) {
    // 解析 ID 获取开发者信息 (格式: developer/model-name)
    const idParts = orModel.id.split('/');
    const developerSlug = idParts[0] || '';
    
    // 开发者名称映射
    const developerMap = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google',
        'meta-llama': 'Meta',
        'meta': 'Meta',
        'mistralai': 'Mistral AI',
        'cohere': 'Cohere',
        'deepseek': 'DeepSeek',
        'alibaba': 'Alibaba',
        'qwen': 'Alibaba',
        'x-ai': 'xAI',
        'microsoft': 'Microsoft',
        'nvidia': 'NVIDIA',
        'amazon': 'Amazon',
        'ai21': 'AI21 Labs',
        '01-ai': '01.AI',
        'perplexity': 'Perplexity',
        'zhipuai': 'Zhipu AI',
        'thudm': 'Tsinghua',
        'databricks': 'Databricks',
        'nousresearch': 'Nous Research'
    };
    
    // family 映射 (从 tokenizer)
    const familyMap = {
        'GPT': 'GPT',
        'Claude': 'Claude',
        'Gemini': 'Gemini',
        'Llama2': 'Llama',
        'Llama3': 'Llama',
        'Llama4': 'Llama',
        'Mistral': 'Mistral',
        'Qwen': 'Qwen',
        'Qwen3': 'Qwen',
        'DeepSeek': 'DeepSeek',
        'Cohere': 'Command',
        'Yi': 'Yi',
        'Nova': 'Nova',
        'Grok': 'Grok',
        'PaLM': 'PaLM'
    };

    // 填充名称
    if (orModel.name && !val('name')) {
        setVal('name', orModel.name);
        // 自动生成 slug
        setVal('slug', generateSlug(orModel.name));
    }

    // 填充描述
    if (orModel.description && !val('description')) {
        setVal('description', orModel.description);
    }

    // 填充开发者
    if (!val('developer')) {
        const dev = developerMap[developerSlug.toLowerCase()] || capitalizeFirst(developerSlug);
        setVal('developer', dev);
    }

    // 填充 family
    if (!val('family') && orModel.architecture?.tokenizer) {
        const family = familyMap[orModel.architecture.tokenizer] || orModel.architecture.tokenizer;
        setVal('family', family);
    }

    // 填充发布日期 (从 OpenRouter created 时间戳)
    if (!val('release_date') && orModel.created) {
        const date = new Date(orModel.created * 1000); // Unix 时间戳转毫秒
        const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD 格式
        setVal('release_date', dateStr);
    }

    // 填充上下文窗口
    const contextLen = orModel.top_provider?.context_length || orModel.context_length;
    if (contextLen && !val('context_window')) {
        setVal('context_window', contextLen);
    }

    // 填充最大输出
    if (orModel.top_provider?.max_completion_tokens && !val('max_output_tokens')) {
        setVal('max_output_tokens', orModel.top_provider.max_completion_tokens);
    }

    // 填充价格 (OpenRouter 是 per token，转为 $/1M tokens)
    if (orModel.pricing) {
        const promptPrice = parseFloat(orModel.pricing.prompt);
        const completionPrice = parseFloat(orModel.pricing.completion);

        if (!isNaN(promptPrice) && promptPrice > 0 && !val('pricing_input')) {
            setVal('pricing_input', (promptPrice * 1000000).toFixed(2));
        }
        if (!isNaN(completionPrice) && completionPrice > 0 && !val('pricing_output')) {
            setVal('pricing_output', (completionPrice * 1000000).toFixed(2));
        }
    }

    // 填充输入模态
    if (orModel.architecture?.input_modalities) {
        const modalityMap = { 'text': 'Text', 'image': 'Image', 'audio': 'Audio', 'video': 'Video', 'file': 'PDF' };
        const modalities = orModel.architecture.input_modalities.map(m => modalityMap[m] || m).filter(Boolean);
        if (modalities.length > 0) {
            setChecked('modalities_input', modalities);
    }
    }

    // 填充输出模态
    if (orModel.architecture?.output_modalities) {
        const modalityMap = { 'text': 'Text', 'image': 'Image', 'audio': 'Audio', 'video': 'Video' };
        const modalities = orModel.architecture.output_modalities.map(m => modalityMap[m] || m).filter(Boolean);
        if (modalities.length > 0) {
            setChecked('modalities_output', modalities);
    }
    }

    // 填充能力标签 (根据 supported_parameters)
    if (orModel.supported_parameters) {
        const params = orModel.supported_parameters;
        
        // 工具调用
        if (params.includes('tools') || params.includes('tool_choice')) {
            document.getElementById('supports_tool_use').checked = true;
}

        // JSON Mode
        if (params.includes('response_format') || params.includes('structured_outputs')) {
            document.getElementById('supports_json_mode').checked = true;
        }
        
        // 推理能力
        if (params.includes('reasoning') || params.includes('include_reasoning') || params.includes('reasoning_effort')) {
            document.getElementById('supports_reasoning').checked = true;
        }
    }

    // 视觉能力 (根据输入模态)
    if (orModel.architecture?.input_modalities?.includes('image')) {
        document.getElementById('supports_vision').checked = true;
    }

    // 填充 HuggingFace URL
    if (orModel.hugging_face_id && !val('url_huggingface')) {
        setVal('url_huggingface', `https://huggingface.co/${orModel.hugging_face_id}`);
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 翻译描述
async function translateDescription() {
    const description = val('description');
    if (!description) {
        toast('请先填写英文描述');
        return;
    }

    const btn = document.getElementById('translate-btn');
    const model = document.getElementById('translate-model').value;
    const originalText = btn.textContent;
    btn.textContent = '翻译中...';
    btn.disabled = true;

        try {
        const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: description, model })
        });

        const data = await res.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        setVal('description_zh', data.translation);
        toast('翻译完成');
        } catch (err) {
        console.error('Translation error:', err);
        toast('翻译失败: ' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
}
}

// Benchmark 下拉建议
function setupBenchmarkSuggestions() {
    const input = document.getElementById('benchmark-name');
    const suggestions = document.getElementById('benchmark-suggestions');
    let selectedIndex = -1;
    
    // 输入时显示建议
    input.addEventListener('input', () => {
        const value = input.value.toLowerCase().trim();
        showSuggestions(value);
    });

    // 聚焦时显示全部
    input.addEventListener('focus', () => {
        showSuggestions(input.value.toLowerCase().trim());
    });
    
    // 失焦时隐藏
    input.addEventListener('blur', () => {
        setTimeout(() => suggestions.classList.remove('show'), 150);
    });
    
    // 键盘导航
    input.addEventListener('keydown', e => {
        const items = suggestions.querySelectorAll('.benchmark-suggestion-item');
        if (!items.length) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].textContent;
            suggestions.classList.remove('show');
            document.getElementById('benchmark-score').focus();
        } else if (e.key === 'Escape') {
            suggestions.classList.remove('show');
}
    });
    
    function showSuggestions(filter) {
        const filtered = knownBenchmarks.filter(name => 
            !filter || name.toLowerCase().includes(filter)
        );
        
        if (filtered.length === 0) {
            suggestions.classList.remove('show');
            return;
        }
        
        selectedIndex = -1;
        suggestions.innerHTML = filtered.map(name => 
            `<div class="benchmark-suggestion-item">${esc(name)}</div>`
        ).join('');
        suggestions.classList.add('show');
        
        // 点击选择
        suggestions.querySelectorAll('.benchmark-suggestion-item').forEach(item => {
            item.addEventListener('mousedown', e => {
                e.preventDefault();
                input.value = item.textContent;
                suggestions.classList.remove('show');
                document.getElementById('benchmark-score').focus();
            });
        });
    }
    
    function updateSelection(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
        if (selectedIndex >= 0) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }
}
