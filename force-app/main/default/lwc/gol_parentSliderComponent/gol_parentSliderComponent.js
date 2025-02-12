import { LightningElement, api, wire } from 'lwc';
import GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';
import GOL_Adjust_parameters from '@salesforce/label/c.GOL_Adjust_parameters';
import GOL_No_Financial_products_available from '@salesforce/label/c.GOL_No_Financial_products_available';
import GOL_Calculate_Financing from '@salesforce/label/c.GOL_Calculate_Financing';
import GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import GOL_Amount_incl_VAT from '@salesforce/label/c.GOL_Amount_incl_VAT';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import getInputFieldsMappingRecords from '@salesforce/apex/GOL_GetFinanceQuote.getInputFieldsMappingRecords';

export default class gol_parentSliderComponent extends LightningElement {
  @api response;
  @api serializedData;
  @api quoteExternalId;
  @api ContactId;
  @api ContactId2;
  @api vehicleQli;
  @api financeInformation;
  @api inputFieldMapping;
  @api inputMappingData;
  mappingMetadataRecords;
  
  selectedSliderValues = new Map();
  hasNoFinancialProducts = false;
  //   isSubmitted = false;
  sliders = [];
  namesWithIds = [];
  selectedProductId;
  parsedResponse;
  childSliderComponent = false;
  label = {
    GOL_Select_Financial_Product,
    GOL_No_Financial_products_available,
    GOL_Adjust_parameters,
    GOL_Calculate_Financing,
    GOL_Finance_Insurance_and_Services,
    GOL_Amount_incl_VAT
  }

  // @wire(getInputFieldsMappingRecords)
  // wiredMetadata({ error, data }) {
  //     if (data) {
  //         this.mappingMetadataRecords = data;
  //         console.log('Fetched Metadata Records:', this.mappingMetadataRecords);
  //     } else if (error) {
  //         console.error('Error fetching metadata:', error);
  //     }
  // }

  connectedCallback() {
    console.log('First Finance Info Record:', this.ContactId);
    console.log('Second Finance Info Record:', this.ContactId2);
   
    try {
      if (!this.response || this.response.trim() === '') {
        console.warn('Response is empty or not defined');
        this.hasNoFinancialProducts = true;
        return;
      }
      const tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
      this.parsedResponse = JSON.parse(tidyUpResponse);
      
      if (!this.parsedResponse || this.parsedResponse.length === 0) {
        console.warn('No financial products available in response');
        this.hasNoFinancialProducts = true;
        return;
      }

      this.hasNoFinancialProducts = false;
      console.log('Parsed Response:', JSON.stringify(this.parsedResponse, null, 2));
      this.initializeSliders();
  
    } catch (error) {
      console.error('Error in connectedCallback:', error.message);
      console.error('Raw Response:', this.response);
      this.hasNoFinancialProducts = true;
    }
  }

  async loadMetadata() {
    try {
        const data = await getInputFieldsMappingRecords();
        console.log('Data +++++++++++++'+data);
        console.log(data);
        this.mappingMetadataRecords = data;
        // this.metadataRecords = data.map(record => ({
        //     id: record.Id,
        //     name: record.DeveloperName,
        //     value: record.Custom_Field__c
        // }));
    } catch (error) {
        console.error('Error fetching metadata:', error);
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
     if(this.financeInformation &&  this.namesWithIds.length > 0  && this.isSavedProductPresent(this.financeInformation.LMS_FIN_Finance_Reference__c)){
      this.selectedProductId = this.financeInformation.LMS_FIN_Finance_Reference__c;
    }else if (!this.selectedProductId && this.namesWithIds.length > 0) {
      this.selectedProductId = this.namesWithIds[0].value;
    }
  }

  isSavedProductPresent(productId) {
    return this.namesWithIds.some(item => item.value === productId);
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
    const providerData = this.getSelectedProduct();
    if (providerData && providerData.inputFields) {
      this.selectedSliderValues.set(this.selectedProductId, {});
      Object.entries(providerData.inputFields).forEach(([key, field]) => {
        if (!this.selectedSliderValues.get(this.selectedProductId)[key]) {
          this.selectedSliderValues.get(this.selectedProductId)[key] = field.defaultValue;
        }
      });
    }
    setTimeout(() => {
      this.childSliderComponent = true;
    }, 100);
  }

  async setupSliders() {
    await this.loadMetadata();
    const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    if (providerData && providerData.inputFields) {
      const inputFields = providerData.inputFields;
      console.log('**********************************');
      // console.log(this.inputMappingData);
      console.log(inputFields);
     
      const allowedFields = this.getSliderNames(inputFields);
      console.log(allowedFields);
      console.log('**********************************');
      this.sliders = Object.entries(inputFields)
        .filter(([key]) => 
          allowedFields.includes(key) &&
          key !== "downPaymentRateRange" &&
          key !== "finalTermRateRange" &&
          key !== "interestRateRange"
        )
        .map(([key, field]) => {
          //this.getStoredValue(key);
          let storedValue = this.getStoredValue(key);;//this.selectedSliderValues.get(this.selectedProductId)?.[key];
          console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
          
          console.log('Stored Value:', storedValue);
          console.log('key Value:', key);
          console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
          return this.createSliders(providerData, key, field, storedValue);
        });


        console.log('Generated Sliders:', JSON.stringify(this.sliders, null, 2));
    } else {
        console.warn('No Input Fields Found');
        this.sliders = [];
    }
  }

  getStoredValue(key) {
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    let returnVal;
    if(this.financeInformation){
      let recordMap = new Map(Object.entries(this.financeInformation));
      this.mappingMetadataRecords.map(record => {
        const valuesArray = record.Input_Fields_Name__c.split(',').map(value => value.trim()); // Convert to array
        if(valuesArray.includes(key)) // Check if key exists
        {
          console.log('Found Key-----> ', key);
          console.log('Found Key-----> ', record.Field_API_Name__c);
          console.log(recordMap.get(record.Field_API_Name__c));
          if(recordMap.get(record.Field_API_Name__c)){
            console.log('Found all and return -----');
            returnVal =  recordMap.get(record.Field_API_Name__c);
          }
        }
      });
      return returnVal;
    }else{
      return this.selectedSliderValues.get(this.selectedProductId)?.[key];
    }
    // console.log(this.financeInformation);
    // console.log(key);
   
    // let fieldNameTemp = 'LMS_FIN_Term__c';
    // console.log(this.mappingMetadataRecords);
    // console.log(recordMap.get(fieldNameTemp));
    // console.log(recordMap);
    // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    
    
  }

  createSliders(providerData, key, field, storedValue) {
    // let sequence = 0;
    // if (key === 'downPaymentRange') sequence = 1;
    // else if (key === 'annualMileagesRange') sequence = 2;
    // else if (key === 'durationsRange') sequence = 3;
    console.log('****************------------------------******************');
    console.log(providerData);
    console.log(key);
    console.log(field);
    console.log(storedValue);
    console.log('******************-----------------------------****************');
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
    const providerData = this.getSelectedProduct();
    if (providerData && providerData.inputFields) {
      const selectedValues = this.selectedSliderValues.get(this.selectedProductId) || {};

      Object.entries(providerData.inputFields).forEach(([key, field]) => {
        if (!selectedValues[key]) {
          selectedValues[key] = field.defaultValue;
        }
      });

      this.selectedSliderValues.set(this.selectedProductId, selectedValues);
    }
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
    const selectedFields = {};
    const modifiedSliderValues = this.selectedSliderValues.get(this.selectedProductId);

    Object.entries(modifiedSliderValues).forEach(([sliderId, selectedValue]) => {
      const sliderDetails = this.sliders.find(slider => slider.id === sliderId);
      if (sliderDetails) {
        selectedFields[sliderId] = {
          selectedValue: selectedValue ?? sliderDetails.defaultValue,
          step: sliderDetails.step || 0,
          defaultValue: sliderDetails.defaultValue || 0,
          minValue: sliderDetails.min || 0,
          maxValue: sliderDetails.max || 0,
          unit: sliderDetails.unit || "",
          label: sliderDetails.label || ""
        };
      }
    });
    console.log("Selected Input Fields:", JSON.stringify(selectedFields, null, 2));
    return selectedFields;
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