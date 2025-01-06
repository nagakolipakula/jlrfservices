import { LightningElement } from 'lwc';

export default class gol_parentSliderComponent extends LightningElement {
    downpayment = 0;
    mileage = 5000;
    duration = 24;
    rvBalloon = 5;
    isArval = true;
    isSubmitted = false;

    handleDownpaymentChange(event) {
        console.log('Parent Component - Downpayment Value Changed:', event.detail);
        this.downpayment = event.detail;
        // this.checkIfAllValuesSelected();
    }
    
    handleMileageChange(event) {
        this.mileage = event.detail;
        // this.checkIfAllValuesSelected();
    }
  
}