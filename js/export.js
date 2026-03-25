// 导出功能模块
const ExportManager = {
    // 创建临时容器用于导出
    _createExportContainer(element) {
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 794px;
            background: white;
            padding: 40px;
            box-sizing: border-box;
            z-index: -9999;
        `;
        tempContainer.innerHTML = element.innerHTML;
        document.body.appendChild(tempContainer);
        return tempContainer;
    },

    // 清理临时容器
    _removeExportContainer(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    },

    // 导出PDF
    async exportPDF() {
        UIUtils.showLoading('正在生成PDF...');
        let tempContainer = null;
        try {
            const { jsPDF } = window.jspdf;
            const element = document.getElementById('quotationPreview');
            
            // 创建临时容器，确保固定宽度渲染
            tempContainer = this._createExportContainer(element);
            
            // 等待渲染完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const canvas = await html2canvas(tempContainer, { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: tempContainer.scrollHeight,
                windowWidth: 794,
                windowHeight: tempContainer.scrollHeight
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const x = (pdfWidth - imgWidth * ratio) / 2;
            const y = 10;
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);
            
            if (QuotationConfig.config.pdfWatermark) { 
                pdf.setFontSize(40); 
                pdf.setTextColor(200, 200, 200); 
                pdf.text('报价单', pdfWidth / 2, pdfHeight / 2, { align: 'center', angle: 45 }); 
            }
            
            pdf.save(`报价单_${document.getElementById('quoteNumber').value}.pdf`);
            
            UIUtils.showToast('PDF导出成功！');
        } catch (error) { 
            UIUtils.showToast('PDF导出失败：' + error.message, 'error'); 
            console.error(error);
        } finally { 
            this._removeExportContainer(tempContainer);
            UIUtils.hideLoading(); 
        }
    },

    // 导出图片
    async exportImage() {
        UIUtils.showLoading('正在生成图片...');
        let tempContainer = null;
        try {
            const element = document.getElementById('quotationPreview');
            
            // 创建临时容器，确保固定宽度渲染
            tempContainer = this._createExportContainer(element);
            
            // 等待渲染完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const canvas = await html2canvas(tempContainer, { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: tempContainer.scrollHeight,
                windowWidth: 794,
                windowHeight: tempContainer.scrollHeight
            });
            
            const link = document.createElement('a'); 
            link.download = `报价单_${document.getElementById('quoteNumber').value}.png`; 
            link.href = canvas.toDataURL(); 
            link.click();
            
            UIUtils.showToast('图片导出成功！');
        } catch (error) { 
            UIUtils.showToast('图片导出失败：' + error.message, 'error'); 
            console.error(error);
        } finally { 
            this._removeExportContainer(tempContainer);
            UIUtils.hideLoading(); 
        }
    },

    // 显示导出模态框
    showExportModal() {
        // 先保存为已报价状态
        this.saveToHistory('quoted');
        UIUtils.showToast('已生成报价记录');
        document.getElementById('exportModal').classList.remove('hidden');
    },

    // 保存到报价历史
    saveToHistory(status) {
        const quotation = collectFormData();
        quotation.status = status;
        quotation.createdAt = new Date().toISOString();
        quotation.id = Date.now().toString();
        QuotationConfig.libraries.history.unshift(quotation);
        QuotationConfig.saveLibraries();
    }
};
