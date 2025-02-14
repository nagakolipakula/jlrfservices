import { LightningElement, api, track } from 'lwc';
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
  @api personType;
  @api channel;
  @api typeOfUse;
  mappingMetadataRecords;
  parsedSerializedData;
  @api IsUpdateRetailerDiscount = false;
  @api retailerDiscountSerializedData;
  retailerDiscountInputFiledAry = [];
  selectedSliderValues = new Map();
  hasNoFinancialProducts = false;
  //   isSubmitted = false;
  sliders = [];
  namesWithIds = [];
  selectedProductId;
  parsedResponse;
  childSliderComponent = false;
  isInitialLoadInModify = false;
  label = {
    GOL_Select_Financial_Product,
    GOL_No_Financial_products_available,
    GOL_Adjust_parameters,
    GOL_Calculate_Financing,
    GOL_Finance_Insurance_and_Services,
    GOL_Amount_incl_VAT
  }

  connectedCallback() {
    console.log('First Finance Info Record:', this.ContactId);
    console.log('Second Finance Info Record:', this.ContactId2);
    console.log('MS retailerDiscountSerializedData==>',this.retailerDiscountSerializedData);
    
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
      //console.log('Parsed Response:', JSON.stringify(this.parsedResponse, null, 2));
      this.isInitialLoadInModify = true;

      if (this.retailerDiscountSerializedData) {
          console.log('retailerDiscountSerializedData EXISTS');

          let storedData;
          try {
              storedData = JSON.parse(this.retailerDiscountSerializedData);
              console.log('Parsed retailerDiscountSerializedData:', storedData);
          } catch (error) {
              return;
          }

          const selectedProductId = storedData.selectedProductId;
          console.log('Selected Product ID from retailerDiscountSerializedData:', selectedProductId);

          let foundProduct = false;
          for (let i = 0; i < this.parsedResponse.length; i++) {
              console.log('Checking product ID:', this.parsedResponse[i].fullId);

              if (this.parsedResponse[i].fullId === selectedProductId) {
                  foundProduct = true;
                  const inputFields = this.parsedResponse[i].inputFields;

                  storedData.inputFields.forEach(field => {
                      const key = Object.keys(field)[0];
                      if (inputFields[key]) {
                          inputFields[key].defaultValue = field[key];
                          console.log(`Updated ${key} ->`, field[key]);
                      }
                  });
                  this.parsedResponse[i].inputFields = inputFields;
              }
          }
      } else {
          console.warn('retailerDiscountSerializedData is undefined or empty');
      }
      this.initializeSliders();
  
    } catch (error) {
      console.error('Error in connectedCallback:', error.message);
      console.error('Raw Response:', this.response);
      this.hasNoFinancialProducts = true;
    }
  }

  async loadMetadata() {
    try {
      this.mappingMetadataRecords = await getInputFieldsMappingRecords();
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

  setDefaultSelectedProductId() {//Set product Ids
    if(this.parsedSerializedData !== undefined && this.parsedSerializedData){
        this.selectedProductId = this.parsedSerializedData.selectedProductId;
    }else if(this.isInitialLoadInModify && this.financeInformation &&  this.namesWithIds.length > 0  && this.isSavedProductPresent(this.financeInformation.LMS_FIN_Finance_Reference__c)){
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
    this.isInitialLoadInModify = false;
    this.selectedProductId = event.detail;
    console.log('MS this.selectedProductId==> ',this.selectedProductId);
    // console.log('MS parsedResponse  handleProductSelectionChange ==>' + JSON.stringify(this.parsedResponse, null, 2));
    this.initializeSliders();
    this.handleUpdateRetailerDiscount('selectedProductId',event.detail);
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
  async initializeSliders() {
    if (!this.parsedResponse) {
      console.warn('Response is empty or not defined');
      return;
    }
    this.childSliderComponent = false;
    this.getProductIds();
    this.setDefaultSelectedProductId();
    if(this.isInitialLoadInModify && this.financeInformation){
      await this.loadMetadata();
      this.updateParsedResponseForModify();
    }else if(this.isInitialLoadInModify && this.retailerDiscountSerializedData 
      && this.parsedSerializedData!== undefined
      && this.parsedSerializedData.inputFields.length>0){
      this.updateParsedResponseForRetailerDiscount();
    }
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
    this.isInitialLoadInModify = false;
  }

  async setupSliders() {
     
    const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    if (providerData && providerData.inputFields) {
      const inputFields = providerData.inputFields;
      const allowedFields = this.getSliderNames(inputFields);
      this.sliders = Object.entries(inputFields)
        .filter(([key]) => 
          allowedFields.includes(key) &&
          key !== "downPaymentRateRange" &&
          key !== "finalTermRateRange" &&
          key !== "interestRateRange"
        )
        .map(([key, field]) => {
          let storedValue = this.selectedSliderValues.get(this.selectedProductId)?.[key];
          return this.createSliders(providerData, key, field, storedValue);
        });


        console.log('Generated Sliders:', JSON.stringify(this.sliders, null, 2));
    } else {
        console.warn('No Input Fields Found');
        this.sliders = [];
    }
  }

  updateParsedResponseForModify(){
    for (let i = 0; i < this.parsedResponse.length; i++) {
      if (this.selectedProductId === this.parsedResponse[i].fullId) {
        const inputFields = this.parsedResponse[i].inputFields;
        const allowedFields = this.getSliderNames(inputFields);
        let inputName;
        for (let j = 0; j < allowedFields.length; j++) {
          inputName = allowedFields[j];
          inputFields[inputName].defaultValue = this.getSavedValueFromFinInformation(inputName) ?? 0;
          this.parsedResponse[i].inputFields = inputFields;
        }
      }
    }
  }
  getSavedValueFromFinInformation(key){
     let returnVal;
     if(this.isInitialLoadInModify && this.financeInformation){
      let recordMap = new Map(Object.entries(this.financeInformation));
      this.mappingMetadataRecords.map(record => {
        const valuesArray = record.Input_Fields_Name__c.split(',').map(value => value.trim()); 
        if(valuesArray.includes(key)) 
        {
          if(recordMap.get(record.Field_API_Name__c)){
            returnVal =  recordMap.get(record.Field_API_Name__c);
          }
        }
      });
      return returnVal;
    }else{
      return this.selectedSliderValues.get(this.selectedProductId)?.[key];
    }
  }
  updateParsedResponseForRetailerDiscount(){ 
    for (let i = 0; i < this.parsedResponse.length; i++) {
      if (this.parsedSerializedData.selectedProductId == this.parsedResponse[i].fullId) {
        const inputFields = this.parsedResponse[i].inputFields;
        const allowedFields = this.getSliderNames(inputFields);
        let inputName;
        for (let j = 0; j < allowedFields.length; j++) {
          inputName = allowedFields[j];
          inputFields[inputName].defaultValue = this.getSavedValueFromRetailerDiscount(inputName);
          console.log('MS-->', inputFields[inputName].defaultValue);
          this.parsedResponse[i].inputFields = inputFields;
        }
      }
    }
  }
  getSavedValueFromRetailerDiscount(key){
    
     if(this.isInitialLoadInModify && this.retailerDiscountSerializedData 
      && this.parsedSerializedData!== undefined
      && this.parsedSerializedData.inputFields){
        let checkKeyId = this.parsedSerializedData.inputFields.some(x => x.hasOwnProperty(key));
        if(checkKeyId){
          this.parsedSerializedData.inputFields.forEach((element,index) => {
            if(Object.keys(element) == key){
              console.log('MS-->inputFieldsmm',this.parsedSerializedData.inputFields[index][key]);
              return this.parsedSerializedData.inputFields[index][key];
            }
        });
        }
      return this.selectedSliderValues.get(this.parsedSerializedData.selectedProductId)?.[key];
    }else{
      return this.selectedSliderValues.get(this.parsedSerializedData.selectedProductId)?.[key];
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
    this.handleUpdateRetailerDiscount(id, value);

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
      typeOfUse: this.typeOfUse,
      personType: this.personType,
      channel: this.channel,
      product: {
          fullId: providerData.id,
          name: providerData.name,
          description: providerData.description,
          selected: true,
          provider:providerData.provider,
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
  handleUpdateRetailerDiscount(id, value) {
    
    let selectedData;
    if(value!==this.selectedProductId){
    let checkKeyId = this.retailerDiscountInputFiledAry.some(x => x.hasOwnProperty(id));
      if(checkKeyId){
        this.retailerDiscountInputFiledAry.forEach((element,index) => {
          if(Object.keys(element) == id){
            this.retailerDiscountInputFiledAry[index][id] = value;
          }
      });
      }else{
        this.retailerDiscountInputFiledAry.push({[id]: value});
      }
      selectedData = {'selectedProductId':this.selectedProductId,'inputFields':this.retailerDiscountInputFiledAry};
    }else{
      selectedData = {'selectedProductId':this.selectedProductId,'inputFields':{}};
    }
    console.log('MS:: selectedData==> '+JSON.stringify(selectedData));

    this.dispatchEvent(new FlowAttributeChangeEvent('retailerDiscountSerializedData', JSON.stringify(selectedData)));
  
  }
  handleBackToFianceCalculator() {
    this.dispatchEvent(new FlowNavigationBackEvent());
  }

  handleBackToFianceFinish() {
    this.dispatchEvent(new FlowNavigationFinishEvent());
  }

//   buildCpiProducts() {
//     return [
//         {
//             financialProductId: 'MC',
//             name: 'EstándarEmpresa-Seguro protección pago',
//             description: 'EstándarEmpresa-Seguro protección pago',
//             id: '7037A',
//             // monthlyCost: 127400.13,
//             selected: true
//         }
//     ];
//  }

 buildInputFields() {
    const selectedFields = {};
    const modifiedSliderValues = this.selectedSliderValues.get(this.selectedProductId);
    let sliderAPIName;
    Object.entries(modifiedSliderValues).forEach(([sliderId, selectedValue]) => {
      const sliderDetails = this.sliders.find(slider => slider.id === sliderId);
      if (sliderDetails) {
        if(sliderId === 'dependentMileageSlider'){
           sliderId = 'annualMileagesRange';
        }
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