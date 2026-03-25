// 商品管理模块
const ItemManager = {
    // 显示添加商品模态框
    showAddItemModal(index = -1) {
        QuotationConfig.currentEditingItemIndex = index;
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('itemModalTitle');
        
        if (index >= 0) {
            const item = QuotationConfig.items[index];
            document.getElementById('modalItemName').value = item.name;
            document.getElementById('modalItemSpec').value = item.spec || '';
            document.getElementById('modalItemUnit').value = item.unit || '个';
            document.getElementById('modalItemPrice').value = item.price || '';
            document.getElementById('modalItemQuantity').value = item.quantity || 1;
            document.getElementById('modalItemDiscount').value = item.discount || 1;
            title.textContent = '编辑商品/服务';
        } else {
            document.getElementById('modalItemName').value = '';
            document.getElementById('modalItemSpec').value = '';
            document.getElementById('modalItemUnit').value = '个';
            document.getElementById('modalItemPrice').value = '';
            document.getElementById('modalItemQuantity').value = 1;
            document.getElementById('modalItemDiscount').value = 1;
            title.textContent = '添加商品/服务';
        }
        
        this.updateModalAmountPreview();
        modal.classList.remove('hidden');
    },

    // 更新模态框金额预览
    updateModalAmountPreview() {
        const price = parseFloat(document.getElementById('modalItemPrice').value) || 0;
        const quantity = parseFloat(document.getElementById('modalItemQuantity').value) || 0;
        const discount = parseFloat(document.getElementById('modalItemDiscount').value) || 1;
        const amount = price * quantity * discount;
        const currency = document.getElementById('currency')?.value || 'CNY';
        const symbol = QuotationConfig.currencySymbols[currency];
        document.getElementById('modalAmountPreview').textContent = `金额: ${symbol}${amount.toFixed(2)}`;
    },

    // 确认商品模态框
    confirmItemModal() {
        const name = document.getElementById('modalItemName').value.trim();
        const price = parseFloat(document.getElementById('modalItemPrice').value);
        const quantity = parseFloat(document.getElementById('modalItemQuantity').value);
        
        if (!name) { UIUtils.showToast('请输入商品名称', 'error'); return; }
        if (!price || price <= 0) { UIUtils.showToast('请输入有效的单价', 'error'); return; }
        if (!quantity || quantity <= 0) { UIUtils.showToast('请输入有效的数量', 'error'); return; }
        
        const item = {
            name: name,
            spec: document.getElementById('modalItemSpec').value.trim(),
            unit: document.getElementById('modalItemUnit').value.trim() || '个',
            price: price,
            quantity: quantity,
            discount: parseFloat(document.getElementById('modalItemDiscount').value) || 1
        };
        
        if (QuotationConfig.currentEditingItemIndex >= 0) {
            QuotationConfig.items[QuotationConfig.currentEditingItemIndex] = item;
        } else {
            QuotationConfig.items.push(item);
        }
        
        this.renderItemsList();
        calculateTotals();
        updatePreview();
        UIUtils.closeModal('itemModal');
        UIUtils.showToast(QuotationConfig.currentEditingItemIndex >= 0 ? '商品已更新' : '商品已添加');
    },

    // 渲染商品列表
    renderItemsList() {
        const container = document.getElementById('itemsList');
        if (QuotationConfig.items.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4 text-sm">暂无商品，点击上方按钮添加</p>';
            return;
        }
        
        const currency = document.getElementById('currency')?.value || 'CNY';
        const symbol = QuotationConfig.currencySymbols[currency];
        
        container.innerHTML = QuotationConfig.items.map((item, index) => {
            const amount = item.price * item.quantity * item.discount;
            const discountText = item.discount < 1 ? `<span class="text-xs text-orange-600">(${(item.discount * 10).toFixed(0)}折)</span>` : '';
            return `
                <div class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm font-medium text-gray-900">${index + 1}.</span>
                                <span class="text-sm font-medium text-gray-900 truncate">${item.name}</span>
                                ${item.spec ? `<span class="text-xs text-gray-500">(${item.spec})</span>` : ''}
                            </div>
                            <div class="mt-1 text-xs text-gray-600 flex items-center space-x-3">
                                <span>${item.unit}</span>
                                <span>×</span>
                                <span>${item.quantity}</span>
                                <span>@</span>
                                <span>${symbol}${item.price.toFixed(2)}</span>
                                ${discountText}
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-2">
                            <span class="text-sm font-semibold text-blue-600">${symbol}${amount.toFixed(2)}</span>
                            <button onclick="ItemManager.showAddItemModal(${index})" class="text-blue-600 hover:text-blue-800 text-xs">编辑</button>
                            <button onclick="ItemManager.deleteItem(${index})" class="text-red-600 hover:text-red-800 text-xs">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // 删除商品
    deleteItem(index) {
        if (confirm('确定删除此商品？')) {
            QuotationConfig.items.splice(index, 1);
            this.renderItemsList();
            calculateTotals();
            updatePreview();
            UIUtils.showToast('商品已删除');
        }
    },

    // 显示批量添加模态框
    showBatchAddModal() {
        document.getElementById('batchAddModal').classList.remove('hidden');
    },

    // 确认批量添加
    confirmBatchAdd() {
        const input = document.getElementById('batchInput').value.trim();
        if (!input) { UIUtils.showToast('请输入数据', 'error'); return; }
        
        const lines = input.split('\n');
        let added = 0;
        
        lines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 4) {
                QuotationConfig.items.push({
                    name: parts[0],
                    spec: parts[1] || '',
                    unit: parts[2] || '个',
                    price: parseFloat(parts[3]) || 0,
                    quantity: parseFloat(parts[4]) || 1,
                    discount: parseFloat(parts[5]) || 1
                });
                added++;
            }
        });
        
        if (added > 0) {
            UIUtils.showToast(`成功添加 ${added} 条记录`);
            document.getElementById('batchInput').value = '';
            UIUtils.closeModal('batchAddModal');
            this.renderItemsList();
            calculateTotals();
            updatePreview();
        } else {
            UIUtils.showToast('未添加任何记录，请检查格式', 'error');
        }
    }
};

// 计算总额
function calculateTotals() {
    let subtotal = 0;
    QuotationConfig.items.forEach(item => {
        subtotal += item.price * item.quantity * item.discount;
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const orderDiscount = parseFloat(document.getElementById('orderDiscount').value) || 1;
    const taxAmount = subtotal * taxRate;
    const finalTotal = (subtotal + taxAmount) * orderDiscount;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('finalTotal').textContent = formatCurrency(finalTotal);
}

// 格式化货币
function formatCurrency(amount) {
    const currency = document.getElementById('currency')?.value || 'CNY';
    const symbol = QuotationConfig.currencySymbols[currency] || '¥';
    return symbol + amount.toFixed(2);
}

// 币种变化处理
function onCurrencyChange() {
    calculateTotals();
    ItemManager.renderItemsList();
    updatePreview();
}
