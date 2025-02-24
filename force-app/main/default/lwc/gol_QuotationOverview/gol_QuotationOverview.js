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
import GOL_Row_Clicked_Event from '@salesforce/label/c.GOL_Row_Clicked_Event';
import GOL_Update_Button_Clicked_Event from '@salesforce/label/c.GOL_Update_Button_Clicked_Event';
import GOL_Send_to_Bank_Button_Clicked_Event from '@salesforce/label/c.GOL_Send_to_Bank_Button_Clicked_Event';
import GOL_Open_Button_Clicked_Event from '@salesforce/label/c.GOL_Open_Button_Clicked_Event';
import GOL_New_Calculation_Button_Clicked_Event from '@salesforce/label/c.GOL_New_Calculation_Button_Clicked_Event';

import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class golQuotationOverview extends LightningElement {
    @api buttonActionForOverview;
    @api modifyFinanceQuoteIdFromOverview;
    @api financeInformationRecordFromOverview;
    @api FinanceInfoRecords;
    selectedRecords = [];
    showError = false;
    @track sortedField = 'LastModifiedDate';
    @track sortOrder = 'desc';

    label = {
        GOL_Quotation_overview,
        GOL_New_Calculation_Button,
        GOL_Update_Quote_Button,
        GOL_Open_Quote_Button,
        GOL_Send_To_Bank_Button,
        GOL_Link_To_Pf_PoS,
        GOL_Link_To_Arval_Pos,
        GOL_Row_Clicked_Event,
        GOL_Update_Button_Clicked_Event,
        GOL_Send_to_Bank_Button_Clicked_Event,
        GOL_Open_Button_Clicked_Event,
        GOL_New_Calculation_Button_Clicked_Event

    };

    get formattedRecords() {
        if (!this.FinanceInfoRecords) return [];

        let sortedRecords = [...this.FinanceInfoRecords];

        if (this.sortedField) {
            sortedRecords.sort((a, b) => {
                let valA = a[this.sortedField] || '';
                let valB = b[this.sortedField] || '';

                if (this.sortedField === 'LastModifiedDate') {
                    valA = new Date(valA).getTime() || 0;
                    valB = new Date(valB).getTime() || 0;
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }


        return sortedRecords.map(record => ({
            ...record,
            formattedDate: this.formatDate(record.LastModifiedDate),
            formattedMonthly: this.formatCurrency(record.ERPT_FIN_InstallmentIntGrossAmt__c)
        }));
    }

    handleSort(event) {
        const field = event.target.dataset.field;

        if (this.sortedField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedField = field;
            this.sortOrder = 'asc';
        }
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
            const formattedAmount = new Intl.NumberFormat(LOCALE, {
                style: 'currency',
                currency: CURRENCY,
                currencyDisplay: 'symbol',
                useGrouping: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
            return formattedAmount;
        } catch (error) {
            console.error('Error formatting currency:', error);
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
        const financeInformationRecordFromOverview = event.target.dataset.recordid;
        console.log('Clicked JLR ID - Record ID:', financeInformationRecordFromOverview);
        this.dispatchModifyQuoteId(financeInformationRecordFromOverview);
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Row_Clicked_Event);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }
    
    dispatchModifyQuoteId(id) {
        const action = new FlowAttributeChangeEvent('modifyFinanceQuoteIdFromOverview', id);
        this.dispatchEvent(action);
    }    

    handleUpdateClick() {
        // console.log("Update Button Clicked!");
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Update_Button_Clicked_Event);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    handleSendToBankClick() {
        console.log("Send to Bank Button Clicked!");
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Send_to_Bank_Button_Clicked_Event);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    handleOpenClick() {
        const selectedDetails = this.formattedRecords
            .filter(record => this.selectedRecords.includes(record.Id))
            .map(record => ({
                RecordID: record.Id,
                JLR_ID: record.GOL_JLR_ID__c
            }));
        console.log("Open Button Clicked! Selected Records:", JSON.parse(JSON.stringify(selectedDetails)));
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Open_Button_Clicked_Event);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    handleNewCalculationClick() {
        // console.log("New Calculation Button Clicked");
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_New_Calculation_Button_Clicked_Event);
        console.log("Dispatching FlowAttributeChangeEvent:", JSON.stringify(action, null, 2));
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }
}