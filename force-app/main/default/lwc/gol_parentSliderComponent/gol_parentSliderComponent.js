import { LightningElement } from 'lwc';

export default class gol_parentSliderComponent extends LightningElement {
    downpayment = 0;
    mileage = 5000;
    duration = 24;
    rvBalloon = 5;
    isArval = true;
    isSubmitted = false;

    handleDownpaymentChange(event) {
        this.downpayment = event.detail;
        this.checkIfAllValuesSelected();
    }
    
    handleMileageChange(event) {
        this.mileage = event.detail;
        this.checkIfAllValuesSelected();
    }

    checkIfAllValuesSelected() {
        if (this.downpayment !== null &&
            this.mileage !== null) {
          this.isSubmitted = true;
          const serializedData = {
            downpayment: this.downpayment,
            mileage: this.mileage
          };
          console.log("Selected Data:", JSON.stringify(serializedData, null, 2));
        } 
      }
  
}