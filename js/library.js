// 库管理模块
const LibraryManager = {
    // 显示库模态框
    showLibraryModal(type) {
        const modalMap = {
            customer: 'customerLibraryModal',
            product: 'productLibraryModal',
            template: 'templateLibraryModal',
            history: 'historyLibraryModal'
        };
        const modalId = modalMap[type];
        if (modalId) {
            document.getElementById(modalId).classList.remove('hidden');
            this.renderLibraryList(type);
        }
    },

    // 渲染库列表
    renderLibraryList(type) {
        switch(type) {
            case 'customer': this.renderCustomerList(); break;
            case 'product': this.renderProductList(); break;
            case 'template': this.renderTemplateList(); break;
            case 'history': this.renderHistoryList(); break;
        }
    },

    // 渲染客户列表
    renderCustomerList(filter = '') {
        const container = document.getElementById('customerList');
        let customers = QuotationConfig.libraries.customers;
        if (filter) {
            customers = customers.filter(c => c.name.includes(filter) || c.contact.includes(filter));
        }
        if (customers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无客户数据</p>';
            return;
        }
        container.innerHTML = customers.map(c => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                <div>
                    <p class="font-medium">${c.name}</p>
                    <p class="text-sm text-gray-600">${c.contact} ${c.phone}</p>
                </div>
                <div class="space-x-2">
                    <button onclick="LibraryManager.selectCustomer('${c.id}')" class="text-sm text-blue-600 hover:text-blue-800">选择</button>
                    <button onclick="LibraryManager.deleteCustomer('${c.id}')" class="text-sm text-red-600 hover:text-red-800">删除</button>
                </div>
            </div>
        `).join('');
    },

    // 渲染商品列表
    renderProductList(filter = '') {
        const container = document.getElementById('productList');
        let products = QuotationConfig.libraries.products;
        if (filter) {
            products = products.filter(p => p.name.includes(filter) || p.spec.includes(filter));
        }
        if (products.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无商品数据</p>';
            return;
        }
        container.innerHTML = products.map(p => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                <div>
                    <p class="font-medium">${p.name}</p>
                    <p class="text-sm text-gray-600">${p.spec} | ${p.unit} | ¥${p.price}</p>
                </div>
                <div class="space-x-2">
                    <button onclick="LibraryManager.selectProduct('${p.id}')" class="text-sm text-blue-600 hover:text-blue-800">选择</button>
                    <button onclick="LibraryManager.deleteProduct('${p.id}')" class="text-sm text-red-600 hover:text-red-800">删除</button>
                </div>
            </div>
        `).join('');
    },

    // 渲染模板列表
    renderTemplateList() {
        const container = document.getElementById('templateList');
        container.innerHTML = QuotationConfig.libraries.templates.map(t => `
            <div class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 ${QuotationConfig.currentTemplate === t.id ? 'border-blue-500 bg-blue-50' : ''}" onclick="LibraryManager.selectTemplate('${t.id}')">
                <h4 class="font-medium">${t.name}</h4>
                <p class="text-sm text-gray-600 mt-1">${t.description}</p>
            </div>
        `).join('');
    },

    // 渲染历史列表
    renderHistoryList(filter = '') {
        const container = document.getElementById('historyList');
        let history = QuotationConfig.libraries.history;
        const statusFilter = document.getElementById('historyStatusFilter')?.value;
        if (statusFilter) {
            history = history.filter(h => h.status === statusFilter);
        }
        if (filter) {
            history = history.filter(h => h.customerInfo.name.includes(filter) || h.quoteInfo.number.includes(filter));
        }
        if (history.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无历史报价</p>';
            return;
        }
        container.innerHTML = history.map(h => {
            const statusBadge = h.status === 'quoted' 
                ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">已报价</span>'
                : '<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded ml-2">草稿</span>';
            return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                <div>
                    <p class="font-medium">${h.quoteInfo.number}${statusBadge}</p>
                    <p class="text-sm text-gray-600">${h.customerInfo.name} | ${h.quoteInfo.date}</p>
                    <p class="text-sm text-blue-600">${h.quoteInfo.finalTotal}</p>
                </div>
                <div class="space-x-2">
                    <button onclick="LibraryManager.loadHistoryItem('${h.id}')" class="text-sm text-blue-600 hover:text-blue-800">加载</button>
                    <button onclick="LibraryManager.deleteHistory('${h.id}')" class="text-sm text-red-600 hover:text-red-800">删除</button>
                </div>
            </div>
        `}).join('');
    },

    // 选择客户
    selectCustomer(customerId) {
        const customer = QuotationConfig.libraries.customers.find(c => c.id === customerId);
        if (customer) {
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerContact').value = customer.contact || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerEmail').value = customer.email || '';
            updatePreview();
            UIUtils.closeModal('customerLibraryModal');
            UIUtils.showToast('客户信息已加载');
        }
    },

    // 选择商品
    selectProduct(productId) {
        const product = QuotationConfig.libraries.products.find(p => p.id === productId);
        if (product) {
            QuotationConfig.items.push({
                name: product.name,
                spec: product.spec || '',
                unit: product.unit || '个',
                price: product.price || 0,
                quantity: 1,
                discount: 1
            });
            ItemManager.renderItemsList();
            calculateTotals();
            updatePreview();
            UIUtils.closeModal('productLibraryModal');
            UIUtils.showToast('商品已添加');
        }
    },

    // 选择模板
    selectTemplate(templateId) {
        QuotationConfig.currentTemplate = templateId;
        this.renderTemplateList();
        UIUtils.showToast('模板已选择');
    },

    // 加载历史项目
    loadHistoryItem(historyId) {
        const history = QuotationConfig.libraries.history.find(h => h.id === historyId);
        if (history) {
            loadQuotationData(history);
            UIUtils.closeModal('historyLibraryModal');
            UIUtils.showToast('历史报价已加载');
        }
    },

    // 导出库
    exportLibrary(type) {
        const data = type === 'customer' ? QuotationConfig.libraries.customers :
                     type === 'product' ? QuotationConfig.libraries.products :
                     type === 'template' ? QuotationConfig.libraries.templates :
                     QuotationConfig.libraries.history;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${type}_library_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        UIUtils.showToast('导出成功！');
    },

    // 导入库
    importLibrary(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    const key = type === 'customer' ? 'customers' :
                               type === 'product' ? 'products' :
                               type === 'template' ? 'templates' : 'history';
                    QuotationConfig.libraries[key] = data;
                    QuotationConfig.saveLibraries();
                    LibraryManager.renderLibraryList(type);
                    UIUtils.showToast('导入成功！');
                } else {
                    throw new Error('数据格式错误');
                }
            } catch (error) {
                UIUtils.showToast('导入失败：' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    },

    // 添加客户
    addCustomer() {
        const name = document.getElementById('newCustomerName').value.trim();
        if (!name) {
            UIUtils.showToast('请输入客户名称', 'error');
            return;
        }
        const contact = document.getElementById('newCustomerContact').value.trim();
        const phone = document.getElementById('newCustomerPhone').value.trim();
        const address = document.getElementById('newCustomerAddress').value.trim();
        const email = document.getElementById('newCustomerEmail').value.trim();
        
        QuotationConfig.libraries.customers.push({
            id: Date.now().toString(),
            name, contact, phone, address, email
        });
        QuotationConfig.saveLibraries();
        
        // 清空表单
        document.getElementById('newCustomerName').value = '';
        document.getElementById('newCustomerContact').value = '';
        document.getElementById('newCustomerPhone').value = '';
        document.getElementById('newCustomerAddress').value = '';
        document.getElementById('newCustomerEmail').value = '';
        
        this.renderCustomerList();
        UIUtils.showToast('客户添加成功');
    },

    // 添加商品
    addProduct() {
        const name = document.getElementById('newProductName').value.trim();
        const price = parseFloat(document.getElementById('newProductPrice').value);
        
        if (!name) {
            UIUtils.showToast('请输入商品名称', 'error');
            return;
        }
        if (!price || price <= 0) {
            UIUtils.showToast('请输入有效的单价', 'error');
            return;
        }
        
        const spec = document.getElementById('newProductSpec').value.trim();
        const unit = document.getElementById('newProductUnit').value.trim() || '个';
        
        QuotationConfig.libraries.products.push({
            id: Date.now().toString(),
            name, spec, unit, price
        });
        QuotationConfig.saveLibraries();
        
        // 清空表单
        document.getElementById('newProductName').value = '';
        document.getElementById('newProductSpec').value = '';
        document.getElementById('newProductUnit').value = '';
        document.getElementById('newProductPrice').value = '';
        
        this.renderProductList();
        UIUtils.showToast('商品添加成功');
    },

    // 删除客户
    deleteCustomer(id) {
        if (confirm('确定删除此客户？')) {
            QuotationConfig.libraries.customers = QuotationConfig.libraries.customers.filter(c => c.id !== id);
            QuotationConfig.saveLibraries();
            this.renderCustomerList();
            UIUtils.showToast('客户已删除');
        }
    },

    // 删除商品
    deleteProduct(id) {
        if (confirm('确定删除此商品？')) {
            QuotationConfig.libraries.products = QuotationConfig.libraries.products.filter(p => p.id !== id);
            QuotationConfig.saveLibraries();
            this.renderProductList();
            UIUtils.showToast('商品已删除');
        }
    },

    // 删除历史
    deleteHistory(id) {
        if (confirm('确定删除此报价单？')) {
            QuotationConfig.libraries.history = QuotationConfig.libraries.history.filter(h => h.id !== id);
            QuotationConfig.saveLibraries();
            this.renderHistoryList();
            UIUtils.showToast('报价单已删除');
        }
    },

    // 加载客户库
    loadFromCustomerLibrary() {
        this.showLibraryModal('customer');
    },

    // 加载商品库
    loadFromProductLibrary() {
        this.showLibraryModal('product');
    },

    // 搜索库
    searchLibrary(type) {
        this.renderLibraryList(type);
    }
};
