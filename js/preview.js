// 预览模块
function updatePreview() {
    const preview = document.getElementById('quotationPreview');
    // 从配置中读取我方信息
    const myCompanyName = QuotationConfig.config.defaultCompanyName || '公司名称';
    const myContact = QuotationConfig.config.defaultContact || '';
    const myPhone = QuotationConfig.config.defaultPhone || '';
    const myAddress = QuotationConfig.config.defaultAddress || '';
    const logoData = QuotationConfig.config.logoData || '';

    const customerName = document.getElementById('customerName').value || '客户名称';
    const customerContact = document.getElementById('customerContact').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerEmail = document.getElementById('customerEmail').value;

    const quoteNumber = document.getElementById('quoteNumber').value;
    const quoteDate = document.getElementById('quoteDate').value;
    const validityDays = document.getElementById('validityDays').value;
    const currency = document.getElementById('currency').value;

    const expiryDate = new Date(quoteDate);
    expiryDate.setDate(expiryDate.getDate() + parseInt(validityDays || 30));

    const symbol = QuotationConfig.currencySymbols[currency] || '¥';
    const currencyName = QuotationConfig.currencyNames[currency] || '人民币';

    // 生成商品明细HTML
    let itemsHtml = '';
    if (QuotationConfig.items.length > 0) {
        itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; table-layout: fixed;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 40px;">序号</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; width: 25%;">商品名称</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; width: 15%;">规格</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 60px;">单位</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; width: 100px;">单价</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 60px;">数量</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; width: 100px;">金额</th>
                    </tr>
                </thead>
                <tbody>
                    ${QuotationConfig.items.map((item, index) => {
                        const amount = item.price * item.quantity * item.discount;
                        return `
                            <tr>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${index + 1}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; word-wrap: break-word; overflow-wrap: break-word;">${item.name}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; word-wrap: break-word; overflow-wrap: break-word;">${item.spec || '-'}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.unit}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${symbol}${item.price.toFixed(2)}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${symbol}${amount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = '<p style="text-align: center; color: #9ca3af; padding: 40px;">暂无商品明细</p>';
    }

    // 生成条款HTML
    let termsHtml = '';
    const checkedTerms = QuotationConfig.presetTerms.filter(t => t.checked);
    if (checkedTerms.length > 0) {
        termsHtml = `
            <div style="margin-top: 20px;">
                <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">附加条款：</h4>
                <ul style="font-size: 12px; line-height: 1.8; padding-left: 20px;">
                    ${checkedTerms.map(term => `<li>${term.text}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // 生成备注HTML
    const customRemarks = document.getElementById('customRemarks').value;
    let remarksHtml = '';
    if (customRemarks) {
        remarksHtml = `
            <div style="margin-top: 16px;">
                <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">备注：</h4>
                <p style="font-size: 12px; line-height: 1.6; white-space: pre-wrap;">${customRemarks}</p>
            </div>
        `;
    }

    // 计算汇总金额（与 calculateTotals 保持一致）
    let subtotalValue = 0;
    QuotationConfig.items.forEach(item => {
        subtotalValue += item.price * item.quantity * item.discount;
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate')?.value) || 0;
    const orderDiscount = parseFloat(document.getElementById('orderDiscount')?.value) || 1;
    const taxAmountValue = subtotalValue * taxRate;
    const finalTotalValue = (subtotalValue + taxAmountValue) * orderDiscount;
    
    const subtotal = symbol + subtotalValue.toFixed(2);
    const taxAmount = symbol + taxAmountValue.toFixed(2);
    const finalTotal = symbol + finalTotalValue.toFixed(2);

    // 生成我方公司信息行
    let companyInfoLine = '';
    if (myContact || myPhone) {
        const contactParts = [];
        if (myContact) contactParts.push(`联系人：${myContact}`);
        if (myPhone) contactParts.push(`联系电话：${myPhone}`);
        companyInfoLine = `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${contactParts.join('  ')}</p>`;
    }
    
    let addressLine = '';
    if (myAddress) {
        addressLine = `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">联系地址：${myAddress}</p>`;
    }

    // 生成预览HTML
    preview.innerHTML = `
        <div style="font-family: 'Noto Sans SC', sans-serif; color: #1f2937; line-height: 1.6;">
            <!-- 头部 -->
            <div style="text-align: left; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
                <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">${myCompanyName}报价单</h1>
                ${companyInfoLine}
                ${addressLine}
            </div>

            <!-- 报价信息 -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px;">
                <div>
                    <p><strong>报价单号：</strong>${quoteNumber || '-'}</p>
                    <p><strong>报价日期：</strong>${quoteDate || '-'}</p>
                    <p><strong>有效期至：</strong>${expiryDate.toLocaleDateString('zh-CN')}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 14px;"><strong>币种：</strong>${currencyName} (${currency})</p>
                </div>
            </div>

            <!-- 客户信息 - 只保留客户区域，根据内容伸缩 -->
            ${(customerName || customerContact || customerPhone || customerAddress || customerEmail) ? `
                <div style="margin-bottom: 20px; ${(!customerContact && !customerPhone && !customerAddress && !customerEmail) ? 'display: inline-block;' : ''}">
                    <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px; ${(!customerContact && !customerPhone && !customerAddress && !customerEmail) ? 'display: inline-block; min-width: 200px;' : ''}">
                        <h3 style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 8px;">客户信息</h3>
                        ${customerName ? `<p style="font-weight: 500;">${customerName}</p>` : ''}
                        ${customerContact ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">联系人：${customerContact}</p>` : ''}
                        ${customerPhone ? `<p style="font-size: 12px; color: #6b7280;">电话：${customerPhone}</p>` : ''}
                        ${customerAddress ? `<p style="font-size: 12px; color: #6b7280;">地址：${customerAddress}</p>` : ''}
                        ${customerEmail ? `<p style="font-size: 12px; color: #6b7280;">邮箱：${customerEmail}</p>` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- 商品明细 -->
            ${itemsHtml}

            <!-- 金额汇总 -->
            <div style="margin-top: 20px; text-align: right; font-size: 12px;">
                <table style="margin-left: auto; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 4px 12px;">小计：</td>
                        <td style="padding: 4px 12px; font-weight: 500;">${subtotal}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px;">税额：</td>
                        <td style="padding: 4px 12px; font-weight: 500;">${taxAmount}</td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                        <td style="padding: 8px 12px; font-weight: bold; font-size: 14px;">最终报价：</td>
                        <td style="padding: 8px 12px; font-weight: bold; font-size: 14px; color: #2563eb;">${finalTotal}</td>
                    </tr>
                </table>
            </div>

            <!-- 条款和备注 -->
            ${termsHtml}
            ${remarksHtml}
        </div>
    `;
}
