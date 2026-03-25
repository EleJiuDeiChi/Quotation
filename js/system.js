// 系统管理模块
const SystemManager = {
    // 编辑系统信息
    editSystemInfo() {
        document.getElementById('editSystemName').value = QuotationConfig.systemInfo.name || '';
        document.getElementById('systemInfoModal').classList.remove('hidden');
    },

    // 保存系统信息
    saveSystemInfo() {
        QuotationConfig.systemInfo.name = document.getElementById('editSystemName').value || '一键生成报价单';
        document.getElementById('systemName').textContent = QuotationConfig.systemInfo.name;
        QuotationConfig.saveSystemInfo();
        UIUtils.closeModal('systemInfoModal');
        UIUtils.showToast('系统信息已保存');
    },

    // 初始化表单
    initForm() {
        // 设置默认值
        document.getElementById('quoteDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('validityDays').value = QuotationConfig.config.defaultValidityDays;
        document.getElementById('taxRate').value = QuotationConfig.config.defaultTaxRate;
        
        // 更新系统标题：公司名称 + 报价系统
        const companyName = QuotationConfig.config.defaultCompanyName || '一键生成';
        document.getElementById('systemName').textContent = companyName + '报价单系统';
        document.title = companyName + '报价单系统';
        
        // 生成默认报价单号
        UIUtils.generateQuoteNumber();
    },

    // 处理配置页面LOGO上传
    handleConfigLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('configLogoPreview');
            preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-contain">`;
            preview.dataset.logoData = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // 显示配置模态框
    showConfigModal() {
        document.getElementById('defaultCompanyName').value = QuotationConfig.config.defaultCompanyName || '';
        document.getElementById('defaultContact').value = QuotationConfig.config.defaultContact || '';
        document.getElementById('defaultPhone').value = QuotationConfig.config.defaultPhone || '';
        document.getElementById('defaultAddress').value = QuotationConfig.config.defaultAddress || '';
        document.getElementById('defaultValidityDays').value = QuotationConfig.config.defaultValidityDays || 30;
        document.getElementById('defaultTaxRate').value = QuotationConfig.config.defaultTaxRate || 0.13;
        document.getElementById('quoteNumberPrefix').value = QuotationConfig.config.quoteNumberPrefix || 'BQ';
        document.getElementById('pdfWatermark').checked = QuotationConfig.config.pdfWatermark || false;
        document.getElementById('showPageNumber').checked = QuotationConfig.config.showPageNumber || false;
        
        // 加载LOGO预览
        const logoPreview = document.getElementById('configLogoPreview');
        if (QuotationConfig.config.logoData) {
            logoPreview.innerHTML = `<img src="${QuotationConfig.config.logoData}" class="w-full h-full object-contain">`;
            logoPreview.dataset.logoData = QuotationConfig.config.logoData;
        } else {
            logoPreview.innerHTML = '<span class="text-gray-400 text-xs">LOGO</span>';
            delete logoPreview.dataset.logoData;
        }
        
        document.getElementById('configModal').classList.remove('hidden');
    },

    // 保存配置
    saveConfig() {
        const companyName = document.getElementById('defaultCompanyName').value.trim();
        if (!companyName) {
            UIUtils.showToast('请输入公司名称', 'error');
            return;
        }
        QuotationConfig.config.defaultCompanyName = companyName;
        QuotationConfig.config.defaultContact = document.getElementById('defaultContact').value;
        QuotationConfig.config.defaultPhone = document.getElementById('defaultPhone').value;
        QuotationConfig.config.defaultAddress = document.getElementById('defaultAddress').value;
        QuotationConfig.config.defaultValidityDays = parseInt(document.getElementById('defaultValidityDays').value) || 30;
        QuotationConfig.config.defaultTaxRate = parseFloat(document.getElementById('defaultTaxRate').value) || 0.13;
        QuotationConfig.config.quoteNumberPrefix = document.getElementById('quoteNumberPrefix').value || 'BQ';
        QuotationConfig.config.pdfWatermark = document.getElementById('pdfWatermark').checked;
        QuotationConfig.config.showPageNumber = document.getElementById('showPageNumber').checked;
        
        // 保存LOGO
        const logoPreview = document.getElementById('configLogoPreview');
        if (logoPreview.dataset.logoData) {
            QuotationConfig.config.logoData = logoPreview.dataset.logoData;
        }
        
        QuotationConfig.saveConfig();
        UIUtils.closeModal('configModal');
        UIUtils.showToast('配置已保存');
        this.initForm();
        updatePreview();
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载所有配置
    QuotationConfig.loadConfig();
    QuotationConfig.loadLibraries();
    QuotationConfig.loadSystemInfo();
    
    // 初始化表单
    SystemManager.initForm();
    
    // 渲染预设条款
    TermManager.renderPresetTerms();
    
    // 设置自动保存
    UIUtils.setupAutoSave();
    
    // 检查草稿恢复
    setTimeout(() => {
        UIUtils.checkDraftRecovery();
    }, 1000);
    
    // 监听所有输入变化，实时更新预览
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            if (!e.target.closest('.modal-overlay')) {
                updatePreview();
            }
        }
    });
    
    // 初始预览
    updatePreview();
});
