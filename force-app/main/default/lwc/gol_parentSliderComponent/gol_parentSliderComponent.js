import { LightningElement } from 'lwc';

export default class gol_parentSliderComponent extends LightningElement {
    downpayment = 0;
    mileage = 5000;
    downPaymentMaxValue = 50000;
    mileageMinValue = 5000;
    mileageMaxValue = 40000;
    isSubmitted = false;    

    handleDownpaymentChange(event) {
        console.log('Downpayment Changed:', event.detail);
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