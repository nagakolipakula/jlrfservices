import { LightningElement, api } from 'lwc';
// import { FlowAttributeChangeEvent ,FlowNavigationNextEvent } from 'lightning/flowSupport';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUSTOMCSS from '@salesforce/resourceUrl/GOL_FinanceCustomCSS';
import GOL_Customization from '@salesforce/label/c.GOL_Customization';
import GOL_Retailer_Discount from '@salesforce/label/c.GOL_Retailer_Discount';
import GOL_Percentage from '@salesforce/label/c.GOL_Percentage';
import GOL_Amount_incl_VAT from '@salesforce/label/c.GOL_Amount_incl_VAT';
import GOL_JLR_Support from '@salesforce/label/c.GOL_JLR_Support';
import GOL_Excl_VAT from '@salesforce/label/c.GOL_Excl_VAT';
import GOL_Modify_in_Everest from '@salesforce/label/c.GOL_Modify_in_Everest';
import GOL_Finance_Retailer_Discount_Update_Button from '@salesforce/label/c.GOL_Finance_Retailer_Discount_Update_Button';

export default class Gol_FinanceCustomizationComponent extends LightningElement {
    @api vehicleqlirecord;
    @api quoteId
    isCssLoaded = false;
    label = {
        GOL_Customization,
        GOL_Retailer_Discount,
        GOL_Percentage,
        GOL_Amount_incl_VAT,
        GOL_JLR_Support,
        GOL_Excl_VAT,
        GOL_Modify_in_Everest,
        GOL_Finance_Retailer_Discount_Update_Button
    };
    percentVal = 0;
    discountAmount = 0;
    discountNetAmount2 = 0;
    amountInclVal = 0;
    retailerdiscounthcss = "margin-top:0px";

    connectedCallback(){
        if(this.vehicleqlirecord !== undefined){
            console.log('vehicle : ' + JSON.stringify(this.vehicleqlirecord));
            if(this.vehicleqlirecord.LMS_QLI_DiscountPercent__c !== undefined && this.vehicleqlirecord.LMS_QLI_DiscountPercent__c != null){
            this.percentVal = this.vehicleqlirecord.LMS_QLI_DiscountPercent__c;}
            if(this.vehicleqlirecord.LMS_QLI_DiscountAmount__c !== undefined && this.vehicleqlirecord.LMS_QLI_DiscountAmount__c != null){
            this.discountAmount = this.vehicleqlirecord.LMS_QLI_DiscountAmount__c;}
            if(this.vehicleqlirecord.LMS_QLI_DiscountNetAmount2__c !== undefined && this.vehicleqlirecord.LMS_QLI_DiscountNetAmount2__c != null){
            this.discountNetAmount2 = this.vehicleqlirecord.LMS_QLI_DiscountNetAmount2__c;}
            if(this.vehicleqlirecord.LMS_QLI_TaxAdjust__c !== undefined && this.vehicleqlirecord.LMS_QLI_TaxAdjust__c != null){
            this.amountInclVal = this.vehicleqlirecord.LMS_QLI_TaxAdjust__c;}
        }
    }
    renderedCallback(){
        if(this.isCssLoaded) return      
        this.isCssLoaded = true;       
        loadStyle(this,CUSTOMCSS).then(()=>{        
            console.log('loaded');       
        })       
        .catch(error=>{        
            console.log('error to load');        
        });       
        }
    
    // handelPercentageChange(event) {
    //     if(this.percentVal == event.target.value){
    //         return;
    //     }        
    //     this.percentVal = event.target.value;      
    //     if(this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c !== undefined && this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c != null){
    //     let discNetAmt2Cal = this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c*this.percentVal/100;
    //     this.amountInclVal = discNetAmt2Cal.toFixed(2); 
    //     }
    // }
    handelPercentageChange(event) {//Discount % adjustedPrice=amountInclVal
        if(this.percentVal == event.target.value){
            return;
        } 
        this.percentVal = event.target.value;
           
        if(this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c !== undefined && this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c != null
            && this.vehicleqlirecord.LMS_QLI_NetPrice__c !=null
        ){
        let discNetAmt2Cal = this.vehicleqlirecord.LMS_QLI_NetPrice__c*this.percentVal/100;
        this.discountNetAmount2 = discNetAmt2Cal.toFixed(2);
        let discAmtCal = this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c*this.percentVal/100;
        this.discountAmount = discAmtCal.toFixed(2);
        let adjPrice = this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c-this.discountAmount;
        this.amountInclVal = adjPrice.toFixed(2); 
        }
    }

    handelAmountInclValChange(event) {//Adjusted Price
        if(this.amountInclVal == event.target.value){
            return;
        }
        this.amountInclVal = event.target.value;
        if(this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c !== undefined && this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c != null){
        let discAmt = this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c-this.amountInclVal;
        this.discountAmount = discAmt.toFixed(2);
        let perce = 100*this.discountAmount/this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c;
        this.percentVal = perce.toFixed(2);
        }
    }
    // handelAmountInclValChange(event) {
    //     if(this.amountInclVal == event.target.value){
    //         return;
    //     }
    //     this.amountInclVal = event.target.value;
    //     if(this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c !== undefined && this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c != null){
    //     let perCal = 100*this.amountInclVal/this.vehicleqlirecord.LMS_QLI_TotalGrossPrice__c;
    //     this.percentVal = perCal.toFixed(2);
    //     }
    // }
    handleRetailerDiscountClick(){
        if(this.amountInclVal != this.vehicleqlirecord.LMS_QLI_DiscountAmount__c){
        this.dispatchClickEvent();
        }
    }
    dispatchClickEvent() {
        let retailervalue = {'retailerdiscountpercent':this.percentVal,'retailerdiscountAmount':this.discountAmount,'retailerdiscountNetAmount2':this.discountNetAmount2,'retailerdiscountamountInclVal':this.amountInclVal};
        let parameters = {retailerDiscountValue: retailervalue};
        console.log('MS retailervalue==> ',retailervalue);
        const valueChangeEvent = new CustomEvent("retailerdiscountchange", {
            detail: parameters
          });
          // Fire the custom event
        this.dispatchEvent(valueChangeEvent);

        // this.dispatchEvent(new FlowAttributeChangeEvent('retailerdiscountpercent', this.percentVal));
        // this.dispatchEvent(new FlowAttributeChangeEvent('retailerdiscountamountInclVal', this.amountInclVal));
        // this.dispatchEvent(new FlowAttributeChangeEvent('retailerdiscountamountupdate', 'Yes'));        
    }
    // navigateFlow() {
    //     this.dispatchEvent(new FlowNavigationNextEvent());       
    // }
    // handleModifyInEverest(event){
       
    // }

}