import { LightningElement, api, track} from 'lwc';
import 	GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';
import 	GOL_Adjust_parameters from '@salesforce/label/c.GOL_Adjust_parameters';
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
         GOL_Select_Financial_Product,
         GOL_Adjust_parameters
  //     GOL_Downpayment,
  //     GOL_Currency_symbol,
  //     GOL_Mileage,
  //     GOL_Distance_symbol
  }
  @track sliders = [];
  @track namesWithIds = [];
  @track selectedProductId;
  @track parsedResponse;
  childSliderComponent = false;
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
      this.childSliderComponent = false;
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
                .map(([key, field]) => {
                    if (providerData.provider === 'ARVAL' && key === 'annualMileagesRange') {
                        const durationRange = inputFields.durationsRange;
                        const mileageRange = field;

                        return {
                            id: 'dependentMileageSlider',
                            label: mileageRange.description,
                            min: mileageRange.minimum,
                            max: this.getDynamicMaxValue(durationRange, mileageRange),
                            step: mileageRange.step,
                            defaultValue: mileageRange.defaultValue,
                            unit: 'km'
                        };
                    }

                    return {
                        id: key,
                        label: field.description,
                        min: field.minimum,
                        max: field.maximum,
                        step: field.step,
                        defaultValue: field.defaultValue,
                        unit: this.getUnit(key, providerData.units)
                    };
                });
        setTimeout(() => {
          this.childSliderComponent = true;
      }, 100);
        
      } else {
        console.warn('No Input Fields Found');
        this.sliders = [];
      }
    } else {
      console.warn('Response is empty or not defined');
    }
  }

  getDynamicMaxValue(durationRange, mileageRange, isInitial = true) {
    if (isInitial) {
        return mileageRange.maximum;
    }

    const selectedDuration = durationRange.defaultValue;
    const matchingRange = durationRange.intervals.ranges.find(
        range => selectedDuration >= range.min && selectedDuration <= range.max
    );
    return matchingRange ? matchingRange.max : mileageRange.maximum;
  }

  getUnit(key, units) {
    if (key.includes('Mileage')) return units.mileageUnit === 'KILOMETERS' ? 'km' : '';
    if (key.includes('Credit')) {
      console.log('Checking units.creditTimeUnit:', units.creditTimeUnit);
      if (units.creditTimeUnit === 'MONTHLY') {
          return 'months';
      }
    }
    if (key.includes('Payment')) return units.currencyCode === 'EUR' ? '€' : '';
    return '';
  }
  
  handleSliderChange(event) {
    const { id, value } = event.detail;
    if (id === 'durationsRange') {
      const dependentSlider = this.sliders.find(slider => slider.id === 'dependentMileageSlider');

      if (dependentSlider) {
          const product = this.parsedResponse.find(item => item.id === this.selectedProductId);
          const durationRange = product?.inputFields?.durationsRange;
          const mileageRange = product?.inputFields?.annualMileagesRange;

          const matchingDuration = durationRange?.intervals?.ranges.find(
              range => value >= range.min && value <= range.max
          );

          if (matchingDuration) {
              const order = matchingDuration.order;
              console.log(`Matching duration range order: ${order}`);

              const matchingMileage = mileageRange?.intervals?.ranges.find(
                  range => range.order === order
              );

              if (matchingMileage) {
                  dependentSlider.max = matchingMileage.max; // Update the max value
                  console.log(
                      `Updated range for Dependent Mileage based on duration (${value} months): Min = ${dependentSlider.min}, Max = ${dependentSlider.max}`
                  );
              } else {
                  console.warn(`No matching mileage range found for order: ${order}`);
              }
          } else {
              console.warn(`No matching duration range found for value: ${value}`);
          }

          this.sliders = [...this.sliders];
      }
  }
    const idVal = event.detail.id;
    const valueVal = event.detail.value;
    console.log(`Slider changed: ${id} -> ${value}`);
    console.log(idVal+'<==MS Slider changed MS==>'+valueVal);
    console.log(this.selectedProductId+'<== this.selectedProductId this.parsedResponse MS===>'+this.parsedResponse.length);
    for(var i=0; i<this.parsedResponse.length; i++){
        if(this.selectedProductId === this.parsedResponse[i].id){
          console.log('this.parsedResponse[i].inputFields'+this.parsedResponse[i].inputFields.durationsRange);
          if(idVal === 'durationsRange'){// check allowedFields const value
          this.parsedResponse[i].inputFields.durationsRange.defaultValue=valueVal;
          }
          else if(idVal === 'annualMileagesRange'){
          this.parsedResponse[i].inputFields.annualMileagesRange.defaultValue=valueVal;
          }else if(idVal === 'downPaymentRange'){
            this.parsedResponse[i].inputFields.downPaymentRange.defaultValue=valueVal;
          }
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