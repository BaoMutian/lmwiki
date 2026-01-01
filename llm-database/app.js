// LLM Database Manager
const STORAGE_KEY = 'llm_database';
const BENCHMARK_KEY = 'llm_benchmarks';
const API_BASE = '/api';
const USE_SERVER = location.protocol !== 'file:';

// State
let models = [];
let editIndex = -1;
let deleteIndex = -1;
let isOpenSource = true;
let currentBenchmarks = {}; // Current form benchmarks
let knownBenchmarks = []; // All known benchmark names

// DOM Elements
const listView = document.getElementById('list-view');
const formView = document.getElementById('form-view');
const modelList = document.getElementById('model-list');
const llmForm = document.getElementById('llm-form');
const searchInput = document.getElementById('search-input');
const filterArchitecture = document.getElementById('filter-architecture');
const filterOpensource = document.getElementById('filter-opensource');
const totalCount = document.getElementById('total-count');
const detailModal = document.getElementById('detail-modal');
const confirmModal = document.getElementById('confirm-modal');
const detailContent = document.getElementById('detail-content');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadModels();
    loadKnownBenchmarks();
    renderModelList();
    setupEventListeners();
    setupModelTypeToggle();
    setupBenchmarkSelector();
});

// Benchmark Selector
function loadKnownBenchmarks() {
    // Load from localStorage
    const stored = localStorage.getItem(BENCHMARK_KEY);
    if (stored) {
        try {
            knownBenchmarks = JSON.parse(stored);
        } catch (e) {
            knownBenchmarks = [];
        }
    }
    // Also collect from existing models
    models.forEach(m => {
        if (m.benchmarks) {
            Object.keys(m.benchmarks).forEach(name => {
                if (!knownBenchmarks.includes(name)) {
                    knownBenchmarks.push(name);
                }
            });
        }
    });
    knownBenchmarks.sort();
    saveKnownBenchmarks();
}

function saveKnownBenchmarks() {
    localStorage.setItem(BENCHMARK_KEY, JSON.stringify(knownBenchmarks));
}

function setupBenchmarkSelector() {
    const select = document.getElementById('benchmark-select');
    const newNameInput = document.getElementById('benchmark-new-name');
    const scoreInput = document.getElementById('benchmark-score');
    const addBtn = document.getElementById('benchmark-add-btn');

    // Populate select with known benchmarks
    updateBenchmarkSelect();

    // Add benchmark on button click
    addBtn.addEventListener('click', () => {
        const name = select.value || newNameInput.value.trim();
        const score = parseFloat(scoreInput.value);

        if (!name) {
            showToast('请选择或输入 Benchmark 名称');
            return;
        }
        if (isNaN(score)) {
            showToast('请输入有效分数');
            return;
        }

        // Add to current benchmarks
        currentBenchmarks[name] = score;

        // Add to known benchmarks if new
        if (!knownBenchmarks.includes(name)) {
            knownBenchmarks.push(name);
            knownBenchmarks.sort();
            saveKnownBenchmarks();
            updateBenchmarkSelect();
        }

        // Clear inputs
        select.value = '';
        newNameInput.value = '';
        scoreInput.value = '';

        // Update display
        renderBenchmarkList();
    });

    // Clear new name when selecting from dropdown
    select.addEventListener('change', () => {
        if (select.value) {
            newNameInput.value = '';
        }
    });
}

function updateBenchmarkSelect() {
    const select = document.getElementById('benchmark-select');
    select.innerHTML = '<option value="">选择已有 Benchmark...</option>';
    knownBenchmarks.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function renderBenchmarkList() {
    const container = document.getElementById('benchmark-list');
    if (Object.keys(currentBenchmarks).length === 0) {
        container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">暂无 Benchmark 数据</span>';
        return;
    }

    container.innerHTML = Object.entries(currentBenchmarks).map(([name, score]) => `
        <div class="benchmark-item">
            <span class="name">${escapeHtml(name)}:</span>
            <span class="score">${score}</span>
            <button type="button" class="remove-btn" data-name="${escapeHtml(name)}">×</button>
        </div>
    `).join('');

    // Bind remove buttons
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            delete currentBenchmarks[name];
            renderBenchmarkList();
        });
    });
}

// Model Type Toggle
function setupModelTypeToggle() {
    const typeOpen = document.getElementById('type_open');
    const typeClosed = document.getElementById('type_closed');

    const updateFormVisibility = () => {
        isOpenSource = typeOpen.checked;
        document.querySelectorAll('.open-only').forEach(el => {
            el.style.display = isOpenSource ? '' : 'none';
        });
        document.querySelectorAll('.closed-only').forEach(el => {
            el.style.display = isOpenSource ? 'none' : '';
        });
    };

    typeOpen.addEventListener('change', updateFormVisibility);
    typeClosed.addEventListener('change', updateFormVisibility);
    updateFormVisibility();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            listView.classList.toggle('active', view === 'list');
            formView.classList.toggle('active', view === 'form');
            if (view === 'form' && editIndex === -1) {
                resetForm();
            }
        });
    });

    llmForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('reset-btn').addEventListener('click', resetForm);

    searchInput.addEventListener('input', renderModelList);
    filterArchitecture.addEventListener('change', renderModelList);
    filterOpensource.addEventListener('change', renderModelList);

    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);

    document.querySelector('.close-btn').addEventListener('click', () => {
        detailModal.classList.remove('active');
    });
    document.getElementById('cancel-delete').addEventListener('click', () => {
        confirmModal.classList.remove('active');
    });
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);

    window.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.remove('active');
        if (e.target === confirmModal) confirmModal.classList.remove('active');
    });

    document.getElementById('name').addEventListener('input', (e) => {
        const slugField = document.getElementById('slug');
        if (!slugField.value || editIndex === -1) {
            slugField.value = generateSlug(e.target.value);
        }
    });
}

// Data Management
async function loadModels() {
    if (USE_SERVER) {
        try {
            const res = await fetch(`${API_BASE}/models`);
            models = await res.json();
        } catch (e) {
            console.warn('Server not available, using localStorage');
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            models = JSON.parse(stored);
        } catch (e) {
            models = [];
        }
    }
}

async function saveModels() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
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

function generateSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Form Handling
async function handleFormSubmit(e) {
    e.preventDefault();
    const model = collectFormData();

    if (editIndex >= 0) {
        models[editIndex] = model;
        showToast('模型已更新');
    } else {
        models.push(model);
        showToast('模型已添加');
    }

    await saveModels();
    resetForm();
    renderModelList();
    switchToListView();
}

function collectFormData() {
    const isOpen = document.getElementById('type_open').checked;

    const data = {
        // Model type
        model_type: isOpen ? 'open' : 'closed',

        // Identity
        name: getValue('name'),
        short_name: getValue('short_name'),
        slug: getValue('slug'),
        developer: getValue('developer'),
        release_date: getValue('release_date'),
        version: getValue('version'),
        family: getValue('family'),
        model_series: getValue('model_series'),
        branch_type: getValue('branch_type'),
        description: getValue('description'),
        logo_url: getValue('logo_url'),

        // Capabilities (common)
        modalities_input: getCheckedValues('modalities_input'),
        modalities_output: getCheckedValues('modalities_output'),
        languages: getValue('languages').split(',').map(s => s.trim()).filter(Boolean),
        supports_tool_use: getChecked('supports_tool_use'),
        supports_json_mode: getChecked('supports_json_mode'),
        supports_vision: getChecked('supports_vision'),
        coding_capable: getChecked('coding_capable'),
        supports_reasoning: getChecked('supports_reasoning'),

        // Benchmarks
        score_arena_elo: getNumberValue('score_arena_elo'),
        benchmarks: { ...currentBenchmarks },

        // Resources
        url_paper: getValue('url_paper'),
        url_huggingface: getValue('url_huggingface'),
        url_demo: getValue('url_demo'),
        url_github: getValue('url_github'),
        url_api_docs: getValue('url_api_docs'),
        url_blog: getValue('url_blog'),
        url_website: getValue('url_website'),

        // Metadata
        metadata: parseMetadata(getValue('metadata')),

        // Meta
        created_at: editIndex >= 0 ? models[editIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (isOpen) {
        // Open source specific fields
        Object.assign(data, {
            // Technical Specs (full)
            architecture: getValue('architecture'),
            params_total: getNumberValue('params_total'),
            params_active: getNumberValue('params_active'),
            context_window: getNumberValue('context_window'),
            max_output_tokens: getNumberValue('max_output_tokens'),
            training_tokens: getNumberValue('training_tokens'),
            vocab_size: getNumberValue('vocab_size'),
            knowledge_cutoff: getValue('knowledge_cutoff'),
            fine_tuning_method: getCheckedValues('fine_tuning_method'),
            layers: getNumberValue('layers'),
            attention_mechanism: getValue('attention_mechanism'),

            // Commercial (full)
            license: getValue('license'),
            commercial_use_allowed: getChecked('commercial_use_allowed'),
            pricing_input: getNumberValue('pricing_input'),
            pricing_output: getNumberValue('pricing_output'),
            free_tier_available: getChecked('free_tier_available'),

            // Deployment
            model_size: getNumberValue('model_size'),
            tensor_type: getValue('tensor_type'),
            model_format: getValue('model_format'),
            num_files: getNumberValue('num_files'),
            quantization_available: getCheckedValues('quantization_available'),
            inference_frameworks: getCheckedValues('inference_frameworks'),
        });
    } else {
        // Closed source specific fields
        Object.assign(data, {
            context_window: getNumberValue('context_window_closed'),
            max_output_tokens: getNumberValue('max_output_tokens_closed'),
            knowledge_cutoff: getValue('knowledge_cutoff_closed'),
            pricing_input: getNumberValue('pricing_input_closed'),
            pricing_output: getNumberValue('pricing_output_closed'),
        });
    }

    return data;
}

function parseMetadata(text) {
    const metadata = {};
    if (!text) return metadata;
    text.split('\n').forEach(line => {
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Try to parse as number
            if (!isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            metadata[key] = value;
        }
    });
    return metadata;
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function getNumberValue(id) {
    const val = getValue(id);
    return val ? parseFloat(val) : null;
}

function getChecked(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(el => el.value);
}

function parseBenchmarks(text) {
    const benchmarks = {};
    if (!text) return benchmarks;
    text.split('\n').forEach(line => {
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
            benchmarks[match[1].trim()] = parseFloat(match[2]) || match[2].trim();
        }
    });
    return benchmarks;
}

function resetForm() {
    llmForm.reset();
    editIndex = -1;
    document.getElementById('edit-index').value = -1;
    document.getElementById('submit-btn').textContent = '💾 保存模型';
    document.getElementById('type_open').checked = true;
    currentBenchmarks = {};
    renderBenchmarkList();
    setupModelTypeToggle();
}

function populateForm(model) {
    // Set model type first
    const isOpen = model.model_type !== 'closed';
    document.getElementById('type_open').checked = isOpen;
    document.getElementById('type_closed').checked = !isOpen;

    // Trigger visibility update
    document.querySelectorAll('.open-only').forEach(el => {
        el.style.display = isOpen ? '' : 'none';
    });
    document.querySelectorAll('.closed-only').forEach(el => {
        el.style.display = isOpen ? 'none' : '';
    });

    // Identity
    setValue('name', model.name);
    setValue('short_name', model.short_name);
    setValue('slug', model.slug);
    setValue('developer', model.developer);
    setValue('release_date', model.release_date);
    setValue('version', model.version);
    setValue('family', model.family);
    setValue('model_series', model.model_series);
    setValue('branch_type', model.branch_type);
    setValue('description', model.description);
    setValue('logo_url', model.logo_url);

    if (isOpen) {
        // Technical (open)
        setValue('architecture', model.architecture);
        setValue('params_total', model.params_total);
        setValue('params_active', model.params_active);
        setValue('context_window', model.context_window);
        setValue('max_output_tokens', model.max_output_tokens);
        setValue('training_tokens', model.training_tokens);
        setValue('vocab_size', model.vocab_size);
        setValue('knowledge_cutoff', model.knowledge_cutoff);
        setCheckedValues('fine_tuning_method', model.fine_tuning_method || []);
        setValue('layers', model.layers);
        setValue('attention_mechanism', model.attention_mechanism);

        // Commercial (open)
        setValue('license', model.license);
        setChecked('commercial_use_allowed', model.commercial_use_allowed);
        setValue('pricing_input', model.pricing_input);
        setValue('pricing_output', model.pricing_output);
        setChecked('free_tier_available', model.free_tier_available);

        // Deployment
        setValue('model_size', model.model_size);
        setValue('tensor_type', model.tensor_type);
        setValue('model_format', model.model_format);
        setValue('num_files', model.num_files);
        setCheckedValues('quantization_available', model.quantization_available || []);
        setCheckedValues('inference_frameworks', model.inference_frameworks || []);
    } else {
        // Technical (closed)
        setValue('context_window_closed', model.context_window);
        setValue('max_output_tokens_closed', model.max_output_tokens);
        setValue('knowledge_cutoff_closed', model.knowledge_cutoff);
        setValue('pricing_input_closed', model.pricing_input);
        setValue('pricing_output_closed', model.pricing_output);
    }

    // Capabilities
    setCheckedValues('modalities_input', model.modalities_input || []);
    setCheckedValues('modalities_output', model.modalities_output || []);
    setValue('languages', (model.languages || []).join(', '));
    setChecked('supports_tool_use', model.supports_tool_use);
    setChecked('supports_json_mode', model.supports_json_mode);
    setChecked('supports_vision', model.supports_vision);
    setChecked('coding_capable', model.coding_capable);
    setChecked('supports_reasoning', model.supports_reasoning);

    // Benchmarks
    setValue('score_arena_elo', model.score_arena_elo);
    currentBenchmarks = { ...(model.benchmarks || {}) };
    renderBenchmarkList();

    // Resources
    setValue('url_paper', model.url_paper);
    setValue('url_huggingface', model.url_huggingface);
    setValue('url_demo', model.url_demo);
    setValue('url_github', model.url_github);
    setValue('url_api_docs', model.url_api_docs);
    setValue('url_blog', model.url_blog);
    setValue('url_website', model.url_website);

    // Metadata
    const metaText = Object.entries(model.metadata || {})
        .map(([k, v]) => `${k}: ${v}`).join('\n');
    setValue('metadata', metaText);

    document.getElementById('submit-btn').textContent = '💾 更新模型';
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function setChecked(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = !!value;
}

function setCheckedValues(name, values) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(el => {
        el.checked = values.includes(el.value);
    });
}


// Rendering
function renderModelList() {
    const filtered = getFilteredModels();
    totalCount.textContent = `共 ${filtered.length} 个模型`;

    if (filtered.length === 0) {
        modelList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>暂无模型数据</h3>
                <p>点击"添加/编辑"开始录入 LLM 信息</p>
            </div>
        `;
        return;
    }

    modelList.innerHTML = filtered.map((model) => {
        const realIndex = models.indexOf(model);
        return createModelCard(model, realIndex);
    }).join('');

    modelList.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => showDetail(parseInt(btn.dataset.index)));
    });
    modelList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editModel(parseInt(btn.dataset.index)));
    });
    modelList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => showDeleteConfirm(parseInt(btn.dataset.index)));
    });
}

function getFilteredModels() {
    const search = searchInput.value.toLowerCase();
    const arch = filterArchitecture.value;
    const opensource = filterOpensource.value;

    return models.filter(m => {
        const matchSearch = !search ||
            (m.name || '').toLowerCase().includes(search) ||
            (m.developer || '').toLowerCase().includes(search) ||
            (m.family || '').toLowerCase().includes(search) ||
            (m.short_name || '').toLowerCase().includes(search);
        const matchArch = !arch || m.architecture === arch;
        const isOpen = m.model_type !== 'closed' && (m.is_open_source || m.is_open_weights);
        const matchOS = !opensource || String(isOpen) === opensource;
        return matchSearch && matchArch && matchOS;
    });
}

function createModelCard(model, index) {
    const logoHtml = model.logo_url
        ? `<img src="${escapeHtml(model.logo_url)}" class="model-card-logo" alt="logo" onerror="this.style.display='none'">`
        : '';
    const isOpen = model.model_type !== 'closed';

    return `
        <div class="model-card">
            <div class="model-card-header">
                <div>
                    <h3>${escapeHtml(model.name || 'Unnamed')}</h3>
                    <div class="developer">${escapeHtml(model.developer || 'Unknown')}</div>
                </div>
                ${logoHtml}
            </div>
            <div class="model-card-tags">
                ${model.architecture ? `<span class="tag tag-arch">${escapeHtml(model.architecture)}</span>` : ''}
                ${model.params_total ? `<span class="tag tag-params">${model.params_total}B</span>` : ''}
                ${model.context_window ? `<span class="tag tag-context">${formatNumber(model.context_window)} ctx</span>` : ''}
                ${isOpen ? '<span class="tag tag-opensource">开源</span>' : '<span class="tag tag-closed">闭源</span>'}
            </div>
            <div class="model-card-stats">
                ${model.score_arena_elo ? `<div class="stat"><span class="stat-label">Arena Elo</span><span class="stat-value">${model.score_arena_elo}</span></div>` : ''}
                ${model.release_date ? `<div class="stat"><span class="stat-label">发布日期</span><span class="stat-value">${model.release_date}</span></div>` : ''}
                ${model.pricing_input ? `<div class="stat"><span class="stat-label">输入价格</span><span class="stat-value">$${model.pricing_input}/1M</span></div>` : ''}
                ${model.family ? `<div class="stat"><span class="stat-label">家族</span><span class="stat-value">${escapeHtml(model.family)}</span></div>` : ''}
            </div>
            <div class="model-card-actions">
                <button class="btn-view" data-index="${index}">👁️ 详情</button>
                <button class="btn-edit" data-index="${index}">✏️ 编辑</button>
                <button class="btn-delete" data-index="${index}">🗑️ 删除</button>
            </div>
        </div>
    `;
}

function showDetail(index) {
    const model = models[index];
    if (!model) return;
    detailContent.innerHTML = generateDetailHTML(model);
    detailModal.classList.add('active');
}

function generateDetailHTML(model) {
    const isOpen = model.model_type !== 'closed';

    let html = `
        <h2 style="margin-bottom: 20px; color: var(--primary);">${escapeHtml(model.name || 'Unnamed')}</h2>
        ${model.description ? `<p style="margin-bottom: 20px; color: var(--text-muted);">${escapeHtml(model.description)}</p>` : ''}
        
        <div class="detail-section">
            <h4>📝 基础信息</h4>
            <div class="detail-grid">
                ${detailItem('简短名称', model.short_name)}
                ${detailItem('开发机构', model.developer)}
                ${detailItem('版本', model.version)}
                ${detailItem('家族', model.family)}
                ${detailItem('系列', model.model_series)}
                ${detailItem('分支类型', model.branch_type)}
                ${detailItem('发布日期', model.release_date)}
                ${detailItem('模型类型', isOpen ? '🔓 开源' : '🔒 闭源')}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>⚙️ 技术规格</h4>
            <div class="detail-grid">
                ${isOpen ? detailItem('架构', model.architecture) : ''}
                ${isOpen ? detailItem('总参数量', model.params_total ? model.params_total + 'B' : null) : ''}
                ${isOpen ? detailItem('激活参数量', model.params_active ? model.params_active + 'B' : null) : ''}
                ${detailItem('上下文窗口', model.context_window ? formatNumber(model.context_window) : null)}
                ${detailItem('最大输出', model.max_output_tokens ? formatNumber(model.max_output_tokens) : null)}
                ${isOpen ? detailItem('训练数据量', model.training_tokens ? model.training_tokens + 'T tokens' : null) : ''}
                ${isOpen ? detailItem('词表大小', model.vocab_size ? formatNumber(model.vocab_size) : null) : ''}
                ${isOpen ? detailItem('网络层数', model.layers) : ''}
                ${isOpen ? detailItem('注意力机制', model.attention_mechanism) : ''}
                ${detailItem('知识截止', model.knowledge_cutoff)}
                ${isOpen ? detailTags('微调方式', model.fine_tuning_method) : ''}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>💼 商用与授权</h4>
            <div class="detail-grid">
                ${isOpen ? detailItem('许可协议', model.license) : ''}
                ${isOpen ? detailItem('允许商用', model.commercial_use_allowed ? '✅ 是' : '❌ 否') : ''}
                ${detailItem('输入价格', model.pricing_input ? '$' + model.pricing_input + '/1M tokens' : null)}
                ${detailItem('输出价格', model.pricing_output ? '$' + model.pricing_output + '/1M tokens' : null)}
                ${isOpen ? detailItem('免费层级', model.free_tier_available ? '✅ 有' : '❌ 无') : ''}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>🎯 能力与模态</h4>
            <div class="detail-grid">
                ${detailTags('输入模态', model.modalities_input)}
                ${detailTags('输出模态', model.modalities_output)}
                ${detailTags('支持语言', model.languages)}
                ${detailItem('工具调用', model.supports_tool_use ? '✅ 支持' : '❌ 不支持')}
                ${detailItem('JSON Mode', model.supports_json_mode ? '✅ 支持' : '❌ 不支持')}
                ${detailItem('视觉能力', model.supports_vision ? '✅ 支持' : '❌ 不支持')}
                ${detailItem('代码能力', model.coding_capable ? '✅ 突出' : '❌ 一般')}
                ${detailItem('思考/推理', model.supports_reasoning ? '✅ 支持' : '❌ 不支持')}
            </div>
        </div>`;

    if (isOpen) {
        html += `
        <div class="detail-section">
            <h4>🖥️ 模型文件与部署</h4>
            <div class="detail-grid">
                ${detailItem('模型大小', model.model_size ? model.model_size + ' GB' : null)}
                ${detailItem('Tensor 类型', model.tensor_type)}
                ${detailItem('模型格式', model.model_format)}
                ${detailItem('文件数量', model.num_files)}
                ${detailTags('量化版本', model.quantization_available)}
                ${detailTags('推理框架', model.inference_frameworks)}
            </div>
        </div>`;
    }

    html += `
        <div class="detail-section">
            <h4>📊 评分</h4>
            <div class="detail-grid">
                ${detailItem('Arena Elo', model.score_arena_elo)}
                ${Object.entries(model.benchmarks || {}).map(([k, v]) => detailItem(k, v)).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>🔗 外部资源</h4>
            <div class="detail-grid">
                ${detailLink('论文', model.url_paper)}
                ${detailLink('Hugging Face', model.url_huggingface)}
                ${detailLink('Demo', model.url_demo)}
                ${detailLink('GitHub', model.url_github)}
                ${detailLink('API 文档', model.url_api_docs)}
                ${detailLink('Blog', model.url_blog)}
                ${detailLink('官网', model.url_website)}
            </div>
        </div>`;

    // Metadata section
    if (model.metadata && Object.keys(model.metadata).length > 0) {
        html += `
        <div class="detail-section">
            <h4>📦 自定义元数据</h4>
            <div class="detail-grid">
                ${Object.entries(model.metadata).map(([k, v]) => detailItem(k, v)).join('')}
            </div>
        </div>`;
    }

    return html;
}

function detailItem(label, value) {
    if (value === null || value === undefined || value === '') return '';
    return `
        <div class="detail-item">
            <span class="label">${escapeHtml(label)}</span>
            <span class="value">${escapeHtml(String(value))}</span>
        </div>
    `;
}

function detailTags(label, values) {
    if (!values || values.length === 0) return '';
    return `
        <div class="detail-item" style="grid-column: span 2;">
            <span class="label">${escapeHtml(label)}</span>
            <div class="detail-tags">
                ${values.map(v => `<span class="tag">${escapeHtml(v)}</span>`).join('')}
            </div>
        </div>
    `;
}

function detailLink(label, url) {
    if (!url) return '';
    return `
        <div class="detail-item">
            <span class="label">${escapeHtml(label)}</span>
            <span class="value"><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></span>
        </div>
    `;
}

// Actions
function editModel(index) {
    editIndex = index;
    document.getElementById('edit-index').value = index;
    populateForm(models[index]);
    switchToFormView();
}

function showDeleteConfirm(index) {
    deleteIndex = index;
    confirmModal.classList.add('active');
}

async function confirmDelete() {
    if (deleteIndex >= 0) {
        models.splice(deleteIndex, 1);
        await saveModels();
        renderModelList();
        showToast('模型已删除');
    }
    deleteIndex = -1;
    confirmModal.classList.remove('active');
}

function switchToListView() {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="list"]').classList.add('active');
    listView.classList.add('active');
    formView.classList.remove('active');
}

function switchToFormView() {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="form"]').classList.add('active');
    formView.classList.add('active');
    listView.classList.remove('active');
}

// Export/Import
function exportData() {
    if (models.length === 0) {
        showToast('没有数据可导出');
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
    showToast('数据已导出');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target.result.trim();
            let imported = [];

            // 尝试解析为 JSON 数组
            if (content.startsWith('[')) {
                imported = JSON.parse(content);
            } else {
                // 按 JSONL 格式解析
                const lines = content.split('\n').filter(l => l.trim());
                imported = lines.map(line => JSON.parse(line));
            }

            // 更新已知的 benchmarks
            imported.forEach(m => {
                if (m.benchmarks) {
                    Object.keys(m.benchmarks).forEach(name => {
                        if (!knownBenchmarks.includes(name)) {
                            knownBenchmarks.push(name);
                        }
                    });
                }
            });
            knownBenchmarks.sort();
            saveKnownBenchmarks();
            updateBenchmarkSelect();

            models = [...models, ...imported];
            await saveModels();
            renderModelList();
            showToast(`成功导入 ${imported.length} 个模型`);
        } catch (err) {
            console.error('Import error:', err);
            showToast('导入失败: 文件格式错误');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// Utilities
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (!num) return '';
    return num.toLocaleString();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 2000;
        animation: fadeIn 0.3s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
