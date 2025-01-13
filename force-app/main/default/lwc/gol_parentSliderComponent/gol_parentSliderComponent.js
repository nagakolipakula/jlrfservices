import { LightningElement, api } from 'lwc';
import 	GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';
// import 	GOL_Downpayment from '@salesforce/label/c.GOL_Downpayment';
// import 	GOL_Currency_symbol from '@salesforce/label/c.GOL_Currency_symbol';
// import 	GOL_Mileage from '@salesforce/label/c.GOL_Mileage';
// import 	GOL_Distance_symbol from '@salesforce/label/c.GOL_Distance_symbol';

export default class gol_parentSliderComponent extends LightningElement {
  @api response;

  // downpayment = 0;
  // mileage = 5000;
  // downPaymentMaxValue = 50000;
  // mileageMinValue = 5000;
  // mileageMaxValue = 40000;
  isSubmitted = false;
  label = {
         GOL_Select_Financial_Product
  //     GOL_Downpayment,
  //     GOL_Currency_symbol,
  //     GOL_Mileage,
  //     GOL_Distance_symbol
  }
  sliders = [];
  namesWithIds = [];
  selectedProductId;

  connectedCallback() {
    this.initializeSliders();
  }

  initializeSliders() {
    if (this.response) {
      let tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(tidyUpResponse);
      } catch (error) {
        console.error('Failed to parse sanitized response:', error);
        return;
      }

      this.namesWithIds = parsedResponse
            .filter(item => item.name && item.id)
            .map(item => ({ label: item.name, 
                            value: item.id }));
        console.log('Filtered Names with IDs:', this.namesWithIds);

        if (!this.selectedProductId && this.namesWithIds.length > 0) {
            this.selectedProductId = this.namesWithIds[0].value;
        }

      const providerData = parsedResponse.find(item => item.id === this.selectedProductId);
      console.log('First Match for provider id = this.selectedProductId:', this.selectedProductId);

      if (providerData && providerData.inputFields) {
        const inputFields = providerData.inputFields;

        const allowedFields = ['durationsRange', 'annualMileagesRange', 'downPaymentRange'];
        this.sliders = Object.entries(inputFields)
          .filter(([key]) => allowedFields.includes(key))
          .map(([key, field]) => ({
            id: key,
            label: field.description,
            min: field.minimum,
            max: field.maximum,
            step: field.step,
            defaultValue: field.defaultValue,
            unit: this.getUnit(key, providerData.units)
          }));
        console.log('Filtered and Sliders Generated:', this.sliders);
      } else {
        console.warn('No Input Fields Found');
        this.sliders = [];
      }
    } else {
      console.warn('Response is empty or not defined');
    }
  }

  getUnit(key, units) {
    if (key.includes('Mileage')) return units.mileageUnit.toLowerCase();
    if (key.includes('Payment')) return units.currencyCode === 'EUR' ? '€' : '';
    if (key.includes('Duration')) return units.creditTimeUnit.toLowerCase();
    return '';
  }

  handleSliderChange(event) {
    const { id, value } = event.detail;
    console.log(`Slider changed: ${id} -> ${value}`);
  }

  handleProductSelectionChange(event) {
    this.selectedProductId = event.detail;
    this.initializeSliders(this.selectedProductId);
  }

  // handleDownpaymentChange(event) {
  //   console.log('Downpayment Changed:', event.detail);
    // let fixedResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '');

    // let parsedResponse;
    // try {
    //     parsedResponse = JSON.parse(fixedResponse);
    // } catch (error) {
    //     console.error('Failed to parse fixed response:', error);
    // }
    // if (this.response && typeof this.response === 'object') {
    //   console.log('Specific Field (e.g., "field1"):', this.response.field1);
    //   console.log('Nested Object (e.g., "nested.field2"):', this.response.nested?.field2);
    // }
  //   this.downpayment = event.detail;
  //   this.checkIfAllValuesSelected();
  // }

  // handleMileageChange(event) {
  //   this.mileage = event.detail;
  //   this.checkIfAllValuesSelected();
  // }

  // checkIfAllValuesSelected() {
  //   if (this.downpayment !== null &&
  //     this.mileage !== null) {
  //     this.isSubmitted = true;
  //     const serializedData = {
  //       downpayment: this.downpayment,
  //       mileage: this.mileage
  //     };
  //     console.log("Selected Data:", JSON.stringify(serializedData, null, 2));
  //   }
  // }
}