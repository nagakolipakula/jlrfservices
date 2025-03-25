import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent ,FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class Gol_FinanceButtonsComponent extends LightningElement {
    @api buttonDetails;
    @api buttonValue;
    @api buttonContainer='';
    @track buttonDetailsVal=[];
    
    connectedCallback(){
        if(this.buttonDetails){
        this.buttonDetailsVal = JSON.parse(this.buttonDetails);
        if(this.buttonDetailsVal && this.buttonDetailsVal.length>0){
        this.buttonDetailsVal.forEach(element => {
           if(element.Label === this.buttonValue){
            element.Class = 'btn-client-select';
           }else{
            element.Class = 'btn-client-deselect';
           }
           if(element.Style === undefined){
            element.Style='';
           }
          });
        }
        }
    }
    handleButtonClick(event){
        let buttonValue = event.target.value;
        if(this.buttonDetailsVal){
            for(var i=0; i<this.buttonDetailsVal.length; i++){
                if(buttonValue === this.buttonDetailsVal[i].Label){
                    this.buttonDetailsVal[i].Class = 'btn-client-select';
                }else{
                    this.buttonDetailsVal[i].Class = 'btn-client-deselect';
                }
            }
        }
    console.log('buttonValue==> '+buttonValue);    
    this.dispatchEvent(new FlowAttributeChangeEvent('buttonValue', event.target.value));
    }
}