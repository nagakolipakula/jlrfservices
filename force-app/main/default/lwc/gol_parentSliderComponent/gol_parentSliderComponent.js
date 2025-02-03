import { LightningElement, api } from 'lwc';
import GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';
import GOL_Adjust_parameters from '@salesforce/label/c.GOL_Adjust_parameters';
import GOL_Calculate_Financing from '@salesforce/label/c.GOL_Calculate_Financing';
import GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class gol_parentSliderComponent extends LightningElement {
  @api response;
  @api serializedData;
  @api quoteExternalId;
  @api ContactId;
  @api ContactId2;
  selectedSliderValues = new Map();
  //   isSubmitted = false;
  sliders = [];
  namesWithIds = [];
  selectedProductId;
  parsedResponse;
  childSliderComponent = false;
  label = {
    GOL_Select_Financial_Product,
    GOL_Adjust_parameters,
    GOL_Calculate_Financing,
    GOL_Finance_Insurance_and_Services
  }

  connectedCallback() {
  console.log('First Finance Info Record in connectedCallback:', this.ContactId);
  console.log('Second Finance Info Record in connectedCallback:', this.ContactId2);
    try {
      if (!this.response) {
        console.warn('Response is empty or not defined');
        return;
      }
      const tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
      this.parsedResponse = JSON.parse(tidyUpResponse);
      console.log('Connected Callback - Parsed Response:', JSON.stringify(this.parsedResponse, null, 2));
      this.initializeSliders();
    } catch (error) {
      console.error('Error in connectedCallback:', error.message);
      console.error('Raw Response:', this.response);
    }
  }

  handleModify(event) {
    const contactID = event.detail;
    console.log('ContactId in handleModify:', contactID);
  }

  renderedCallback() {
    console.log('ContactId in rendered Callback:', this.ContactId);
  }

  //Radio buttons
  getProductIds() {
    this.namesWithIds = this.parsedResponse
      .filter(item => item.name && item.id)
      .map(item => ({ label: item.name, value: item.id }));
    console.log('Filtered Names with IDs:', this.namesWithIds);
  }

  setDefaultSelectedProductId() {
    if (!this.selectedProductId && this.namesWithIds.length > 0) {
      this.selectedProductId = this.namesWithIds[0].value;
    }
  }

  getSelectedProduct() {
    return this.parsedResponse.find(item => item.id === this.selectedProductId);
  }

  handleProductSelectionChange(event) {
    this.selectedProductId = event.detail;
    console.log('MS parsedResponse  handleProductSelectionChange ==>' + JSON.stringify(this.parsedResponse, null, 2));
    this.initializeSliders();
  }

  getUnits(key, units) {
    if (key.includes('Mileage')) {
        return units.mileageUnit === 'KILOMETERS' ? 'km' : '';
    }
    if (key.includes('Credit')) {
        console.log('Checking units.creditTimeUnit:', units.creditTimeUnit);
        if (units.creditTimeUnit === 'MONTH') {
            return 'months';
        }
    }
    if (key.includes('Payment')) {
        return units.currencyCode === 'EUR' ? '€' : '';
    }
    if (key.includes('RateRange')) {
        return '%';
    }
    return '';
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

  getSliderNames(inputFields) {
    const fieldNames = [];
    for (const [key, value] of Object.entries(inputFields)) {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        fieldNames.push(key);
      }
    }
    return fieldNames;
  }

  //Dynamic Sliders
  initializeSliders() {
    if (!this.parsedResponse) {
      console.warn('Response is empty or not defined');
      return;
    }
    this.childSliderComponent = false;
    this.getProductIds();
    this.setDefaultSelectedProductId();
    this.setupSliders();

    setTimeout(() => {
      this.childSliderComponent = true;
    }, 100);
  }

  setupSliders() {
    const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    if (providerData && providerData.inputFields) {
      const inputFields = providerData.inputFields;
      const allowedFields = this.getSliderNames(inputFields);

      this.sliders = Object.entries(inputFields)
          .filter(([key]) => allowedFields.includes(key))
          .map(([key, field]) => {
              let storedValue = this.selectedSliderValues.get(this.selectedProductId)?.[key];
              return this.createSliders(providerData, key, field, storedValue);
          });

      // this.sliders.sort((a, b) => a.sequence - b.sequence);
      console.log('Generated Sliders:', JSON.stringify(this.sliders, null, 2));
    } else {
      console.warn('No Input Fields Found');
      this.sliders = [];
    }
  }

  createSliders(providerData, key, field, storedValue) {
    // let sequence = 0;
    // if (key === 'downPaymentRange') sequence = 1;
    // else if (key === 'annualMileagesRange') sequence = 2;
    // else if (key === 'durationsRange') sequence = 3;
    if (providerData.provider === 'ARVAL' && key === 'annualMileagesRange') {
      const durationRange = providerData.inputFields.durationsRange;
      const mileageRange = field;

      return {
        id: 'dependentMileageSlider',
        label: mileageRange.description,
        min: mileageRange.minimum,
        max: this.getDynamicMaxValue(durationRange, mileageRange),
        step: mileageRange.step,
        defaultValue: storedValue !== undefined ? storedValue : mileageRange.defaultValue,
        unit: this.getUnits(key, providerData.units)
        // sequence
      };
    }
    return {
      id: key,
      label: field.description,
      min: field.minimum,
      max: field.maximum,
      step: field.step,
      defaultValue: storedValue !== undefined ? storedValue : field.defaultValue,
      unit: this.getUnits(key, providerData.units)
      // sequence
    };
  }

  handleSliderChange(event) {
    const { id, value } = event.detail;
    if (this.selectedProductId) {
      if (!this.selectedSliderValues.has(this.selectedProductId)) {
          this.selectedSliderValues.set(this.selectedProductId, {});
      }
      this.selectedSliderValues.get(this.selectedProductId)[id] = value;
    }
    // if (id === 'durationsRange') {
    //     this.updateDependentSlider(value);
    // }
    this.updateDependentSlider(value);
    this.updateParsedResponse(id, value);
    this.sliders = [...this.sliders];
  }

  logSliderChange(id, value) {
    console.log(`Slider changed: ${id} -> ${value}`);
    console.log(`${id} <== MS Slider changed MS ==> ${value}`);
    console.log(`${this.selectedProductId} <== this.selectedProductId this.parsedResponse MS ==> ${this.parsedResponse.length}`);
  }

  updateDependentSlider(value) {
    const product = this.getSelectedProduct();
    if (!product) return;
    const durationRange = product.inputFields?.durationsRange;
    const mileageRange = product.inputFields?.annualMileagesRange;

    if (durationRange && mileageRange) {
      const matchingDuration = this.findMatchingRange(durationRange.intervals?.ranges, value);
      if (!matchingDuration) {
        console.warn(`No matching duration range found for value: ${value}`);
        return;
      }

      const order = matchingDuration.order;
      const matchingMileage = this.findMatchingMileageRange(mileageRange.intervals?.ranges, order);
      if (!matchingMileage) {
        console.warn(`No matching mileage range found for order: ${order}`);
        return;
      }

      console.log(`Updating dependent mileage slider -> Max: ${matchingMileage.max}`);

      const dependentSlider = this.sliders.find(slider => slider.id === 'dependentMileageSlider');
      if (dependentSlider) {
        dependentSlider.max = matchingMileage.max;
        dependentSlider.defaultValue = mileageRange.defaultValue;
        dependentSlider.value = Math.min(dependentSlider.defaultValue, dependentSlider.max);
      }
      this.sliders = [...this.sliders];
    } else {
      console.warn('Duration Range or Mileage Range is missing in the product response.');
    }
  }

  updateParsedResponse(id, value) {
    for (let i = 0; i < this.parsedResponse.length; i++) {
      if (this.selectedProductId === this.parsedResponse[i].id) {
        const inputFields = this.parsedResponse[i].inputFields;
        const allowedFields = this.getSliderNames(inputFields);
        if (allowedFields.includes(id)) {
          inputFields[id].defaultValue = value;
        } else {
          console.warn(`Field "${id}" is not valid or not found in inputFields.`);
        }
      }
    }
  }

  //For ARVAL dependent Slider depends upon duration range
  findMatchingRange(ranges, value) {
    return ranges?.find(range => value >= range.min && value <= range.max);
  }

  findMatchingMileageRange(ranges, order) {
    return ranges?.find(range => range.order === order);
  }

  updateSliderMax(slider, max) {
    slider.max = max;
    console.log(`Updated range for Dependent Mileage: Min = ${slider.min}, Max = ${slider.max}`);
  }

  handleDownpaymentChange(event) {
    this.downpayment = event.detail;
    this.checkIfAllValuesSelected();
  }

  handleMileageChange(event) {
    this.mileage = event.detail;
    this.checkIfAllValuesSelected();
  }

  handleDurationChange(event) {
    this.duration = event.detail;
    this.checkIfAllValuesSelected();
  }

  updateFlowVariables() {
    // console.log('----------------');
    // console.log(this.sliders);
    this.buildSerializedData();
    // const serializedData = {
    //     downpayment: this.downpayment,
    //     mileage: this.mileage,
    //     duration: this.duration
    // };
    // console.log("Selected Data:", JSON.stringify(serializedData, null, 2));
    // this[NavigationMixin.Navigate]({
    //   type: 'standard__flow',
    //   attributes: {
    //       flowApiName: 'GOL_Screen_Flow_Finance_Tab'
    //   },
    // });
    this.dispatchEvent(new FlowAttributeChangeEvent('serializedData', JSON.stringify(this.serializedData)));
  }

  buildSerializedData() {
    // const cpiProducts = this.buildCpiProducts();
    const inputFields = this.buildInputFields();
    const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    console.log('-------providerData----------');
    console.log(providerData.cpiProducts);
    const cpiProducts = providerData.cpiProducts;
    const serializedData = {
      quoteId: this.quoteExternalId,
      product: {
          fullId: providerData.id,
          name: providerData.name,
          description: providerData.description,
          selected: true,
          units: {
              mileageUnit: providerData.units.mileageUnit,
              currencyCode: providerData.units.currencyCode,
              creditTimeUnit: providerData.units.creditTimeUnit
          },
          cpiProducts: cpiProducts,
          inputFields: inputFields
      }
  };

  console.log(serializedData);
    this.serializedData = serializedData;
    console.log("Serialized Data:", JSON.stringify(this.serializedData, null, 2));
  }

  handleCalculateFinancingClick() {
    this.updateFlowVariables();
    this.dispatchEvent(new FlowNavigationNextEvent());
  }

  handleBackToFianceCalculator() {
    this.dispatchEvent(new FlowNavigationBackEvent());
  }

  handleBackToFianceFinish() {
    this.dispatchEvent(new FlowNavigationFinishEvent());
  }

  buildCpiProducts() {
    return [
        {
            financialProductId: 'MC',
            name: 'EstándarEmpresa-Seguro protección pago',
            description: 'EstándarEmpresa-Seguro protección pago',
            id: '7037A',
            // monthlyCost: 127400.13,
            selected: true
        }
    ];
 }

 buildInputFields() {
    const inputFields = {};
    this.sliders.forEach((slider) => {
       inputFields[slider.id] = {
            selectedValue: this[slider.id] || slider.defaultValue || 0,
            step: slider.step || 0,
            defaultValue: slider.defaultValue || 0,
            minimum: slider.min || 0,
            unit: slider.unit || "",
            maximum: slider.max || 0,
            description: slider.label || 0
        };
    });

  return inputFields;
}


 
  // buildGetQuotePayload(){
    
  // }

  // buildInputFields(){
  //   const inputFields = {};
  //   this.sliders.forEach((field) => {
  //       inputFields[field.id] = {
  //           selectedValue: this.downpayment,
  //           step: field.step,
  //           defaultValue: field.defaultValue,
  //           minimum: field.min,
  //           unit: 'field.unit',
  //           maximum: field.max,
  //           description: field.label
  //       };
  //   });
  //   console.log(inputFields);
  // }
}