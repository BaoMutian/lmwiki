// Benchmark 管理界面
const API_BASE = '/api';
const USE_SERVER = location.protocol !== 'file:';

// 状态
let models = [];
let benchmarkNames = []; // 所有 benchmark 名称
let visibleBenchmarks = new Set(); // 可见的 benchmark 列
let currentEditCell = null;
let sortConfig = { column: null, direction: 'desc' }; // 排序配置

// CSV 导入相关状态
let csvData = null;
let csvBenchmarkName = '';
let importMode = ''; // 'modify' 或 'add'
let matchingResults = []; // 匹配结果

// DOM 元素
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search');
const filterDeveloper = document.getElementById('filter-developer');
const countEl = document.getElementById('count');
const importModal = document.getElementById('import-modal');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadModels();
    collectBenchmarkNames();
    renderTable();
    updateDeveloperFilter();
    setupEventListeners();
});

// 事件监听
function setupEventListeners() {
    // 搜索和筛选
    searchInput.addEventListener('input', renderTable);
    filterDeveloper.addEventListener('change', renderTable);

    // 列选择器
    document.getElementById('column-selector-btn').addEventListener('click', toggleColumnSelector);
    document.addEventListener('click', (e) => {
        const selector = document.getElementById('column-selector');
        const btn = document.getElementById('column-selector-btn');
        if (!selector.contains(e.target) && e.target !== btn) {
            selector.classList.remove('show');
        }
    });

    // CSV 导入
    document.getElementById('import-csv-btn').addEventListener('click', () => {
        document.getElementById('csv-file-input').click();
    });
    document.getElementById('csv-file-input').addEventListener('change', handleCSVSelect);

    // 导出
    document.getElementById('export-btn').addEventListener('click', exportBenchmarks);

    // 模态框
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-import').addEventListener('click', closeModal);
    document.getElementById('confirm-import').addEventListener('click', confirmImport);

    // 点击模态框外部关闭
    importModal.addEventListener('click', (e) => {
        if (e.target === importModal) closeModal();
    });

    // ESC 键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (currentEditCell) {
                cancelEdit();
            } else if (importModal.classList.contains('show')) {
                closeModal();
            }
            document.getElementById('column-selector').classList.remove('show');
        }
    });
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

// 收集所有 benchmark 名称
function collectBenchmarkNames() {
    const allNames = new Set();
    models.forEach(m => {
        if (m.benchmarks) {
            Object.keys(m.benchmarks).forEach(name => allNames.add(name));
        }
    });
    benchmarkNames = [...allNames].sort();
    
    // 初始化可见列（默认显示前10个或全部）
    if (visibleBenchmarks.size === 0) {
        const defaultVisible = benchmarkNames.slice(0, 10);
        visibleBenchmarks = new Set(defaultVisible);
    }
    
    // 渲染列选择器
    renderColumnSelector();
}

// 更新开发者筛选器
function updateDeveloperFilter() {
    const developers = [...new Set(models.map(m => m.developer).filter(Boolean))].sort();
    filterDeveloper.innerHTML = '<option value="">全部开发者</option>' +
        developers.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
}

// 获取筛选后的模型
function getFilteredModels() {
    const search = searchInput.value.toLowerCase();
    const developer = filterDeveloper.value;

    return models.filter(m => {
        const matchSearch = !search ||
            (m.name || '').toLowerCase().includes(search) ||
            (m.short_name || '').toLowerCase().includes(search);
        const matchDev = !developer || m.developer === developer;
        return matchSearch && matchDev;
    });
}

// 获取可见的 benchmark 列（按顺序）
function getVisibleBenchmarks() {
    return benchmarkNames.filter(bn => visibleBenchmarks.has(bn));
}

// 渲染表格
function renderTable() {
    let filtered = getFilteredModels();
    const visible = getVisibleBenchmarks();
    
    // 排序
    if (sortConfig.column) {
        filtered = [...filtered].sort((a, b) => {
            const aVal = a.benchmarks?.[sortConfig.column];
            const bVal = b.benchmarks?.[sortConfig.column];
            
            // 空值排最后
            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;
            
            const diff = aVal - bVal;
            return sortConfig.direction === 'asc' ? diff : -diff;
        });
    }
    
    countEl.textContent = `${filtered.length} 条记录`;

    // 渲染表头
    renderTableHead();

    // 渲染表体
    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${visible.length + 1}" class="empty-state">
                    <h3>暂无数据</h3>
                    <p>没有匹配的模型</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map((model, i) => {
        const realIndex = models.indexOf(model);
        const cells = visible.map(bn => {
            const score = model.benchmarks?.[bn];
            const hasScore = score !== undefined && score !== null && score !== '';
            return `
                <td class="editable-cell" 
                    data-model-index="${realIndex}" 
                    data-benchmark="${esc(bn)}"
                    ondblclick="startEdit(this)">
                    ${hasScore ? score : '<span class="cell-empty">-</span>'}
                </td>
            `;
        }).join('');

        return `
            <tr data-index="${realIndex}">
                <td class="sticky-col">${esc(model.name || '-')}</td>
                ${cells}
            </tr>
        `;
    }).join('');
}

// 渲染表头
function renderTableHead() {
    const headerRow = tableHead.querySelector('tr');
    const visible = getVisibleBenchmarks();
    
    // 保留第一列（模型名称）
    const firstTh = headerRow.querySelector('th');
    headerRow.innerHTML = '';
    headerRow.appendChild(firstTh);

    // 添加 benchmark 列
    visible.forEach(bn => {
        const th = document.createElement('th');
        th.className = 'benchmark-header sortable';
        th.dataset.benchmark = bn;
        
        // 排序指示器
        let sortIndicator = '';
        if (sortConfig.column === bn) {
            sortIndicator = sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
        }
        
        th.innerHTML = `${esc(bn)}<span class="sort-indicator">${sortIndicator}</span>`;
        th.title = `点击按 ${bn} 排序`;
        th.onclick = () => toggleSort(bn);
        headerRow.appendChild(th);
    });
}

// 切换排序
function toggleSort(benchmarkName) {
    if (sortConfig.column === benchmarkName) {
        // 切换方向或清除排序
        if (sortConfig.direction === 'desc') {
            sortConfig.direction = 'asc';
        } else {
            sortConfig.column = null;
            sortConfig.direction = 'desc';
        }
    } else {
        sortConfig.column = benchmarkName;
        sortConfig.direction = 'desc';
    }
    renderTable();
}

// ==================== 列选择器 ====================

function toggleColumnSelector() {
    const selector = document.getElementById('column-selector');
    selector.classList.toggle('show');
}

function renderColumnSelector() {
    const list = document.getElementById('column-list');
    if (!list) return;
    
    list.innerHTML = benchmarkNames.map(bn => {
        const checked = visibleBenchmarks.has(bn) ? 'checked' : '';
        return `
            <label class="column-item">
                <input type="checkbox" ${checked} onchange="toggleColumn('${esc(bn)}', this.checked)" />
                <span>${esc(bn)}</span>
            </label>
        `;
    }).join('');
}

window.toggleColumn = function(benchmarkName, visible) {
    if (visible) {
        visibleBenchmarks.add(benchmarkName);
    } else {
        visibleBenchmarks.delete(benchmarkName);
        // 如果排序列被隐藏，清除排序
        if (sortConfig.column === benchmarkName) {
            sortConfig.column = null;
        }
    }
    renderTable();
};

window.selectAllColumns = function() {
    visibleBenchmarks = new Set(benchmarkNames);
    renderColumnSelector();
    renderTable();
};

window.selectNoColumns = function() {
    visibleBenchmarks.clear();
    sortConfig.column = null;
    renderColumnSelector();
    renderTable();
};

// ==================== 单元格编辑 ====================

window.startEdit = function(cell) {
    if (currentEditCell) {
        cancelEdit();
    }

    currentEditCell = cell;
    const currentValue = cell.textContent.trim();
    const displayValue = currentValue === '-' ? '' : currentValue;

    cell.classList.add('editing');
    cell.innerHTML = `<input type="number" step="0.1" value="${displayValue}" />`;

    const input = cell.querySelector('input');
    input.focus();
    input.select();

    input.addEventListener('keydown', handleEditKeydown);
    input.addEventListener('blur', () => saveEdit(cell));
};

function handleEditKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit(currentEditCell);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
    }
}

async function saveEdit(cell) {
    if (!cell || !cell.classList.contains('editing')) return;

    const input = cell.querySelector('input');
    if (!input) return;

    const modelIndex = parseInt(cell.dataset.modelIndex);
    const benchmarkName = cell.dataset.benchmark;
    const newValue = input.value.trim();

    // 更新数据
    const model = models[modelIndex];
    if (!model.benchmarks) model.benchmarks = {};

    if (newValue === '') {
        delete model.benchmarks[benchmarkName];
    } else {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue)) {
            model.benchmarks[benchmarkName] = numValue;
        }
    }

    model.updated_at = new Date().toISOString();

    // 保存
    await saveModels();

    // 更新显示
    cell.classList.remove('editing');
    const hasScore = model.benchmarks[benchmarkName] !== undefined;
    cell.innerHTML = hasScore ? model.benchmarks[benchmarkName] : '<span class="cell-empty">-</span>';

    currentEditCell = null;
    toast('已保存');
}

function cancelEdit() {
    if (!currentEditCell) return;

    const modelIndex = parseInt(currentEditCell.dataset.modelIndex);
    const benchmarkName = currentEditCell.dataset.benchmark;
    const model = models[modelIndex];
    const score = model.benchmarks?.[benchmarkName];
    const hasScore = score !== undefined && score !== null && score !== '';

    currentEditCell.classList.remove('editing');
    currentEditCell.innerHTML = hasScore ? score : '<span class="cell-empty">-</span>';
    currentEditCell = null;
}

// ==================== CSV 导入 ====================

function handleCSVSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 重置输入
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
        parseCSV(file.name, event.target.result);
    };
    reader.readAsText(file);
}

function parseCSV(filename, content) {
    // 从文件名提取 benchmark 名称
    csvBenchmarkName = filename.replace(/\.csv$/i, '').replace(/_/g, ' ');

    // 解析 CSV
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
        toast('CSV 文件格式错误');
        return;
    }

    // 解析标题行
    const headers = parseCSVLine(lines[0]);
    if (headers.length < 2) {
        toast('CSV 至少需要两列：模型名称和分数');
        return;
    }

    // 解析数据行
    csvData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 2 && values[0].trim()) {
            const modelName = values[0].trim();
            const score = parseFloat(values[1]);
            if (!isNaN(score)) {
                csvData.push({ name: modelName, score });
            }
        }
    }

    if (csvData.length === 0) {
        toast('CSV 中没有有效数据');
        return;
    }

    // 确定导入模式
    const existingBenchmark = benchmarkNames.find(
        bn => bn.toLowerCase() === csvBenchmarkName.toLowerCase()
    );

    if (existingBenchmark) {
        importMode = 'modify';
        csvBenchmarkName = existingBenchmark; // 使用已有的名称
    } else {
        importMode = 'add';
    }

    // 执行模型名称匹配
    matchingResults = performModelMatching(csvData);

    // 显示模态框
    showImportModal(filename);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result.map(s => s.trim().replace(/^"|"$/g, ''));
}

// ==================== 模型名称智能匹配 ====================

function performModelMatching(csvModels) {
    const results = [];

    // 为每个数据库模型找最佳匹配（允许多对一）
    models.forEach((dbModel, dbIndex) => {
        let bestMatch = null;
        let bestScore = 0;
        let bestCsvIndex = -1;

        csvModels.forEach((csvModel, csvIndex) => {
            const similarity = calculateSimilarity(dbModel.name, csvModel.name);
            if (similarity > bestScore && similarity >= 0.5) { // 阈值 0.5
                bestScore = similarity;
                bestMatch = csvModel;
                bestCsvIndex = csvIndex;
            }
        });

        if (bestMatch && bestCsvIndex >= 0) {
            results.push({
                dbIndex,
                dbName: dbModel.name,
                csvName: bestMatch.name,
                csvIndex: bestCsvIndex,
                score: bestMatch.score,
                similarity: bestScore,
                matched: true
            });
        } else {
            results.push({
                dbIndex,
                dbName: dbModel.name,
                csvName: null,
                csvIndex: -1,
                score: null,
                similarity: 0,
                matched: false
            });
        }
    });

    // 按匹配状态和相似度排序（已匹配的在前）
    results.sort((a, b) => {
        if (a.matched !== b.matched) return b.matched - a.matched;
        return b.similarity - a.similarity;
    });

    return results;
}

// 计算字符串相似度（综合多种算法）
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // 归一化处理
    const norm1 = normalizeModelName(str1);
    const norm2 = normalizeModelName(str2);

    // 完全匹配
    if (norm1 === norm2) return 1.0;

    // 计算各种相似度
    const levenshteinSim = 1 - levenshteinDistance(norm1, norm2) / Math.max(norm1.length, norm2.length);
    const containsSim = calculateContainsSimilarity(norm1, norm2);
    const tokenSim = calculateTokenSimilarity(norm1, norm2);

    // 加权组合
    return Math.max(
        levenshteinSim * 0.6 + containsSim * 0.2 + tokenSim * 0.2,
        containsSim,
        tokenSim
    );
}

// 归一化模型名称
function normalizeModelName(name) {
    return name
        .toLowerCase()
        .replace(/[_\-\s]+/g, ' ')          // 统一分隔符
        .replace(/\(.*?\)/g, '')             // 移除括号内容
        .replace(/v(\d)/g, ' $1')            // v1 -> 1
        .replace(/[^\w\s.]/g, '')            // 移除特殊字符
        .replace(/\s+/g, ' ')                // 合并空格
        .trim();
}

// Levenshtein 距离
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,     // 删除
                    dp[i][j - 1] + 1,     // 插入
                    dp[i - 1][j - 1] + 1  // 替换
                );
            }
        }
    }

    return dp[m][n];
}

// 子串包含相似度
function calculateContainsSimilarity(str1, str2) {
    const shorter = str1.length < str2.length ? str1 : str2;
    const longer = str1.length < str2.length ? str2 : str1;

    if (longer.includes(shorter)) {
        return shorter.length / longer.length;
    }

    // 检查主要部分是否包含
    const parts1 = str1.split(' ').filter(p => p.length > 2);
    const parts2 = str2.split(' ').filter(p => p.length > 2);

    let matchedParts = 0;
    parts1.forEach(p1 => {
        if (parts2.some(p2 => p1.includes(p2) || p2.includes(p1))) {
            matchedParts++;
        }
    });

    return matchedParts / Math.max(parts1.length, parts2.length, 1);
}

// Token 相似度（词汇重叠）
function calculateTokenSimilarity(str1, str2) {
    const tokens1 = new Set(str1.split(' ').filter(t => t.length > 1));
    const tokens2 = new Set(str2.split(' ').filter(t => t.length > 1));

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    let intersection = 0;
    tokens1.forEach(t => {
        if (tokens2.has(t)) intersection++;
    });

    return (2 * intersection) / (tokens1.size + tokens2.size);
}

// ==================== 模态框 ====================

function showImportModal(filename) {
    // 更新信息
    document.getElementById('file-name').textContent = filename;
    document.getElementById('benchmark-name').textContent = csvBenchmarkName;
    document.getElementById('csv-count').textContent = csvData.length + ' 条';

    const modeEl = document.getElementById('import-mode');
    if (importMode === 'modify') {
        modeEl.textContent = '修改模式';
        modeEl.className = 'mode-tag mode-modify';
    } else {
        modeEl.textContent = '新增模式';
        modeEl.className = 'mode-tag mode-add';
    }

    // 渲染匹配表格
    renderMatchingTable();

    // 显示模态框
    importModal.classList.add('show');
}

function closeModal() {
    importModal.classList.remove('show');
    csvData = null;
    csvBenchmarkName = '';
    matchingResults = [];
}

function renderMatchingTable() {
    const matchedCount = matchingResults.filter(r => r.matched).length;
    const unmatchedCount = matchingResults.filter(r => !r.matched).length;

    document.getElementById('matched-count').textContent = matchedCount;
    document.getElementById('unmatched-count').textContent = unmatchedCount;

    const tbody = document.getElementById('matching-body');

    // 所有 CSV 模型选项（允许多对一匹配）
    const allCsvOptions = csvData.map((csv, idx) => ({ ...csv, idx }));

    tbody.innerHTML = matchingResults.map((result, idx) => {
        const rowClass = result.matched ? '' : 'unmatched-row';

        // 生成下拉选项（按相似度从高到低排序）
        const sortedOptions = allCsvOptions
            .map(csv => ({
                ...csv,
                similarity: calculateSimilarity(result.dbName, csv.name)
            }))
            .sort((a, b) => b.similarity - a.similarity);
        
        let selectOptions = '<option value="">-- 未匹配 --</option>';
        sortedOptions.forEach(csv => {
            const selected = result.matched && result.csvIndex === csv.idx ? 'selected' : '';
            selectOptions += `<option value="${csv.idx}" ${selected}>${esc(csv.name)} (${(csv.similarity * 100).toFixed(0)}%)</option>`;
        });

        return `
            <tr class="${rowClass}" data-result-idx="${idx}">
                <td>${esc(result.dbName)}</td>
                <td>
                    <select class="match-select" onchange="updateMatch(${idx}, this.value)">
                        ${selectOptions}
                    </select>
                </td>
                <td class="match-score">
                    ${result.matched ? result.score : '-'}
                </td>
                <td>
                    ${result.matched ? `<button class="btn btn-sm btn-danger btn-clear-match" onclick="clearMatch(${idx})">清除</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// 更新匹配关系（允许多对一匹配）
window.updateMatch = function(resultIdx, csvIdxStr) {
    const result = matchingResults[resultIdx];
    const csvIdx = parseInt(csvIdxStr);

    if (isNaN(csvIdx) || csvIdx < 0) {
        // 清除匹配
        result.matched = false;
        result.csvName = null;
        result.csvIndex = -1;
        result.score = null;
        result.similarity = 0;
    } else {
        // 设置新匹配（不再清除其他模型的匹配，允许多对一）
        const csvModel = csvData[csvIdx];
        result.matched = true;
        result.csvName = csvModel.name;
        result.csvIndex = csvIdx;
        result.score = csvModel.score;
        result.similarity = calculateSimilarity(result.dbName, csvModel.name);
    }

    renderMatchingTable();
};

// 清除匹配
window.clearMatch = function(resultIdx) {
    const result = matchingResults[resultIdx];
    result.matched = false;
    result.csvName = null;
    result.csvIndex = -1;
    result.score = null;
    result.similarity = 0;
    renderMatchingTable();
};

// 确认导入
async function confirmImport() {
    const matchedResults = matchingResults.filter(r => r.matched);

    if (matchedResults.length === 0) {
        toast('没有匹配的模型可导入');
        return;
    }

    // 更新模型数据
    matchedResults.forEach(result => {
        const model = models[result.dbIndex];
        if (!model.benchmarks) model.benchmarks = {};
        model.benchmarks[csvBenchmarkName] = result.score;
        model.updated_at = new Date().toISOString();
    });

    // 保存
    await saveModels();

    // 更新 benchmark 名称列表
    if (importMode === 'add' && !benchmarkNames.includes(csvBenchmarkName)) {
        benchmarkNames.push(csvBenchmarkName);
        benchmarkNames.sort();
    }

    // 重新渲染表格
    renderTable();

    // 关闭模态框
    closeModal();

    toast(`成功导入 ${matchedResults.length} 条记录`);
}

// ==================== 导出 ====================

function exportBenchmarks() {
    if (models.length === 0 || benchmarkNames.length === 0) {
        toast('没有数据可导出');
        return;
    }

    // 构建 CSV 内容
    let csv = 'Model,' + benchmarkNames.join(',') + '\n';

    models.forEach(model => {
        const row = [model.name || ''];
        benchmarkNames.forEach(bn => {
            const score = model.benchmarks?.[bn];
            row.push(score !== undefined && score !== null ? score : '');
        });
        csv += row.map(v => `"${v}"`).join(',') + '\n';
    });

    // 下载
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmarks_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast('导出成功');
}

// ==================== 工具函数 ====================

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

