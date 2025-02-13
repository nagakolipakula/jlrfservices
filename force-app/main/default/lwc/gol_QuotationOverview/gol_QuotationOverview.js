import { LightningElement, api, track } from 'lwc';
import LOCALE from "@salesforce/i18n/locale";
import CURRENCY from "@salesforce/i18n/currency";
import GOL_Quotation_overview from '@salesforce/label/c.GOL_Quotation_overview';
import GOL_New_Calculation_Button from '@salesforce/label/c.GOL_New_Calculation_Button';
import GOL_Update_Quote_Button from '@salesforce/label/c.GOL_Update_Quote_Button';
import GOL_Open_Quote_Button from '@salesforce/label/c.GOL_Open_Quote_Button';
import GOL_Send_To_Bank_Button from '@salesforce/label/c.GOL_Send_To_Bank_Button';
import GOL_Link_To_Pf_PoS from '@salesforce/label/c.GOL_Link_To_Pf_PoS';
import GOL_Link_To_Arval_Pos from '@salesforce/label/c.GOL_Link_To_Arval_Pos';

export default class QuotationOverview extends LightningElement {
    @api buttonActionForOverview;
    @api FinanceInfoRecords;
    selectedRecords = [];
    showError = false;

    label = {
        GOL_Quotation_overview,
        GOL_New_Calculation_Button,
        GOL_Update_Quote_Button,
        GOL_Open_Quote_Button,
        GOL_Send_To_Bank_Button,
        GOL_Link_To_Pf_PoS,
        GOL_Link_To_Arval_Pos
    };

    get formattedRecords() {
        if (!this.FinanceInfoRecords) return [];

        return this.FinanceInfoRecords.map(record => ({
            ...record,
            formattedDate: this.formatDate(record.CreatedDate),
            formattedMonthly: this.formatCurrency(record.ERPT_FIN_InstallmentIntGrossAmt__c)
        }));
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString(LOCALE, {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            });
        } catch {
            return 'Invalid Date';
        }
    }

    formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    
        try {
            return new Intl.NumberFormat(LOCALE, {
                style: 'currency', 
                currency: CURRENCY,
                currencyDisplay: 'symbol',
                useGrouping: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount).replace(',', 'X').replace('.', ',').replace('X', '.'); 
        } catch {
            return 'Invalid Amount';
        }
    }

    handleRowSelection(event) {
        const recordId = event.target.dataset.id;
        let updatedSelection = [...this.selectedRecords];
    
        if (event.target.checked) {
            if (updatedSelection.length >= 2) {
                event.target.checked = false;
                console.error("Cannot select more than 2 records");
                return;
            }
            updatedSelection.push(recordId);
        } else {
            updatedSelection = updatedSelection.filter(id => id !== recordId);
        }
    
        this.selectedRecords = updatedSelection;
    }  

    handleJlrIdClick(event) {
        const recordId = event.target.dataset.recordid;
        console.log('Clicked JLR ID - Record ID:', recordId);
    }

    handleUpdateClick() {
        const selectedDetails = this.formattedRecords
        .filter(record => this.selectedRecords.includes(record.Id))
        .map(record => ({
            RecordID: record.Id,
            JLR_ID: record.GOL_JLR_ID__c
        }));
        console.log("Update Button Clicked! Selected Records:", JSON.parse(JSON.stringify(selectedDetails)));        
    }
}