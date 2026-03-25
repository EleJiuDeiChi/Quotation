// UI 工具函数模块
const UIUtils = {
    // 关闭模态框
    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    },

    // 显示加载中
    showLoading(text = '正在处理...') {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingModal').classList.remove('hidden');
    },

    // 隐藏加载中
    hideLoading() {
        document.getElementById('loadingModal').classList.add('hidden');
    },

    // 显示提示
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${type === 'error' ? 'bg-red-600' : 'bg-gray-800'} text-white`;
        toast.classList.remove('translate-x-full');
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    },

    // 缩放预览
    zoomPreview(scale) {
        QuotationConfig.previewZoom = scale;
        document.getElementById('previewContainer').style.transform = `scale(${scale})`;
    },

    // 生成报价单编号
    generateQuoteNumber() {
        const date = new Date();
        const dateStr = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        document.getElementById('quoteNumber').value = QuotationConfig.config.quoteNumberPrefix + dateStr + random;
        updatePreview();
    },

    // 处理LOGO上传
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-contain">`;
            preview.dataset.logoData = e.target.result;
            updatePreview();
        };
        reader.readAsDataURL(file);
    },

    // 验证表单
    validateForm() {
        const myCompanyName = document.getElementById('myCompanyName').value.trim();
        const customerName = document.getElementById('customerName').value.trim();
        const quoteNumber = document.getElementById('quoteNumber').value.trim();
        if (!myCompanyName) { this.showToast('请填写公司名称', 'error'); return false; }
        if (!customerName) { this.showToast('请填写客户名称', 'error'); return false; }
        if (!quoteNumber) { this.showToast('请填写报价单编号', 'error'); return false; }
        if (QuotationConfig.items.length === 0) { this.showToast('请至少添加一个商品', 'error'); return false; }
        return true;
    },

    // 生成报价单
    generateQuotation() {
        if (!this.validateForm()) return;
        const quotation = collectFormData();
        quotation.status = 'confirmed';
        quotation.createdAt = new Date().toISOString();
        quotation.id = Date.now().toString();
        QuotationConfig.libraries.history.unshift(quotation);
        QuotationConfig.saveLibraries();
        this.showToast('报价单生成成功！');
        updatePreview();
    },

    // 保存草稿
    saveDraft() {
        const draft = collectFormData();
        draft.status = 'draft';
        draft.createdAt = new Date().toISOString();
        draft.id = Date.now().toString();
        QuotationConfig.libraries.history.unshift(draft);
        QuotationConfig.saveLibraries();
        this.showToast('草稿保存成功！');
    },

    // 设置自动保存
    setupAutoSave() {
        setInterval(() => {
            const draft = collectFormData();
            if (draft.items.length > 0 || draft.customerInfo.name) {
                draft.status = 'draft';
                draft.savedAt = new Date().toISOString();
                draft.autoSaved = true;
                localStorage.setItem('quotationAutoSave', JSON.stringify(draft));
            }
        }, 300000);
    },

    // 检查草稿恢复
    checkDraftRecovery() {
        const autoSave = QuotationConfig.loadFromStorage('quotationAutoSave');
        if (autoSave) {
            const time = new Date(autoSave.savedAt).toLocaleString();
            if (confirm(`检测到自动保存的草稿（${time}），是否恢复？`)) {
                loadQuotationData(autoSave);
            }
        }
    }
};
