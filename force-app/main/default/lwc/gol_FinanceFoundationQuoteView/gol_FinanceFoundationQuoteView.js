import { LightningElement, api } from 'lwc';
import GOL_Lease from '@salesforce/label/c.GOL_Lease';
import GOL_monthly from '@salesforce/label/c.GOL_monthly';
import GOL_Final_price_with_trade_in from '@salesforce/label/c.GOL_Final_price_with_trade_in';
import GOL_Deposits from '@salesforce/label/c.GOL_Deposits';
import GOL_Agreement_duration from '@salesforce/label/c.GOL_Agreement_duration';
import GOL_Mileage_per_annum from '@salesforce/label/c.GOL_Mileage_per_annum';
import GOL_Effective_rate from '@salesforce/label/c.GOL_Effective_rate';
import GOL_Nominal_rate from '@salesforce/label/c.GOL_Nominal_rate';
import GOL_Management_fees from '@salesforce/label/c.GOL_Management_fees';
import GOL_Total_lease_amount from '@salesforce/label/c.GOL_Total_lease_amount';
import GOL_Monthly_payment from '@salesforce/label/c.GOL_Monthly_payment';
import GOL_JLR_Id from '@salesforce/label/c.GOL_JLR_Id';
import GOL_VAT_label from '@salesforce/label/c.GOL_VAT_label';
import GOL_Lorem_Text from '@salesforce/label/c.GOL_Lorem_Text';
import GOL_Modify_button from '@salesforce/label/c.GOL_Modify_button';
import GOL_Open_New_Calculator_Button from '@salesforce/label/c.GOL_Open_New_Calculator_Button';
import GOL_Finance_Calculation from '@salesforce/label/c.GOL_Finance_Calculation';
import GOL_Alternative_finance_calculation from '@salesforce/label/c.GOL_Alternative_finance_calculation';
import GOL_Go_To_Overview from '@salesforce/label/c.GOL_Go_To_Overview';
import GOL_Event_New_Calculator from '@salesforce/label/c.GOL_Event_New_Calculator';
import GOL_Event_Go_To_Overview from '@salesforce/label/c.GOL_Event_Go_To_Overview';
import GOL_Event_Go_To_Modify from '@salesforce/label/c.GOL_Event_Go_To_Modify';
import GOL_Event_Go_To_Alternative_Modify from '@salesforce/label/c.GOL_Event_Go_To_Alternative_Modify';

import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class gol_FinanceFoundationQuoteView extends LightningElement {
    @api financeInformationId;
    @api ContactId;
    @api ContactId2;
    @api QuotePrice;
    @api financeInfoRecord;
    @api financeInformationRecord;
    @api alternativeFinanceInformationRecord;
    @api buttonAction;
    @api modifyFinanceQuoteId;
   
    label = {
        GOL_Lease,
        GOL_monthly,
        GOL_Final_price_with_trade_in,
        GOL_Deposits,
        GOL_Agreement_duration,
        GOL_Mileage_per_annum,
        GOL_Effective_rate,
        GOL_Nominal_rate,
        GOL_Management_fees,
        GOL_Total_lease_amount,
        GOL_Monthly_payment,
        GOL_JLR_Id,
        GOL_VAT_label,
        GOL_Lorem_Text,
        GOL_Modify_button,
        GOL_Open_New_Calculator_Button,
        GOL_Finance_Calculation,
        GOL_Alternative_finance_calculation,
        GOL_Go_To_Overview,
        GOL_Event_New_Calculator,
        GOL_Event_Go_To_Overview,
        GOL_Event_Go_To_Modify,
        GOL_Event_Go_To_Alternative_Modify
    }

    
    connectedCallback() {
        if (this.alternativeFinanceInformationRecord) {
            // console.log('alternativeFinanceInformationRecord exists');
            // console.log('Alternative Finance Information NK', this.alternativeFinanceInformationRecord?.GOL_JLR_ID__c);
            // console.log('Finance Record Currency', this.alternativeFinanceInformationRecord?.CurrencyIsoCode);
            this.showAlternativeFinance = true;
        } else {
            // console.log('alternativeFinanceInformationRecord does not exist');
            this.showAlternativeFinance = false;
        }
    }    

    // handleBackToFianceCalculator() {
    //     console.log('Dispatching ContactId and FlowNavigationNextEvent', this.ContactId);
    //     this.dispatchEvent(new FlowAttributeChangeEvent('ContactId', this.ContactId));
    //     this.dispatchEvent(new FlowAttributeChangeEvent('ContactId2', this.ContactId2));
    //     console.log('ContactId1', this.ContactId1);
    //     console.log('ContactId2', this.ContactId2);
    //     this.handleNavigationBack();
    // }
    
    // handleNavigationBack(){
    //     const flowNavigationEvent = new FlowNavigationNextEvent();
    //     this.dispatchEvent(flowNavigationEvent);
    // }

    handleNavigationBackFromNewCalculator() {
        console.log('Before financeInformationId:', this.financeInformationId);
        // console.log('ContactId:', this.ContactId);
        // console.log('ContactId2:', this.ContactId2);
        // console.log('financeInfoRecord:', this.financeInfoRecord);
        // console.log('financeInformationRecord:', this.financeInformationRecord);
        // console.log('alternativeFinanceInformationRecord:', this.alternativeFinanceInformationRecord);
        // console.log('buttonAction:', this.buttonAction);

        // const flowNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(new FlowAttributeChangeEvent('ContactId2', this.ContactId2));
        
        // this.dispatchEvent(flowNavigationEvent);
        console.log('Dispatching ContactId2 and FlowNavigationNextEvent', this.ContactId2);
        const action = new FlowAttributeChangeEvent('buttonAction', this.label.GOL_Event_New_Calculator);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
        // console.log('After financeInformationId:', this.financeInformationId);
        // console.log('ContactId:', this.ContactId);
        // console.log('ContactId2:', this.ContactId2);
        // console.log('financeInfoRecord:', this.financeInfoRecord);
        // console.log('financeInformationRecord:', this.financeInformationRecord);
        // console.log('alternativeFinanceInformationRecord:', this.alternativeFinanceInformationRecord);
       console.log('buttonAction:', this.buttonAction);

        // this.ContactId = null;
    }

    handleGoToOverviewClick() {
        console.log('Go to Overview clicked');
        // const flowNavigationEvent = new FlowNavigationNextEvent();
        // this.dispatchEvent(new FlowAttributeChangeEvent('ContactId2', this.ContactId2));
        // this.dispatchEvent(flowNavigationEvent);

        const action = new FlowAttributeChangeEvent('buttonAction', this.label.GOL_Event_Go_To_Overview);
        this.dispatchEvent(action);
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

    // handleModifyClick() {
    //     console.log('Modify button clicked for JLR ID');
    //     alert('123');
    //     // const action = new FlowAttributeChangeEvent('buttonAction', 'gotoModify');
    //     // this.dispatchEvent(action);
    //     // const nextEvent = new FlowNavigationNextEvent();
    //     // this.dispatchEvent(nextEvent);
    // }

    handleQuoteModifyEvent(event) {
        console.log('Modify event received in parent for JLR ID:', event.detail.financeId);
        this.dispatchModifyQuoteId(this.financeInformationRecord.Id);
        this.dispatchModifyButtonEvent(this.label.GOL_Event_Go_To_Modify);
        this.dispatchFlowNavigationNextEvent();
    }

    handleAlternativeQuoteModifyEvent(event) {
        console.log('Modify event received in parent for JLR ID:', event.detail.financeId);
        this.dispatchModifyQuoteId(this.alternativeFinanceInformationRecord.Id);
        this.dispatchModifyButtonEvent(this.label.GOL_Event_Go_To_Alternative_Modify);
        this.dispatchFlowNavigationNextEvent();
    }

    dispatchModifyQuoteId(id){
        const action = new FlowAttributeChangeEvent('modifyFinanceQuoteId', id);
        this.dispatchEvent(action);
    }

    dispatchModifyButtonEvent(button){
        const action = new FlowAttributeChangeEvent('buttonAction', button);
        this.dispatchEvent(action);
    }

    dispatchFlowNavigationNextEvent(){
        const nextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextEvent);
    }

}