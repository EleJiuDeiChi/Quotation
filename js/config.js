// 配置和数据管理模块
const QuotationConfig = {
    // 默认配置
    config: {
        defaultCompanyName: '',
        defaultContact: '',
        defaultPhone: '',
        defaultAddress: '',
        defaultValidityDays: 30,
        defaultTaxRate: 0.13,
        quoteNumberPrefix: 'BQ',
        pdfWatermark: false,
        showPageNumber: false
    },

    // 库数据
    libraries: {
        customers: [],
        products: [],
        categories: ['硬件产品', '软件服务', '技术服务', '其他'],
        templates: [
            { id: 'simple', name: '简约版', description: '简洁明了的基础模板' },
            { id: 'standard', name: '企业标准版', description: '包含完整企业信息的标准模板' },
            { id: 'foreign', name: '外贸版', description: '适配国际贸易的多语言模板' }
        ],
        history: [],
        drafts: []
    },

    // 当前状态
    currentTemplate: 'standard',
    previewZoom: 1,
    currentEditingItemIndex: -1,
    items: [],

    // 预设条款
    presetTerms: [
        { id: 'term_1', text: '报价有效期为30天，逾期需重新确认', checked: false },
        { id: 'term_2', text: '付款方式：预付30%，发货前付清余款', checked: false },
        { id: 'term_3', text: '交货期：收到预付款后15个工作日内', checked: false },
        { id: 'term_4', text: '运输方式：物流到付', checked: false },
        { id: 'term_5', text: '质保期：自验收合格之日起12个月', checked: false }
    ],

    // 系统信息
    systemInfo: {
        name: '一键生成报价单',
        defaultCompany: ''
    },

    // 币种符号
    currencySymbols: {
        CNY: '¥',
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥'
    },

    // 币种名称
    currencyNames: {
        CNY: '人民币',
        USD: '美元',
        EUR: '欧元',
        GBP: '英镑',
        JPY: '日元'
    },

    // 本地存储操作
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadFromStorage(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },

    // 加载配置
    loadConfig() {
        const savedConfig = this.loadFromStorage('quotationConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...savedConfig };
        }
    },

    // 加载库数据
    loadLibraries() {
        const savedLibraries = this.loadFromStorage('quotationLibraries');
        if (savedLibraries) {
            this.libraries = { ...this.libraries, ...savedLibraries };
        }
    },

    // 加载系统信息
    loadSystemInfo() {
        const saved = this.loadFromStorage('systemInfo');
        if (saved) {
            this.systemInfo = { ...this.systemInfo, ...saved };
        }
        const savedTerms = this.loadFromStorage('presetTerms');
        if (savedTerms) {
            this.presetTerms = savedTerms;
        }
    },

    // 保存配置
    saveConfig() {
        this.saveToStorage('quotationConfig', this.config);
    },

    // 保存库数据
    saveLibraries() {
        this.saveToStorage('quotationLibraries', this.libraries);
    },

    // 保存系统信息
    saveSystemInfo() {
        this.saveToStorage('systemInfo', this.systemInfo);
    },

    // 保存预设条款
    savePresetTerms() {
        this.saveToStorage('presetTerms', this.presetTerms);
    }
};

// 全局数据收集
function collectFormData() {
    return {
        myInfo: {
            companyName: QuotationConfig.config.defaultCompanyName || '',
            contact: QuotationConfig.config.defaultContact || '',
            phone: QuotationConfig.config.defaultPhone || '',
            address: QuotationConfig.config.defaultAddress || '',
            taxNumber: '',
            logo: QuotationConfig.config.logoData || ''
        },
        customerInfo: {
            name: document.getElementById('customerName').value,
            contact: document.getElementById('customerContact').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value,
            email: document.getElementById('customerEmail').value
        },
        quoteInfo: {
            number: document.getElementById('quoteNumber').value,
            date: document.getElementById('quoteDate').value,
            validityDays: document.getElementById('validityDays').value,
            currency: document.getElementById('currency').value,
            taxRate: document.getElementById('taxRate').value,
            orderDiscount: document.getElementById('orderDiscount').value,
            subtotal: document.getElementById('subtotal').textContent,
            taxAmount: document.getElementById('taxAmount').textContent,
            finalTotal: document.getElementById('finalTotal').textContent
        },
        items: QuotationConfig.items,
        terms: QuotationConfig.presetTerms.filter(t => t.checked),
        remarks: document.getElementById('customRemarks').value
    };
}

// 加载报价单数据
function loadQuotationData(data) {
    // 我方信息已从配置中读取，不再从输入框加载
    document.getElementById('customerName').value = data.customerInfo.name || '';
    document.getElementById('customerContact').value = data.customerInfo.contact || '';
    document.getElementById('customerPhone').value = data.customerInfo.phone || '';
    document.getElementById('customerAddress').value = data.customerInfo.address || '';
    document.getElementById('customerEmail').value = data.customerInfo.email || '';
    document.getElementById('quoteNumber').value = data.quoteInfo.number || '';
    document.getElementById('quoteDate').value = data.quoteInfo.date || '';
    document.getElementById('validityDays').value = data.quoteInfo.validityDays || 30;
    document.getElementById('currency').value = data.quoteInfo.currency || 'CNY';
    document.getElementById('taxRate').value = data.quoteInfo.taxRate || 0.13;
    document.getElementById('orderDiscount').value = data.quoteInfo.orderDiscount || 1;
    QuotationConfig.items = data.items || [];
    ItemManager.renderItemsList();
    calculateTotals();
    document.getElementById('customRemarks').value = data.remarks || '';
    updatePreview();
}
