import { LightningElement, api, track} from 'lwc';
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
  @track sliders = [];
  @track namesWithIds = [];
  @track selectedProductId;
  @track parsedResponse;
  connectedCallback() {
    if(this.response){
    let tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
     //let parsedResponse;
     try {
      this.parsedResponse = JSON.parse(tidyUpResponse);
      console.log('MS connectedCallback parsedResponse ==>'+JSON.stringify(this.parsedResponse,null,2));
    } catch (error) {
      console.error('Failed to parse sanitized response:', error);
      return;
    }
    this.initializeSliders();
    }else {
      console.warn('Response is empty or not defined');
    }
  }

  initializeSliders() {
    if (this.parsedResponse) {
      console.log('MS initializeSliders parsedResponse ==>'+JSON.stringify(this.parsedResponse,null,2));
      this.namesWithIds = this.parsedResponse
            .filter(item => item.name && item.id)
            .map(item => ({ label: item.name, 
                            value: item.id }));
        console.log('Filtered Names with IDs:', this.namesWithIds);

        if (!this.selectedProductId && this.namesWithIds.length > 0) {
            this.selectedProductId = this.namesWithIds[0].value;
        }

      const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
      console.log('First Match for provider id = this.selectedProductId:', this.selectedProductId);
      console.log('providerData MS===>'+ JSON.stringify(providerData));
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
        console.log('Filtered and Sliders Generated:'+ JSON.stringify(this.sliders));
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
    const idVal = event.detail.id;
    const valueVal = event.detail.value;
    console.log(`Slider changed: ${id} -> ${value}`);
    console.log(idVal+'<==MS Slider changed MS==>'+valueVal);
    console.log(this.selectedProductId+'<== this.selectedProductId this.parsedResponse MS===>'+this.parsedResponse.length);
    for(var i=0; i<this.parsedResponse.length; i++){
        if(this.selectedProductId === this.parsedResponse[i].id){
          console.log('this.parsedResponse[i].inputFields'+this.parsedResponse[i].inputFields.durationsRange);
          this.parsedResponse[i].inputFields.durationsRange.defaultValue=valueVal;
        }
    }
  }

  handleProductSelectionChange(event) {
    this.selectedProductId = event.detail;
    console.log('MS parsedResponse  handleProductSelectionChange ==>'+JSON.stringify(this.parsedResponse,null,2));
    this.initializeSliders();
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