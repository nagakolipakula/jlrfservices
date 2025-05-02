import { LightningElement, api, track, wire } from 'lwc';
import LOCALE from "@salesforce/i18n/locale";
import CURRENCY from "@salesforce/i18n/currency";
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
import GOL_FS_ShowMinUpdateError from '@salesforce/label/c.GOL_FS_ShowMinUpdateError';
import GOL_FS_ShowMaxUpdateError from '@salesforce/label/c.GOL_FS_ShowMaxUpdateError';
import GOL_FS_showMinSelectionToOpen from '@salesforce/label/c.GOL_FS_showMinSelectionToOpen';
import GOL_FS_showMaxSelectionToOpen from '@salesforce/label/c.GOL_FS_showMaxSelectionToOpen';
import GOl_FS_showMinSendToBankError from '@salesforce/label/c.GOl_FS_showMinSendToBankError';
import GOL_FS_showMaxSendToBankError from '@salesforce/label/c.GOL_FS_showMaxSendToBankError';
import GOL_Link_To_Pf_Pos_Leasing from '@salesforce/label/c.GOL_Link_To_Pf_Pos_Leasing';
import GOL_FS_Overview from '@salesforce/label/c.GOL_FS_Overview'; //GOL-3355
import GOL_Date_and_time from '@salesforce/label/c.GOL_Date_and_time'; //GOL-3355
import GOL_Campaign from '@salesforce/label/c.GOL_Campaign'; //GOL-3355
import GOL_FS from '@salesforce/label/c.GOL_FS'; //GOL-3355
import 	GOL_Monthy from '@salesforce/label/c.GOL_Monthy'; //GOL-3355
import GOL_Status from '@salesforce/label/c.GOL_Status'; //GOL-3355

// import GOL_Save_Button from '@salesforce/label/c.GOL_Save_Button';
// import GOL_Save_Button_Clicked_Event from '@salesforce/label/c.GOL_Save_Button_Clicked_Event';



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
    @api quoteId;
    @api dmlMessageCheck;
    @api FSPosLeaseURL;
    showMinSelectionToOpen;
    showMaxSelectionToOpen;
    showMinUpdateError;
    showMaxUpdateError;
    showMinSendToBankError;
    showMaxSendToBankError;
    selectedRecords = [];
    showError = false;
    @track sortedField = 'LastModifiedDate';
    @track sortOrder = 'desc';
    @track isLoading = false;
    @track wiredFinanceInfoResult;
    @api showFSPosLeaseURL = false;
    @track isSpecificCountryVisible = false;
    // @track internalFinanceRecords = [];

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
        GOL_New_Calculation_Button_Clicked_Event,
        GOL_FS_ShowMinUpdateError,
        GOL_FS_ShowMaxUpdateError,
        GOL_FS_showMinSelectionToOpen,
        GOL_FS_showMaxSelectionToOpen,
        GOl_FS_showMinSendToBankError,
        GOL_FS_showMaxSendToBankError,
        GOL_Link_To_Pf_Pos_Leasing,
        GOL_FS_Overview,
        GOL_Date_and_time,
        GOL_Campaign,
        GOL_FS,
        GOL_Monthy,
        GOL_Status
    };

    @wire(getFinanceInfoRecords, { quoteId: '$quoteId' })
    wiredFinanceInfo(result) {
        this.wiredFinanceInfoResult = result;
        const { data, error } = result;

        if (data) {
            this.FinanceInfoRecords = data;
        } else if (error) {
            console.error('Wire error:', error);
        }
    }

    connectedCallback() {
        setTimeout(() => {
            if (this.wiredFinanceInfoResult) {
                refreshApex(this.wiredFinanceInfoResult)
                    .then(() => {
                        console.log('Refreshed in connectedCallback');
                    })
                    .catch(err => {
                        console.error('Refresh failed:', err);
                    });
            } else {
                console.warn('wiredFinanceInfoResult not ready yet');
            }
        }, 0);
        console.log('FSArvalURL: ' + this.FSArvalURL);
        console.log('FSPosRetailURL: ' + this.FSPosRetailURL);
    }

    // getFinanceRecords(quoteId) {
    //     console.log('Fetching finance records for quoteId:', quoteId);
    //     this.isLoading = true;

    //     getFinanceInfoRecords({ quoteId })
    //         .then((result) => {
    //             this.internalFinanceRecords = result;
    //             this.FinanceInfoRecords = result;
    //             console.log('Refetched finance records:', result);
    //         })
    //         .catch((error) => {
    //             console.error('Failed to fetch finance records:', error);
    //         })
    //         .finally(() => {
    //             this.isLoading = false;
    //         });
    // }    

    get formattedRecords() {
        if (!this.FinanceInfoRecords || this.FinanceInfoRecords.length === 0) return [];

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
            formattedMonthly: this.formatCurrency(record.ERPT_FIN_InstallmentIntGrossAmt__c),
            productName: record.GOL_FIN_Finance_Product_Description__c ||
                         record.LMS_FIN_ProdName__c,
            jlrId: record.GOL_JLR_QUOTE_FIN_ID__c ||
                   record.GOL_JLR_ID__c
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
                day: '2-digit', month: '2-digit', year: 'numeric', hour12: false
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
        if (this.selectedRecords.length >= 99) {
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
            this.showMinUpdateError = true;
            setTimeout(() => {
                this.showMinUpdateError = false;
            }, 3000);
            // this.showToast('Error', 'Please select at least one record.', 'error');
            // this.dispatchFlowAttributeAndNext('dmlMessageCheck', 'NoRecordsFound');
            return;
        }

        if (this.selectedRecords.length > 99) {
            this.showMaxUpdateError = true;
            setTimeout(() => {
                this.showMaxUpdateError = false;
            }, 3000);
            return;
        }

        const recordsWithCreatedStatus = this.formattedRecords.filter(
            record => this.selectedRecords.includes(record.Id) && record.LMS_FIN_Status__c === 'Created'
        );

        if (recordsWithCreatedStatus.length === 0) {
            // this.showToast('Error', 'No selected records are in "CREATED" status.', 'error');
            this.dispatchFlowAttributeAndNext('dmlMessageCheck', 'NoRecordsInCreateStatus');
            return;
        }

        const financeQuoteIds = recordsWithCreatedStatus.map(record => record.Id);
        const quoteId = recordsWithCreatedStatus[0].LMS_FIN_Quote__c;
        this.isLoading = true;
        console.log('Sending to Apex -> Quote ID:', quoteId);
        console.log('Sending to Apex -> Finance Quote IDs:', financeQuoteIds);

        updateFinanceQuotes({ quoteId: quoteId, financeQuoteIds: financeQuoteIds })
            .then(() => {
                return refreshApex(this.wiredFinanceInfoResult);
            })
            .then(() => {
                console.log('Records refreshed after update');
                this.selectedRecords = [];

                const checkboxes = this.template.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = false);
                const dataTable = this.template.querySelector('lightning-datatable');
                if (dataTable) {
                    dataTable.selectedRows = [];
                }
                // this.showToast('Success', 'Finance quotes updated successfully', 'success');
                this.dispatchFlowAttributeAndNext('dmlMessageCheck', 'updatedSuccessfully');
            })
            .catch(error => {
                console.error('Apex error during update:', error);
                // this.showToast('Error', error.body?.message || 'An error occurred', 'error');
                this.dispatchFlowAttributeAndNext('dmlMessageCheck', 'updateFailed');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleSendToBankClick() {
        if (this.selectedRecords.length === 0) {
            this.showMinSendToBankError = true;
            setTimeout(() => {
                this.showMinSendToBankError = false;
            }, 3000);
            return;
        } else if (this.selectedRecords.length > 1) {
            this.showMaxSendToBankError = true;
            setTimeout(() => {
                this.showMaxSendToBankError = false;
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
            this.showMinSelectionToOpen = true;
            setTimeout(() => {
                this.showMinSelectionToOpen = false;
            }, 3000);
            return;
        } else if (this.selectedRecords.length > 2) {
            this.showMaxSelectionToOpen = true;
            setTimeout(() => {
                this.showMaxSelectionToOpen = false;
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
            console.log('Dispatching OpenFinanceQuoteId', selectedDetails[0]);
            let a = selectedDetails[0].RecordID;
            console.log('a ' + a);
            const actionOne = new FlowAttributeChangeEvent('openFinanceQuoteIdOne', a);
            this.dispatchEvent(actionOne);
            // this.dispatchOpenFinanceQuoteId(selectedDetails[0], 'openFinanceQuoteIdOne');
        }

        if (selectedDetails.length > 1) {
            console.log('Dispatching OpenFinanceQuoteId', selectedDetails[1]);
            let b = selectedDetails[1];
            console.log('b ' + b);
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
        this.dispatchFlowAttributeAndNext('buttonActionForOverview', this.label.GOL_New_Calculation_Button_Clicked_Event);
    }

    // showToast(title, message, variant = 'info') {
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: title,
    //             message: message,
    //             variant: variant
    //         })
    //     );
    // }

    navigateNext() {
        this.dispatchEvent(new FlowNavigationNextEvent());
    }

    setFlowAttribute(name, value) {
        this.dispatchEvent(new FlowAttributeChangeEvent(name, value));
    }

    dispatchFlowAttributeAndNext(name, value) {
        this.setFlowAttribute(name, value);
        this.navigateNext();
    }
}