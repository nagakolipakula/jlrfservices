import { LightningElement, api, track, wire } from 'lwc';
import LOCALE from "@salesforce/i18n/locale";
import CURRENCY from "@salesforce/i18n/currency";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getFinanceInfoRecords from '@salesforce/apex/GOL_GetUpdatedFinanceQuote.getFinanceInfoRecords';
import updateFinanceQuotes from '@salesforce/apex/GOL_GetUpdatedFinanceQuote.updateFinanceQuotes';

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
    @api openFinanceQuoteIdOne;
    @api openFinanceQuoteIdTwo;
    @api FSArvalURL;
    @api FSPosRetailURL;
    showMaxSelectionError;
    showMinSelectionError;
    showMaxUpdateError;
    showMinUpdateError;
    selectedRecords = [];
    showError = false;
    @track sortedField = 'LastModifiedDate';
    @track sortOrder = 'desc';
    // @track wiredFinanceInfoResult;

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

    @wire(getFinanceInfoRecords)
    wiredFinanceInfo(result) {
        this.wiredFinanceInfoResult = result;
        const { data, error } = result;
    
        if (data) {
            this.FinanceInfoRecords = data;
        } else if (error) {
            console.error('Wire error:', error);
        }
    }
    
    connectedCallback(){
        refreshApex(this.wiredFinanceInfoResult);
        console.log('FSArvalURL: ' + this.FSArvalURL);
        console.log('FSPosRetailURL: ' + this.FSPosRetailURL);
        console.log('modifyFinanceQuoteIdFromOverview:');
    }

    // connectedCallback(){
    //     console.log('FSPosRetailURL: ' + this.FSPosRetailURL);
    //     console.log('modifyFinanceQuoteIdFromOverview:');
    // }

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
        console.log('selected record id:', recordId);
        console.log('selected records:', this.selectedRecords);
        let updatedSelection = [...this.selectedRecords];

        if (event.target.checked) {
            if (updatedSelection.length >= 99) {
                event.target.checked = false;
                console.error("Cannot select more than 99 records");
                this.showMaxSelectionError = true;
                return;
            }
            updatedSelection.push(recordId);
        } else {
            updatedSelection = updatedSelection.filter(id => id !== recordId);
        }

        this.selectedRecords = updatedSelection;
        if (this.selectedRecords.length>= 99) {
            this.showMaxSelectionError = false;
        }
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
        if (this.selectedRecords.length === 0) {
            this.showToast('Error', 'Please select at least one record.', 'error');
            return;
        }
    
        const recordsWithCreatedStatus = this.formattedRecords.filter(
            record => this.selectedRecords.includes(record.Id) && record.LMS_FIN_Status__c === 'Created'
        );
    
        if (recordsWithCreatedStatus.length === 0) {
            this.showToast('Error', 'No selected records are in "CREATED" status.', 'error');
            return;
        }
    
        const financeQuoteIds = recordsWithCreatedStatus.map(record => record.Id);
        const quoteId = recordsWithCreatedStatus[0].LMS_FIN_Quote__c;
    
        console.log('Sending to Apex -> Quote ID:', quoteId);
        console.log('Sending to Apex -> Finance Quote IDs:', financeQuoteIds);
    
        updateFinanceQuotes({ quoteId: quoteId, financeQuoteIds: financeQuoteIds })
        .then(() => {
            return refreshApex(this.wiredFinanceInfoResult);
        })
        .then(() => {
            if (this.wiredFinanceInfoResult && this.wiredFinanceInfoResult.data) {
                this.FinanceInfoRecords = [...this.wiredFinanceInfoResult.data];
                console.log('Refreshed records after update');
            } else {
                console.warn('No data found in wiredFinanceInfoResult after refresh.');
            }
            this.FinanceInfoRecords = [...this.wiredFinanceInfoResult.data];
            this.selectedRecords = [];

            const checkboxes = this.template.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            const dataTable = this.template.querySelector('lightning-datatable');
            if (dataTable) {
                dataTable.selectedRows = [];
            }
            this.showToast('Success', 'Finance quotes updated successfully', 'success');
        })
        .catch(error => {
            console.error('Apex error during update:', error);
            this.showToast('Error', error.body?.message || 'An error occurred', 'error');
        });

    }    

    handleSendToBankClick() {
        if(this.selectedRecords.length === 0) {
            this.showMinUpdateError = true;
            setTimeout(() => {
                this.showMinUpdateError = false;
            }, 3000);
            return;
        } else if (this.selectedRecords.length > 1) {
            this.showMaxUpdateError = true;
            setTimeout(() => {
                this.showMaxUpdateError = false;
            }, 3000);
            return;
        }
        const selectedRecordId = this.selectedRecords[0];
        this.dispatchModifyQuoteId(selectedRecordId);
        console.log("Send to Bank Button Clicked!");
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Send_to_Bank_Button_Clicked_Event);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    handleOpenClick() {
        if (this.selectedRecords.length === 0) {
            this.showMinSelectionError = true;
            setTimeout(() => {
                this.showMinSelectionError = false;
            }, 3000);
            return;
        } else if (this.selectedRecords.length > 2) {
            this.showMaxSelectionError = true;
            setTimeout(() => {
                this.showMaxSelectionError = false;
            }, 3000);
            return;
        }
        const selectedDetails = this.formattedRecords
            .filter(record => this.selectedRecords.includes(record.Id))
            .map(record => ({
                RecordID: record.Id
            }));
        // const tempIds = 'a1RVc000000kk1RMAQ,a1RVc000000kjzpMAA';
        console.log("Open Button Clicked! Selected Records:", JSON.parse(JSON.stringify(selectedDetails)));
        
        if (selectedDetails.length > 0) {
            console.log('Dispatching OpenFinanceQuoteId',selectedDetails[0]);
            let a = selectedDetails[0].RecordID;
            console.log('a '+a);
            const actionOne = new FlowAttributeChangeEvent('openFinanceQuoteIdOne', a);
            this.dispatchEvent(actionOne);
           // this.dispatchOpenFinanceQuoteId(selectedDetails[0], 'openFinanceQuoteIdOne');
        }
        
        if (selectedDetails.length > 1) {
            console.log('Dispatching OpenFinanceQuoteId',selectedDetails[1]);
            let b = selectedDetails[1];
            console.log('b '+b);
            const actionTwo = new FlowAttributeChangeEvent('openFinanceQuoteIdTwo', selectedDetails[1].RecordID);
            this.dispatchEvent(actionTwo);
            //this.dispatchOpenFinanceQuoteId(selectedDetails[1], 'openFinanceQuoteIdTwo');
        }

        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_Open_Button_Clicked_Event);
        // const action = new FlowAttributeChangeEvent('buttonActionForOverview', 'a1RVc000000kkELMAY');
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    showErrorMessage(message) {
        this.showError = true;
        console.error(message);
    }

    dispatchOpenFinanceQuoteId(id) {
        // console.log('Dispatching Event { ${propertyName}: "${id}" }');
        const action = new FlowAttributeChangeEvent(id);
        this.dispatchEvent(action);
    }

    handleNewCalculationClick() {
        // console.log("New Calculation Button Clicked");
        const action = new FlowAttributeChangeEvent('buttonActionForOverview', this.label.GOL_New_Calculation_Button_Clicked_Event);
        console.log("Dispatching FlowAttributeChangeEvent:", JSON.stringify(action, null, 2));
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    showToast(title, message, variant = 'info') {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    
}