import { LightningElement, api } from 'lwc';
import 	GOL_Downpayment from '@salesforce/label/c.GOL_Downpayment';
import 	GOL_Currency_symbol from '@salesforce/label/c.GOL_Currency_symbol';
import 	GOL_Mileage from '@salesforce/label/c.GOL_Mileage';
import 	GOL_Distance_symbol from '@salesforce/label/c.GOL_Distance_symbol';

export default class gol_parentSliderComponent extends LightningElement {
    @api response;
    downpayment = 0;
    mileage = 5000;
    downPaymentMaxValue = 50000;
    mileageMinValue = 5000;
    mileageMaxValue = 40000;
    isSubmitted = false;
    label = {
        GOL_Downpayment,
        GOL_Currency_symbol,
        GOL_Mileage,
        GOL_Distance_symbol
    }

    handleDownpaymentChange(event) {
        console.log('Downpayment Changed:', event.detail);
        let fixedResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '');

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(fixedResponse);
            console.log('Parsed Response:', parsedResponse);

            console.log('First Name:', parsedResponse[0]?.name || 'Not Available');
            console.log('First Provider:', parsedResponse[0]?.provider || 'Not Available');
        } catch (error) {
            console.error('Failed to parse fixed response:', error);
        }
        // if (this.response && typeof this.response === 'object') {
        //   console.log('Specific Field (e.g., "field1"):', this.response.field1);
        //   console.log('Nested Object (e.g., "nested.field2"):', this.response.nested?.field2);
        // }
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