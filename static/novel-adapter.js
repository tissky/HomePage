// Novel Adapter JavaScript

// Configuration
const API_BASE = window.location.origin;
let currentProject = null;
let currentWorkflowStep = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadProjects();
    loadSettings();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });

    // File upload
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const novelText = document.getElementById('novel-text');
    const projectName = document.getElementById('project-name');

    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/plain') {
            readFile(file);
        } else {
            showToast('请上传 .txt 文件', 'error');
        }
    });

    // Enable/disable start button based on content
    novelText.addEventListener('input', function() {
        const startBtn = document.getElementById('start-analysis-btn');
        startBtn.disabled = !this.value.trim() || !projectName.value.trim();
    });

    projectName.addEventListener('input', function() {
        const startBtn = document.getElementById('start-analysis-btn');
        const novelText = document.getElementById('novel-text');
        startBtn.disabled = !this.value.trim() || !novelText.value.trim();
    });

    // Action buttons
    document.getElementById('start-analysis-btn').addEventListener('click', startAnalysis);
    document.getElementById('clear-btn').addEventListener('click', clearContent);
    document.getElementById('confirm-analysis-btn')?.addEventListener('click', confirmAnalysis);
    document.getElementById('regenerate-analysis-btn')?.addEventListener('click', regenerateAnalysis);
    document.getElementById('save-script-btn')?.addEventListener('click', saveScript);
    document.getElementById('regenerate-script-btn')?.addEventListener('click', regenerateScript);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

    // Command buttons
    document.querySelectorAll('.command-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            executeCommand(this.dataset.command);
        });
    });

    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            exportProject(this.dataset.format);
        });
    });
}

// View Management
function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Load data based on view
    if (viewName === 'projects') {
        loadProjects();
    }
}

// File Handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        readFile(file);
    }
}

function readFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('novel-text').value = content;
        
        // Auto-fill project name if empty
        const projectNameInput = document.getElementById('project-name');
        if (!projectNameInput.value.trim()) {
            projectNameInput.value = file.name.replace('.txt', '');
        }
        
        // Enable start button
        document.getElementById('start-analysis-btn').disabled = false;
        
        showToast('文件上传成功', 'success');
    };
    reader.onerror = function() {
        showToast('文件读取失败', 'error');
    };
    reader.readAsText(file);
}

function clearContent() {
    document.getElementById('project-name').value = '';
    document.getElementById('novel-text').value = '';
    document.getElementById('file-input').value = '';
    document.getElementById('start-analysis-btn').disabled = true;
    
    // Hide results
    document.getElementById('workflow-status').classList.add('hidden');
    document.getElementById('analysis-result').classList.add('hidden');
    document.getElementById('script-result').classList.add('hidden');
    
    currentProject = null;
    currentWorkflowStep = 1;
}

// Workflow Management
function updateWorkflowStep(step, status = 'active') {
    currentWorkflowStep = step;
    const workflowStatus = document.getElementById('workflow-status');
    workflowStatus.classList.remove('hidden');
    
    const steps = workflowStatus.querySelectorAll('.step');
    steps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add(status);
        }
    });
}

// Analysis Functions
async function startAnalysis() {
    const projectName = document.getElementById('project-name').value.trim();
    const novelContent = document.getElementById('novel-text').value.trim();
    
    if (!projectName || !novelContent) {
        showToast('请填写项目名称和小说内容', 'error');
        return;
    }

    showLoading('正在进行改编分析，这可能需要几分钟...');
    updateWorkflowStep(2, 'active');

    try {
        // Create or update project
        const projectData = {
            name: projectName,
            sourceContent: novelContent,
            status: 'analyzing'
        };

        const response = await fetch(`${API_BASE}/api/novel/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('项目创建失败');
        }

        const project = await response.json();
        currentProject = project;

        // Start analysis
        const analysisResponse = await fetch(`${API_BASE}/api/novel/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: project.id,
                content: novelContent
            })
        });

        if (!analysisResponse.ok) {
            const error = await analysisResponse.json();
            throw new Error(error.error || '分析失败');
        }

        const analysis = await analysisResponse.json();
        displayAnalysisResult(analysis);
        
        updateWorkflowStep(3, 'active');
        hideLoading();
        showToast('分析完成！', 'success');

    } catch (error) {
        console.error('Analysis error:', error);
        hideLoading();
        showToast(error.message || '分析失败，请重试', 'error');
    }
}

function displayAnalysisResult(analysis) {
    const resultDiv = document.getElementById('analysis-result');
    const contentDiv = document.getElementById('analysis-content');
    
    let html = '';
    
    // Parse the analysis result
    if (analysis.analysis) {
        const sections = [
            { key: 'summary', title: '原文概要', icon: 'fa-book' },
            { key: 'corePlot', title: '核心剧情', icon: 'fa-bolt' },
            { key: 'characters', title: '人物梳理', icon: 'fa-users' },
            { key: 'emotionalTone', title: '情感基调', icon: 'fa-heart' },
            { key: 'adaptationFocus', title: '改编重点', icon: 'fa-star' },
            { key: 'challenges', title: '难点分析', icon: 'fa-exclamation-triangle' },
            { key: 'sceneStructure', title: '场次规划', icon: 'fa-sitemap' }
        ];

        sections.forEach(section => {
            if (analysis.analysis[section.key]) {
                html += `
                    <div class="analysis-section">
                        <h4><i class="fas ${section.icon}"></i> ${section.title}</h4>
                        ${formatAnalysisContent(analysis.analysis[section.key])}
                    </div>
                `;
            }
        });
    }
    
    contentDiv.innerHTML = html || '<p>分析结果为空</p>';
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function formatAnalysisContent(content) {
    if (typeof content === 'string') {
        // Convert line breaks and lists
        return content
            .split('\n')
            .map(line => {
                line = line.trim();
                if (!line) return '';
                if (line.match(/^[\d]+[\.\)、]/)) {
                    return `<li>${line.replace(/^[\d]+[\.\)、]\s*/, '')}</li>`;
                }
                return `<p>${line}</p>`;
            })
            .join('')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    } else if (Array.isArray(content)) {
        return '<ul>' + content.map(item => `<li>${item}</li>`).join('') + '</ul>';
    } else if (typeof content === 'object') {
        return '<ul>' + Object.entries(content).map(([key, value]) => 
            `<li><strong>${key}:</strong> ${value}</li>`
        ).join('') + '</ul>';
    }
    return `<p>${content}</p>`;
}

async function confirmAnalysis() {
    if (!currentProject) {
        showToast('没有当前项目', 'error');
        return;
    }

    showLoading('正在生成剧本，这可能需要几分钟...');
    updateWorkflowStep(4, 'active');

    try {
        const response = await fetch(`${API_BASE}/api/novel/generate-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '剧本生成失败');
        }

        const result = await response.json();
        displayScriptResult(result.script);
        
        updateWorkflowStep(5, 'active');
        hideLoading();
        showToast('剧本生成完成！', 'success');

    } catch (error) {
        console.error('Script generation error:', error);
        hideLoading();
        showToast(error.message || '剧本生成失败，请重试', 'error');
    }
}

function displayScriptResult(script) {
    const resultDiv = document.getElementById('script-result');
    const scriptContent = document.getElementById('script-content');
    
    scriptContent.value = script;
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

async function regenerateAnalysis() {
    if (!currentProject) {
        showToast('没有当前项目', 'error');
        return;
    }
    
    // Reset to analysis step
    updateWorkflowStep(2, 'active');
    document.getElementById('analysis-result').classList.add('hidden');
    document.getElementById('script-result').classList.add('hidden');
    
    // Restart analysis
    await startAnalysis();
}

async function regenerateScript() {
    if (!currentProject) {
        showToast('没有当前项目', 'error');
        return;
    }
    
    // Reset to script generation step
    updateWorkflowStep(4, 'active');
    document.getElementById('script-result').classList.add('hidden');
    
    // Regenerate script
    await confirmAnalysis();
}

function toggleScriptEdit() {
    const scriptEditor = document.getElementById('script-editor');
    const scriptContent = document.getElementById('script-content');
    const saveBtn = document.getElementById('save-script-btn');
    
    if (scriptEditor.classList.contains('readonly')) {
        scriptEditor.classList.remove('readonly');
        scriptContent.removeAttribute('readonly');
        saveBtn.classList.remove('hidden');
    } else {
        scriptEditor.classList.add('readonly');
        scriptContent.setAttribute('readonly', 'readonly');
        saveBtn.classList.add('hidden');
    }
}

async function saveScript() {
    if (!currentProject) {
        showToast('没有当前项目', 'error');
        return;
    }

    const scriptContent = document.getElementById('script-content').value;
    
    showLoading('保存中...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/projects/${currentProject.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                script: scriptContent,
                status: 'completed'
            })
        });

        if (!response.ok) {
            throw new Error('保存失败');
        }

        hideLoading();
        showToast('保存成功！', 'success');
        
        // Exit edit mode
        toggleScriptEdit();

    } catch (error) {
        console.error('Save error:', error);
        hideLoading();
        showToast('保存失败，请重试', 'error');
    }
}

// Command Execution
async function executeCommand(command) {
    if (!currentProject) {
        showToast('请先创建或选择一个项目', 'warning');
        return;
    }

    switch (command) {
        case 'analyze':
            await analyzeQuality();
            break;
        case 'adapt':
            await regenerateScript();
            break;
        case 'characters':
            await showCharacterProfiles();
            break;
        case 'relationships':
            await showRelationshipGraph();
            break;
    }
}

async function analyzeQuality() {
    showLoading('正在分析改编质量...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/analyze-quality`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            throw new Error('分析失败');
        }

        const result = await response.json();
        
        hideLoading();
        showModal('改编质量分析', formatAnalysisContent(result.analysis));

    } catch (error) {
        console.error('Quality analysis error:', error);
        hideLoading();
        showToast('分析失败，请重试', 'error');
    }
}

async function showCharacterProfiles() {
    showLoading('加载角色档案...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/character-profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            throw new Error('加载失败');
        }

        const result = await response.json();
        
        hideLoading();
        
        let html = '';
        if (result.characters && Array.isArray(result.characters)) {
            result.characters.forEach(character => {
                html += formatCharacterProfile(character);
            });
        } else {
            html = '<p>暂无角色档案</p>';
        }
        
        showModal('角色档案', html);

    } catch (error) {
        console.error('Character profile error:', error);
        hideLoading();
        showToast('加载失败，请重试', 'error');
    }
}

function formatCharacterProfile(character) {
    return `
        <div class="character-profile">
            <h4>${character.name || '未知角色'}</h4>
            <div class="character-info">
                <div class="info-item">
                    <span class="info-label">角色定位</span>
                    <span class="info-value">${character.role || '-'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">性格特征</span>
                    <span class="info-value">${character.personality || '-'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">主要目标</span>
                    <span class="info-value">${character.goal || '-'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">人物弧光</span>
                    <span class="info-value">${character.arc || '-'}</span>
                </div>
            </div>
            ${character.description ? `<p>${character.description}</p>` : ''}
        </div>
    `;
}

async function showRelationshipGraph() {
    showLoading('生成关系图...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/relationship-graph`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            throw new Error('生成失败');
        }

        const result = await response.json();
        
        hideLoading();
        
        const html = `
            <div class="relationship-graph">
                <pre>${result.mermaidCode || '暂无关系图数据'}</pre>
            </div>
        `;
        
        showModal('角色关系图', html);

    } catch (error) {
        console.error('Relationship graph error:', error);
        hideLoading();
        showToast('生成失败，请重试', 'error');
    }
}

// Project Management
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/api/novel/projects`);
        
        if (!response.ok) {
            throw new Error('加载项目失败');
        }

        const projects = await response.json();
        displayProjects(projects);

    } catch (error) {
        console.error('Load projects error:', error);
        // Don't show error toast on initial load
    }
}

function displayProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    const projectsList = document.querySelector('.projects-items');
    
    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = '<p style="color: var(--adapter-text-muted); text-align: center;">暂无项目</p>';
        projectsList.innerHTML = '<p style="color: var(--adapter-text-muted); font-size: 0.875rem; text-align: center;">暂无项目</p>';
        return;
    }

    // Display in grid
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card" onclick="openProject('${project.id}')">
            <div class="project-card-header">
                <h3 class="project-card-title">${project.name}</h3>
                <span class="project-card-status ${project.status || 'draft'}">${getStatusText(project.status)}</span>
            </div>
            <div class="project-card-meta">
                创建时间: ${formatDate(project.createdAt)}
            </div>
            <div class="project-card-actions" onclick="event.stopPropagation()">
                <button onclick="openProject('${project.id}')">
                    <i class="fas fa-eye"></i> 查看
                </button>
                <button onclick="deleteProject('${project.id}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `).join('');

    // Display in sidebar (recent 5)
    const recentProjects = projects.slice(0, 5);
    projectsList.innerHTML = recentProjects.map(project => `
        <div class="project-item" onclick="openProject('${project.id}')">
            <div class="project-item-name">${project.name}</div>
            <div class="project-item-date">${formatDate(project.createdAt)}</div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'draft': '草稿',
        'analyzing': '分析中',
        'analyzed': '已分析',
        'generating': '生成中',
        'completed': '已完成'
    };
    return statusMap[status] || '未知';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

async function openProject(projectId) {
    showLoading('加载项目...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/projects/${projectId}`);
        
        if (!response.ok) {
            throw new Error('加载项目失败');
        }

        const project = await response.json();
        currentProject = project;
        
        // Switch to new project view
        switchView('new-project');
        
        // Populate fields
        document.getElementById('project-name').value = project.name;
        document.getElementById('novel-text').value = project.sourceContent || '';
        
        // Show analysis if available
        if (project.analysis) {
            displayAnalysisResult({ analysis: project.analysis });
            updateWorkflowStep(3);
        }
        
        // Show script if available
        if (project.script) {
            displayScriptResult(project.script);
            updateWorkflowStep(5);
        }
        
        // Update current project info
        updateCurrentProjectInfo(project);
        
        hideLoading();
        showToast('项目加载成功', 'success');

    } catch (error) {
        console.error('Open project error:', error);
        hideLoading();
        showToast('加载项目失败', 'error');
    }
}

function updateCurrentProjectInfo(project) {
    const infoDiv = document.getElementById('current-project-info');
    infoDiv.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
            <strong style="color: var(--adapter-primary);">${project.name}</strong>
        </div>
        <div style="font-size: 0.875rem; color: var(--adapter-text-muted);">
            状态: ${getStatusText(project.status)}<br>
            创建: ${formatDate(project.createdAt)}
        </div>
    `;
}

async function deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
        return;
    }

    showLoading('删除中...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        hideLoading();
        showToast('项目已删除', 'success');
        
        // Reload projects
        await loadProjects();
        
        // Clear current project if it was deleted
        if (currentProject && currentProject.id === projectId) {
            clearContent();
        }

    } catch (error) {
        console.error('Delete project error:', error);
        hideLoading();
        showToast('删除失败，请重试', 'error');
    }
}

// Export Functions
async function exportProject(format) {
    if (!currentProject) {
        showToast('请先创建或选择一个项目', 'warning');
        return;
    }

    const scriptContent = document.getElementById('script-content').value;
    if (!scriptContent) {
        showToast('没有可导出的剧本内容', 'warning');
        return;
    }

    try {
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'markdown':
                content = formatAsMarkdown(currentProject, scriptContent);
                filename = `${currentProject.name}.md`;
                mimeType = 'text/markdown';
                break;
            case 'txt':
                content = scriptContent;
                filename = `${currentProject.name}.txt`;
                mimeType = 'text/plain';
                break;
            case 'json':
                content = JSON.stringify(currentProject, null, 2);
                filename = `${currentProject.name}.json`;
                mimeType = 'application/json';
                break;
        }

        downloadFile(content, filename, mimeType);
        showToast(`导出成功: ${filename}`, 'success');

    } catch (error) {
        console.error('Export error:', error);
        showToast('导出失败，请重试', 'error');
    }
}

function formatAsMarkdown(project, script) {
    return `# ${project.name}

## 项目信息
- 创建时间: ${formatDate(project.createdAt)}
- 修改时间: ${formatDate(project.updatedAt)}
- 状态: ${getStatusText(project.status)}

## 剧本内容

${script}

---
*导出自小说改编助手*
`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/api/novel/settings`);
        
        if (response.ok) {
            const settings = await response.json();
            if (settings.model) {
                document.getElementById('model-select').value = settings.model;
            }
        }
    } catch (error) {
        console.error('Load settings error:', error);
    }
}

async function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model-select').value;

    if (!apiKey && !model) {
        showToast('请至少填写一项设置', 'warning');
        return;
    }

    showLoading('保存设置...');

    try {
        const response = await fetch(`${API_BASE}/api/novel/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: apiKey || undefined,
                model: model
            })
        });

        if (!response.ok) {
            throw new Error('保存失败');
        }

        hideLoading();
        showToast('设置已保存', 'success');
        
        // Clear API key input for security
        document.getElementById('api-key').value = '';

    } catch (error) {
        console.error('Save settings error:', error);
        hideLoading();
        showToast('保存失败，请重试', 'error');
    }
}

// UI Helpers
function showLoading(text = '处理中...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
}

function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function toggleAnalysisExpand() {
    const resultDiv = document.getElementById('analysis-result');
    resultDiv.classList.toggle('expanded');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});
