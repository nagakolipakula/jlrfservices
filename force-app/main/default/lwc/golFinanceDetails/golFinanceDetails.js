import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import getFieldMappings from '@salesforce/apex/GOL_FS_ViewQuoteFieldMappingController.getFieldMappings';

export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;
    legaltext;
    IsNotCreated = false;
    fieldMappings = [];
    processedFieldMappings = [];

    connectedCallback(){
        if(this.financeRecord && this.financeRecord.ERPT_FIN_LegalText__c){
            var legalTextVal = this.financeRecord.ERPT_FIN_LegalText__c;
            console.log('MS legalTextVal==> '+legalTextVal);
        this.legaltext = legalTextVal.replaceAll('[','<').replaceAll(']','>').trim();
        }
        this.checkFinanceInformationRecordStatus();

        if (this.financeRecord && this.financeRecord.Id) {
            console.log('financeRecord Id:', this.financeRecord.Id);
            this.fetchFieldMappings(this.financeRecord);
        } else {
            console.error('financeRecord Id is NULL');
        }
    }
    checkFinanceInformationRecordStatus(){
        if(this.financeRecord && this.financeRecord.LMS_FIN_Status__c !== 'Created'){
            this.IsNotCreated = true;
        }
    }
    handleModifyClick() {
        console.log('Modify button clicked for JLR ID:', JSON.stringify(this.financeRecord, null, 2));
        const modifyFSRecordEvent = new CustomEvent('modify', {
            detail: {
                financeId: this.financeRecord
            }
        });
        // const flowNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(modifyFSRecordEvent);
        // this.dispatchEvent(flowNavigationEvent);
    }

    fetchFieldMappings(financeRecord) {
        console.log('Calling Apex getFieldMappings with financeRecord:', JSON.stringify(financeRecord, null, 2));

        getFieldMappings({ financeRecord })
            .then((result) => {
                console.log('Apex Response:', JSON.stringify(result, null, 2));

                if (result && result.fieldMappings) {
                    let tempMappings = result.fieldMappings
                        .map((rec) => ({
                            fieldLabel: rec.Field_Name__c,
                            fieldApi: rec.Field_Name_in_FSDev__c,
                            sequence: rec.Sequence__c || 999
                        }))
                        .sort((a, b) => a.sequence - b.sequence);

                    console.log('Processed Field Mappings:', JSON.stringify(tempMappings, null, 2));

                    this.processedFieldMappings = [...tempMappings.map((mapping) => ({
                        label: mapping.fieldLabel,
                        value: this.getFieldValue(this.financeRecord, mapping.fieldApi)
                    }))];

                    console.log('Final Processed Field Mappings:', JSON.stringify(this.processedFieldMappings, null, 2));
                } else {
                    console.warn('No field mappings found.');
                    this.processedFieldMappings = [];
                }
            })
            .catch((error) => {
                console.error('Apex getFieldMappings FAILED:', error);
            });
    }

    getFieldValue(record, fieldApi) {
        try {
            if (!record) return 'N/A';
            if (!fieldApi) return 'N/A';

            let value = record[fieldApi];
            console.log(`Getting value for ${fieldApi}:`, value);
            return value !== undefined && value !== null ? value : 'N/A';
        } catch (error) {
            console.error(`Error in Getting value for ${fieldApi}:`, error);
            return 'N/A';
        }
    }
}