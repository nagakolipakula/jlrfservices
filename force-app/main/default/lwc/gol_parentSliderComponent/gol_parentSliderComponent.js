import { LightningElement, api} from 'lwc';
import GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';
import GOL_Adjust_parameters from '@salesforce/label/c.GOL_Adjust_parameters';
import GOL_No_Financial_products_available from '@salesforce/label/c.GOL_No_Financial_products_available';
import GOL_Calculate_Financing from '@salesforce/label/c.GOL_Calculate_Financing';
import GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import GOL_Amount_incl_VAT from '@salesforce/label/c.GOL_Amount_incl_VAT';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import getInputFieldsMappingRecords from '@salesforce/apex/GOL_GetFinanceQuote.getInputFieldsMappingRecords';

export default class gol_parentSliderComponent extends LightningElement {
  @api buttonActionForOverview;
  @api response;
  @api serializedData;
  @api quoteExternalId;
  @api ContactId;
  @api ContactId2;
  @api vehicleQli;
  @api financeInformation;
  @api financeitem;
  @api inputFieldMapping;
  @api inputMappingData;
  @api personType;
  @api channel;
  @api typeOfUse;
  @api UserDetails;
  mappingMetadataRecords;
  parsedSerializedData;
  @api IsUpdateRetailerDiscount = false;
  @api retailerDiscountSerializedData;
  @api clickedButtonName;
  @api FinRecsCheckForOverview;
  retailerDiscountInputFiledAry = [];
  retailerDiscountSelectedProductId;
  selectedSliderValues = new Map();
  hasNoFinancialProducts = false;
  //   isSubmitted = false;
  sliders = [];
  namesWithIds = [];
  selectedProductId;
  parsedResponse;
  childSliderComponent = false;
  childInsuranceProductComponent = false;
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
    console.log('Logged in user details==>'+JSON.stringify(this.UserDetails,null,2));
     console.log('Finance Item==> '+JSON.stringify(this.financeitem,null,2));
    // console.log('First Finance Info Record:', this.ContactId);
    // console.log('Second Finance Info Record:', this.ContactId2);
    console.log('MS retailerDiscountSerializedData==>',this.retailerDiscountSerializedData);
    // console.log("Full response",this.response);
    try {
      if (this.buttonActionForOverview === undefined) {
        console.log('Resetting Parent Component for New Calculation From Overview');
        this.resetComponent();
      }
      if (!this.response || this.response.trim() === '') {
        console.warn('Response is empty or not defined');
        this.hasNoFinancialProducts = true;
        return;
      }
      // const tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
      // let rawParsedResponse  = JSON.parse(tidyUpResponse);
      // this.parsedResponse = this.removeSetFlags(rawParsedResponse);
      let rawParsedResponse = JSON.parse(this.response);
      this.parsedResponse = rawParsedResponse;
      
      if (!this.parsedResponse || this.parsedResponse.length === 0) {
        console.warn('No financial products available in response');
        this.hasNoFinancialProducts = true;
        return;
      }

      this.hasNoFinancialProducts = false;
      console.log('Parsed Response:', JSON.stringify(this.parsedResponse, null, 2));
      this.isInitialLoadInModify = true;

      if (this.retailerDiscountSerializedData) {
        this.handleRetailerDiscountSerializedData();     
      } else {
          console.warn('retailerDiscountSerializedData is undefined or empty');
      }
      this.initializeSliders();
    }catch (error) {
      console.error('Error in connectedCallback:', error.message);
      console.error('Raw Response:', this.response);
      this.hasNoFinancialProducts = true;
    }
  }

  // removeSetFlags(data) {
  //   if (Array.isArray(data)) {
  //     return data.map(item => this.removeSetFlags(item));
  //   } else if (typeof data === "object" && data !== null) {
  //     let cleanedObj = {};
  //     Object.keys(data).forEach(key => {
  //       if (!key.endsWith("_set")) {
  //         cleanedObj[key] = this.removeSetFlags(data[key]);
  //       }
  //     });
  //     return cleanedObj;
  //   }
  //   return data;
  // }

  resetComponent() {
    this.selectedSliderValues = new Map();
    this.selectedProductId = undefined;
    this.sliders = [];
    this.namesWithIds = [];
    this.parsedSerializedData = undefined;
    this.retailerDiscountSerializedData = undefined;
    this.retailerDiscountInputFiledAry = [];
    this.retailerDiscountSelectedProductId = undefined;
    this.hasNoFinancialProducts = false;
    this.isInitialLoadInModify = false;
  }

  handleRetailerDiscountSerializedData(){
    console.log('handleRetailerDiscountSerializedData EXISTS');
      let storedData;
      try {
          storedData = JSON.parse(this.retailerDiscountSerializedData);
          console.log('MS--- Parsed retailerDiscountSerializedData:', JSON.stringify(storedData));
      } catch (error) {
          return;
      }
      if(storedData.selectedProductId){
      this.retailerDiscountSelectedProductId =  storedData.selectedProductId;
      this.setDefaultSelectedProductId();
      }
      //const selectedProductId = storedData.selectedProductId;
      console.log('Selected Product ID from retailerDiscountSerializedData:', this.retailerDiscountSelectedProductId);

      let foundProduct = false;
      for (let i = 0; i < this.parsedResponse.length; i++) {
        console.log('Checking product ID:', this.parsedResponse[i].fullId);

        if (this.parsedResponse[i].fullId && this.retailerDiscountSelectedProductId &&
          this.parsedResponse[i].fullId === this.retailerDiscountSelectedProductId &&
          storedData.inputFields?.length > 0) {
            console.log('MS--- inputFields==> ', JSON.stringify(this.parsedResponse[i].inputFields));  
          foundProduct = true;
          const inputFields = this.parsedResponse[i].inputFields;

          storedData.inputFields.forEach(field => {
            const key = Object.keys(field)[0];
            console.log('MS--- '+key);
            if (inputFields[key]) {
              inputFields[key].defaultValue = field[key];
              console.log(`Updated ${key} ->`, field[key]);
            }
          });
          this.parsedResponse[i].inputFields = inputFields;
        }
      }
      this.retailerDiscountSerializedData = undefined;
      this.retailerDiscountSelectedProductId = undefined;
  }
  async loadMetadata() {
    try {
      this.mappingMetadataRecords = await getInputFieldsMappingRecords();
    } catch (error) {
        console.error('Error fetching metadata:', error);
    }
  }

  // handleModify(event) {
  //   const contactID = event.detail;
  //   console.log('ContactId in handleModify:', contactID);
  // }

  // renderedCallback() {
  //   console.log('ContactId in rendered Callback:', this.ContactId);
  // }

  //Radio buttons
  getProductIds() {
    this.namesWithIds = this.parsedResponse
      .filter(item => item.description && item.id)
      .map(item => ({ label: item.description, value: item.id }));
    console.log('Filtered Names with IDs:', this.namesWithIds);
  }

  setDefaultSelectedProductId() {//Set product Ids
    if(this.retailerDiscountSelectedProductId !== undefined && this.retailerDiscountSelectedProductId){
        this.selectedProductId = this.retailerDiscountSelectedProductId;
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
    // this.initializeInsuranceProduct();
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
    if (key.includes('finalTermRateRange')) {
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
    this.childInsuranceProductComponent = false;
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
    this.initializeInsuranceProduct();
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
      this.childInsuranceProductComponent = true;
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
          key !== "loanGrossAmountRange" &&
          key !== "interestRateRange" &&
          key !== "paymentDelayRange" &&
          key !== "commissionGrossAmountRange"
          // key !== "finalTermRateRange"
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
    console.log('MS updateParsedResponseForModify financeInformation ==>'+ JSON.stringify(this.financeInformation,null,2));
    for (let i = 0; i < this.parsedResponse.length; i++) {
      if (this.selectedProductId === this.parsedResponse[i].fullId) {
        console.log( this.parsedResponse[i].fullId +'<==MS updateParsedResponseForModify call2 ==>'+ this.selectedProductId);
        const inputFields = this.parsedResponse[i].inputFields;
        const allowedFields = this.getSliderNames(inputFields);
        let inputName;
        for (let j = 0; j < allowedFields.length; j++) {
          inputName = allowedFields[j];
          inputFields[inputName].defaultValue = this.getSavedValueFromFinInformation(inputName) ?? 0;
          this.parsedResponse[i].inputFields = inputFields;
        }
        
        //Finance Item
        if(this.financeitem){
          let financeitemParsed = JSON.parse(JSON.stringify(this.financeitem));
          console.log('MS updateParsedResponseForModify financeitem call');
          for(let x=0; x<financeitemParsed.length; x++){
            console.log(financeitemParsed[x].GOL_Record_Type_Name__c+' <==MS updateParsedResponseForModify financeitem loop call==> '+financeitemParsed[x].ERPT_FII_ExternalRef__c);
              if(financeitemParsed[x].GOL_Record_Type_Name__c === 'ERPT_FII_CPIProduct'){
                console.log('MS updateParsedResponseForModify CPIProduct call2');
                if(this.parsedResponse[i].cpiProducts){
                  this.parsedResponse[i].cpiProducts.forEach((e)=>{
                    if(e.id == financeitemParsed[x].ERPT_FII_ExternalRef__c){
                      e.checked = true;
                    }
                  });
                }
              }else if(financeitemParsed[x].GOL_Record_Type_Name__c === 'ERPT_FII_Arval_Additional_Fields'){
                console.log('MS updateParsedResponseForModify ERPT_FII_Arval_Additional_Fields call');
                if(this.parsedResponse[i].inputFields && this.parsedResponse[i].inputFields.services){
                  this.parsedResponse[i].inputFields.services.forEach((e1)=>{
                    if(e1.serviceId == financeitemParsed[x].ERPT_FII_ExternalRef__c){
                       e1.validValues.forEach((validVal)=>{
                          if(validVal.value == financeitemParsed[x].ERPT_FII_Value__c){
                              e1.defaultValue = financeitemParsed[x].ERPT_FII_Value__c;
                          }
                       });
                    }
                  });
                }
              }
          }
        }
        if(this.isInitialLoadInModify && this.financeInformation){
          if(this.financeInformation.GOL_Zip_Postal_Code__c){
            this.parsedResponse[i].zipCode = this.financeInformation.GOL_Zip_Postal_Code__c;
          }
          if(this.financeInformation.GOL_Age_Range__c){
            this.parsedResponse[i].ageRangeSelected = this.financeInformation.GOL_Age_Range__c;
          }       
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
    let sliderLabel = field.description;
    if (key === 'downPaymentRange' || key === 'downPaymentGrossAmountRange') {
      sliderLabel = `${field.description} ${this.label.GOL_Amount_incl_VAT}`;
    }
    let sliderObject;
    
    if (providerData.provider === 'ARVAL' && key === 'annualMileagesRange') {
        const durationRange = providerData.inputFields.durationsRange;
        const mileageRange = field;

        sliderObject = {
            id: 'dependentMileageSlider',
            label: mileageRange.description,
            min: mileageRange.minimum,
            max: this.getDynamicMaxValue(durationRange, mileageRange),
            step: mileageRange.step,
            defaultValue: storedValue !== undefined ? storedValue : mileageRange.defaultValue,
            unit: this.getUnits(key, providerData.units)
        };
    } else {
        sliderObject = {
            id: key,
            label: sliderLabel,
            min: field.minimum,
            max: field.maximum,
            step: field.step,
            defaultValue: storedValue !== undefined ? storedValue : field.defaultValue,
            unit: this.getUnits(key, providerData.units)
        };
    }

    console.log(`Slider Object Created:`, sliderObject);
    
    return sliderObject;
  }

  handleSliderChange(event) {
    const { id, value } = event.detail;
    if (this.selectedProductId) {
      if (!this.selectedSliderValues.has(this.selectedProductId)) {
          this.selectedSliderValues.set(this.selectedProductId, {});
      }
      this.selectedSliderValues.get(this.selectedProductId)[id] = value;
    }

    const product = this.getSelectedProduct();
    if (product) {
        if (product.provider === 'BNPP' && id === 'durationsRange') {
            this.updateBNPPMileage(value);
        } else if (product.provider === 'ARVAL' && id === 'durationsRange') {
            this.updateDependentSlider(value);
        }
    }
    // if (id === 'durationsRange') {
    //     this.updateDependentSlider(value);
    // }
    //this.updateDependentSlider(value);
    this.updateParsedResponse(id, value);
    this.sliders = [...this.sliders];
    this.handleUpdateRetailerDiscount(id, value);
  }

  logSliderChange(id, value) {
    console.log(`Slider changed: ${id} -> ${value}`);
    console.log(`${id} <== MS Slider changed MS ==> ${value}`);
    console.log(`${this.selectedProductId} <== this.selectedProductId this.parsedResponse MS ==> ${this.parsedResponse.length}`);
  }

  updateBNPPMileage(selectedDuration) {
    const product = this.getSelectedProduct();
    if (!product || !product.inputFields || !product.inputFields.annualMileagesRange) {
        console.warn('BNPP Mileage Update Skipped: Missing required fields in response');
        return;
    }

    let maxMileage = product.inputFields.annualMileagesRange.maximum;

    if (product.inputFields.finalTermRateRange && product.inputFields.finalTermRateRange.conditions) {
        for (const condition of product.inputFields.finalTermRateRange.conditions) {
            if (condition.numberConstraints) {
                for (const constraint of condition.numberConstraints) {
                    if (
                        constraint.constrainingPropertyName === "DURATION" &&
                        constraint.constrainingOperator === "EQUALS" &&
                        constraint.constrainingValueRangeInf === selectedDuration &&
                        constraint.constrainingValueRangeSup === selectedDuration
                    ) {
                        maxMileage = condition.constrainedValueRangeSup;
                        break;
                    }
                }
            }
        }
    }

    console.log(`BNPP Corrected Mileage Update: ${maxMileage} for Duration ${selectedDuration}`);

    const mileageSlider = this.sliders.find(slider => slider.id === 'annualMileagesRange');
    if (mileageSlider) {
        mileageSlider.max = maxMileage;
        mileageSlider.defaultValue = Math.min(mileageSlider.defaultValue, maxMileage);
    }

    setTimeout(() => {
        this.sliders = [...this.sliders];
    }, 50);
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
        const previousValue = dependentSlider.value;
        dependentSlider.max = matchingMileage.max;
        dependentSlider.step = mileageRange.step;
        dependentSlider.defaultValue = mileageRange.defaultValue;
        const expectedMileage = Math.round(previousValue / mileageRange.step) * mileageRange.step;
        dependentSlider.value = Math.min(expectedMileage, dependentSlider.max);
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
    if (!this.serializedData || Object.keys(this.serializedData).length === 0) {
      console.error("serializedData is not set properly");
      return;
    }
    //setTimeout(() => {
      this.dispatchEvent(new FlowAttributeChangeEvent('serializedData', JSON.stringify(this.serializedData)));
   // },50);
  }

  buildSerializedData() {
     // const cpiProducts = this.buildCpiProducts();
    //const inputFields = this.buildInputFields();
    // const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    if (!providerData) {
      console.error("No provider data found for selected product!");
      return;
    }
    const inputFields = this.buildInputFields();
    if (!inputFields || Object.keys(inputFields).length === 0) {
      console.error("No input fields found!");
      return;
    }
    console.log('-------providerData----------');
    console.log(providerData.cpiProducts);
    // const cpiProducts = providerData.cpiProducts ? providerData.cpiProducts.filter((ele,index) => ele.checked == true) : [];
    // const nonCpiProducts = providerData.nonCpiProducts ? providerData.nonCpiProducts.filter((ele,index) => ele.checked == true) : [];
    const cpiProducts = providerData.cpiProducts ? providerData.cpiProducts : [];
    const nonCpiProducts = providerData.nonCpiProducts ? providerData.nonCpiProducts : [];
    let services = providerData.inputFields.services ? providerData.inputFields.services : [];
    console.log('services befor filter', services);
    if(services && services.length > 0){
      services.forEach((childelement)=>{
        if(childelement.validValues && childelement.validValues.length > 0){
            delete childelement.validValues;
          }
      });
    }
    console.log('services after filter', services);
    //const ageRange = (providerData.ageRange && providerData.ageRangeSelected) ? providerData.ageRange.filter((ele,index) => ele.name == providerData.ageRangeSelected) : providerData.ageRange.length>0 ? providerData.ageRange[0] : [];
    let ageRange;
    if(providerData.ageRange && providerData.ageRange.length>0 && providerData.ageRangeSelected !== undefined){
      ageRange = providerData.ageRange.filter((ele,index) => ele.name == providerData.ageRangeSelected);
    }else if(providerData.ageRange && providerData.ageRange.length>0){
      ageRange = providerData.ageRange.filter((ele,index) => index == 0);
    }else{
      ageRange = [];
    }
    const zipCode = providerData.zipCode ? providerData.zipCode : '';
    
    const serializedData = {
      quoteId: this.quoteExternalId,
      typeOfUse: this.typeOfUse || "PRIVATE",
      personType: this.personType || "PHYSICAL",
      channel: this.channel || "POS",
      product: {
          fullId: providerData.fullId || "",
          name: providerData.name || "",
          description: providerData.description || "",
          selected: true,
          provider:providerData.provider || "",
          units: {
              mileageUnit: providerData.units.mileageUnit || "",
              currencyCode: providerData.units.currencyCode || "",
              creditTimeUnit: providerData.units.creditTimeUnit || ""
          },
          cpiProducts: cpiProducts,
          nonCpiProducts: nonCpiProducts,
          services:services,
          ageRange: ageRange,
          zipCode: zipCode,
          inputFields: inputFields
      }
  };
    this.serializedData = serializedData;
    console.log("Serialized Data:", JSON.stringify(this.serializedData, null, 2));
  }

  handleCalculateFinancingClick() {
  const providerData = this.getSelectedProduct();
  console.log("Before buildInputFields() - Selected Sliders:", JSON.stringify(this.selectedSliderValues, null, 2));

  if (providerData && providerData.inputFields) {
    if (!this.selectedSliderValues.has(this.selectedProductId)) {
      this.selectedSliderValues.set(this.selectedProductId, {});
    }
    
    Object.entries(providerData.inputFields).forEach(([key, field]) => {
      if (!this.selectedSliderValues.get(this.selectedProductId)[key]) {
        console.log(`Setting default value for ${key} -> ${field.defaultValue}`);
        this.selectedSliderValues.get(this.selectedProductId)[key] = field.defaultValue;
      }
    });
  }

  this.updateFlowVariables();
  console.log("Sending to Apex: ", JSON.stringify(this.serializedData, null, 2));
  this.dispatchEvent(new FlowAttributeChangeEvent('clickedButtonName', this.label.GOL_Calculate_Financing));
  this.dispatchEvent(new FlowNavigationNextEvent());
}
  handleUpdateRetailerDiscount(id, value) {
    //const providerData = this.parsedResponse.find(item => item.id === this.selectedProductId);
    //console.log('MS:: providerData==> '+JSON.stringify(providerData));
    // console.log(id+" MS::<====Id Value=====> "+value);
    let sliderInputDefaultVal = this.buildSliderInputRetailerDiscount();
    // var result = Object.entries(sliderInputDefaultVal);
    // result.forEach(([key, value]) => {
    //     this.retailerDiscountInputFiledAry.push({[key]: value});
    //   })
    // console.log("MS:: result:", JSON.stringify(result, null, 2));
    // console.log("MS:: Selected Input Fields:", JSON.stringify(sliderInputDefaultVal, null, 2));
    let selectedData;
    // if(value!==this.selectedProductId){
    // let checkKeyId = this.retailerDiscountInputFiledAry.some(x => x.hasOwnProperty(id));
    //   if(checkKeyId){
    //     this.retailerDiscountInputFiledAry.forEach((element,index) => {
    //       if(Object.keys(element) == id){
    //         this.retailerDiscountInputFiledAry[index][id] = value;
    //       }
    //   });
    //   }else{
    //     this.retailerDiscountInputFiledAry.push({[id]: value});
    //   }
      selectedData = {'selectedProductId':this.selectedProductId,'inputFields':sliderInputDefaultVal};
    // }else{
    //   selectedData = {'selectedProductId':this.selectedProductId,'inputFields':{}};
    // }
    // console.log('MS:: selectedData==> '+JSON.stringify(selectedData));

    this.dispatchEvent(new FlowAttributeChangeEvent('retailerDiscountSerializedData', JSON.stringify(selectedData)));
  
  }
  buildSliderInputRetailerDiscount() {
    let retailerDiscountInputFiledAry = [];
    const selectedFields = {};
    const modifiedSliderValues = this.selectedSliderValues.get(this.selectedProductId);
    Object.entries(modifiedSliderValues).forEach(([sliderId, selectedValue]) => {
      const sliderDetails = this.sliders.find(slider => slider.id === sliderId);
      if (sliderDetails) {
        if(sliderId === 'dependentMileageSlider'){
           sliderId = 'annualMileagesRange';
        }
        selectedFields[sliderId] = selectedValue ?? sliderDetails.defaultValue;
        let selectedVal = selectedValue ?? sliderDetails.defaultValue;
        retailerDiscountInputFiledAry.push({[sliderId]:selectedVal});
      }
    });
    // console.log('MS:: retailerDiscountInputFiledAry1==> '+JSON.stringify(retailerDiscountInputFiledAry));
    return retailerDiscountInputFiledAry;
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
  const modifiedSliderValues = this.selectedSliderValues.get(this.selectedProductId) || {};
  this.sliders.forEach((slider) => {
    const sliderId = slider.id === 'dependentMileageSlider' ? 'annualMileagesRange' : slider.id;
    selectedFields[sliderId] = {
        selectedValue: modifiedSliderValues[sliderId] ?? slider.defaultValue,
        step: slider.step ?? 1,
        defaultValue: slider.defaultValue ?? 0,
        minValue: slider.min ?? 0,
        maxValue: slider.max ?? 0,
        unit: slider.unit || '',
        label: slider.label || ''
    };
  });
  console.log("Selected Input Fields:", JSON.stringify(selectedFields, null, 2));
  return selectedFields;
}

//Dynamic Insurance Product
async initializeInsuranceProduct() {
  // if (!this.parsedResponse) {
  //   console.warn('Response is empty or not defined');
  //   return;
  // }
  // this.childInsuranceProductComponent = false;
  if(this.parsedResponse){
    //this.selectedProductId
    for(let i=0;i<this.parsedResponse.length;i++){
    if(this.parsedResponse[i].fullId === this.selectedProductId){
      if(this.parsedResponse[i].cpiProducts && this.parsedResponse[i].cpiProducts.length>0){
      this.parsedResponse[i].cpiProducts.forEach((childelement)=>{
      if(childelement.checked === undefined){
        childelement.checked = false;
      }
    });
    }
    if(this.parsedResponse[i].nonCpiProducts && this.parsedResponse[i].nonCpiProducts.length>0){
      this.parsedResponse[i].nonCpiProducts.forEach((schildelement)=>{
      if(schildelement.checked === undefined){
        schildelement.checked = false;
      }
    });
    }
  }
}
}
  this.insuranceProducts = this.getSelectedProduct();
  console.log('MS++ initializeInsuranceProduct==> '+JSON.stringify(this.insuranceProducts,null,2));
   // if (providerData && providerData.inputFields) {
    //   this.selectedSliderValues.set(this.selectedProductId, {});
    //   Object.entries(providerData.inputFields).forEach(([key, field]) => {
    //     if (!this.selectedSliderValues.get(this.selectedProductId)[key]) {
    //       this.selectedSliderValues.get(this.selectedProductId)[key] = field.defaultValue;
    //     }
    //   });
    // }
    // setTimeout(() => {
    //   this.childInsuranceProductComponent = true;
    // }, 200);
}
handleInsuranceProductChange(event){
  let parameters = event.detail;
  console.log('MS+++ handleInsuranceProductChange==> '+JSON.stringify(parameters));
  if(this.parsedResponse){
    //this.selectedProductId
    for(let i=0;i<this.parsedResponse.length;i++){
      if(parameters.productHeaderName === 'clientage'){
        this.parsedResponse[i].ageRangeSelected = parameters.selectedProduct;
      }
      if(parameters.productHeaderName === 'zipcode'){
        this.parsedResponse[i].zipCode = parameters.selectedProduct;
      }
    if(this.parsedResponse[i].fullId === this.selectedProductId){
      
      // if(parameters.productHeaderName === 'clientage'){
      //   this.parsedResponse[i].ageRangeSelected = parameters.selectedProduct;
      // }
      // if(parameters.productHeaderName === 'zipcode'){
      //   this.parsedResponse[i].zipCode = parameters.selectedProduct;
      // }
      if(parameters.productHeaderName === 'cpiProducts'){
      this.parsedResponse[i].cpiProducts.forEach((childelement)=>{
      if(childelement.id === parameters.productId){
        childelement.checked = parameters.selectedProduct;
      }
    });
    }
    if(parameters.productHeaderName === 'nonCpiProducts'){
      this.parsedResponse[i].nonCpiProducts.forEach((schildelement)=>{
      if(schildelement.id === parameters.productId){
        schildelement.checked = parameters.selectedProduct;
      }
    });
    }
    if(parameters.productHeaderName === 'services'){
      console.log('services call'); // Service Logic
      this.parsedResponse[i].inputFields.services.forEach((childelement)=>{
        if(childelement.serviceId === parameters.productId){
           childelement.selectedValue = parameters.selectedProduct;
           childelement.defaultValue = parameters.selectedProduct;
        }
      });
    }
}
}
}
  // if (this.selectedProductId) {

  // }
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