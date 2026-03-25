// 条款管理模块
const TermManager = {
    // 渲染预设条款
    renderPresetTerms() {
        const container = document.getElementById('presetTerms');
        container.innerHTML = QuotationConfig.presetTerms.map((term, index) => `
            <label class="flex items-start cursor-pointer">
                <input type="checkbox" class="term-checkbox mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    value="${index}" ${term.checked ? 'checked' : ''} onchange="TermManager.updateTermCheck(${index}, this.checked)">
                <span class="ml-2 text-sm text-gray-700">${term.text}</span>
            </label>
        `).join('');
    },

    // 更新条款选中状态
    updateTermCheck(index, checked) {
        QuotationConfig.presetTerms[index].checked = checked;
        QuotationConfig.savePresetTerms();
        updatePreview();
    },

    // 显示条款管理器
    showTermManager() {
        const container = document.getElementById('termList');
        container.innerHTML = QuotationConfig.presetTerms.map((term, index) => `
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm flex-1">${term.text}</span>
                <button onclick="TermManager.deleteTerm(${index})" class="text-xs text-red-600 hover:text-red-800 ml-2">删除</button>
            </div>
        `).join('');
        document.getElementById('termManagerModal').classList.remove('hidden');
    },

    // 添加自定义条款
    addCustomTerm() {
        const text = document.getElementById('newTermInput').value.trim();
        if (!text) { UIUtils.showToast('请输入条款内容', 'error'); return; }
        QuotationConfig.presetTerms.push({ id: 'custom_' + Date.now(), text: text, checked: false });
        QuotationConfig.savePresetTerms();
        document.getElementById('newTermInput').value = '';
        this.showTermManager();
        this.renderPresetTerms();
        UIUtils.showToast('条款添加成功');
    },

    // 删除条款
    deleteTerm(index) {
        QuotationConfig.presetTerms.splice(index, 1);
        QuotationConfig.savePresetTerms();
        this.showTermManager();
        this.renderPresetTerms();
        updatePreview();
    }
};
