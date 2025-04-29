import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import LOCALE from '@salesforce/i18n/locale';
import GOL_FS_Month_Label from '@salesforce/label/c.GOL_FS_Month_Label';
// import getFieldMappings from '@salesforce/apex/GOL_FS_ViewQuoteFieldMappingController.getFieldMappings';

export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;
    legaltext;
    IsNotCreated = false;
    quoteDetails = [];
    locale = LOCALE;
    // fieldMappings = [];
    // processedFieldMappings = [];
    fieldTypeMap = {
        downPaymentGrossAmount: 'currency',
        totalGrossAmount: 'currency',
        installmentInterestGrossAmount: 'currency',
        installmentGrossAmount: 'currency',
        installmentAndInterestTotalGrossAmount: 'currency',
        totalFinancedGrossAmount: 'currency',
        totalInterestGrossAmount: 'currency',
        installmentFirstGrossAmount: 'currency',
        installmentLastGrossAmount: 'currency',
        premiumTotalAmount: 'currency',
        aprcRate: 'percent',
        premiumPeriodAmount: 'currency',
        rate: 'percent',
        grossAmount: 'currency',
        firstInstallmentCpiCostsIncluded: 'currency',
        amountToPayEachMonthCpiCostsIncluded: 'currency',
        lastInstallmentCpiCostsIncluded: 'currency',
        amountToPayEachMonthCpiCostsNotIncluded: 'currency',
        firstInstallmentCpiCostsNotIncluded: 'currency',
        fixedCostsAndTotalInterestsGrossAmount: 'currency',
        endingValidityDate: 'months',
        fixedCostsAndToBeFinancedGrossAmount: 'currency',
        installmentAndInsuranceGrossAmount: 'currency',
        toBeFinancedGrossAmount: 'currency',
        allCostsAndFinancedAndInsuranceTotalGrossAmount: 'currency',
        remainingValueGrossAmount: 'currency',
        currentResidualValueAmount: 'currency',
        nominalRate: 'percent',
        effectiveRate: 'percent',
        annualMileage: 'km',
        duration: 'months'
    };

    connectedCallback(){
        // if(this.financeRecord && this.financeRecord.ERPT_FIN_LegalText__c){
        //     var legalTextVal = this.financeRecord.ERPT_FIN_LegalText__c;
        //     console.log('MS legalTextVal==> '+legalTextVal);
        // this.legaltext = legalTextVal.replaceAll('[','<').replaceAll(']','>').trim();
        // }
        this.processLegalText();
        this.checkFinanceInformationRecordStatus();
        this.processQuoteDetails();

        // if (this.financeRecord?.GOL_View_Quote_Details__c) {
        //     try {
        //         this.quoteDetails = JSON.parse(this.financeRecord.GOL_View_Quote_Details__c);
        //         console.log('Current user locale:', LOCALE);
        //         console.log('Parsed quoteDetails:', this.quoteDetails);
        //     } catch (error) {
        //         console.error('Error parsing GOL_View_Quote_Details__c:', error);
        //         this.quoteDetails = [];
        //     }
        // }
    }

    processLegalText() {
        if (this.financeRecord?.ERPT_FIN_LegalText__c) {
            const legalTextVal = this.financeRecord.ERPT_FIN_LegalText__c;
            this.legaltext = legalTextVal.replaceAll('[', '<').replaceAll(']', '>').trim();
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

    processQuoteDetails() {
        const quoteJson = this.financeRecord?.GOL_View_Quote_Details__c;
        if (!quoteJson) return;
    
        try {
            const quoteDetails = JSON.parse(quoteJson);
            this.quoteDetails = quoteDetails.map(detail => ({
                ...detail,
                value: this.formatUnitsForQuote(detail.id, detail.value)
            }));
            console.log('Parsed and formatted quoteDetails:', this.quoteDetails);
        } catch (error) {
            console.error('Error parsing GOL_View_Quote_Details__c:', error);
            this.quoteDetails = [];
        }
    }
    
    formatUnitsForQuote(id, value) {
        const type = this.getFieldType(id);
        switch (type) {
            case 'currency':
                return new Intl.NumberFormat(this.locale, {
                    style: 'currency',
                    currency: 'EUR'
                }).format(Number(value));
            case 'percent':
                return new Intl.NumberFormat(this.locale, {
                    style: 'percent',
                    minimumFractionDigits: 2
                }).format(Number(value) / 100);
            case 'km':
                return `${value} km`;
            case 'months':
                return `${value} ${this.getLocalizedMonthLabel()}`;
            default:
                return value;
        }
    }
    
    getFieldType(id) {
        return this.fieldTypeMap[id] || 'unknown';
    }
    
    getLocalizedMonthLabel() {
        return GOL_FS_Month_Label;
    }
}