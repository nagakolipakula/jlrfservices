import { LightningElement, api, track, wire } from 'lwc';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

import LMS_AccessoriesAppMissingDealerCode from '@salesforce/label/c.LMS_AccessoriesAppMissingDealerCode';
import LMS_AccessoriesAppMissingModelCode from '@salesforce/label/c.LMS_AccessoriesAppMissingModelCode';
import LMS_AccessoryPacksOnly from '@salesforce/label/c.LMS_AccessoryPacksOnly';
import LMS_Accessory_NotRequiredReason from '@salesforce/label/c.LMS_Accessory_NotRequiredReason';
import LMS_AddAddOns_NotRequiredReason from '@salesforce/label/c.LMS_AddAddOns_NotRequiredReason';
import LMS_AddInfoMessage from '@salesforce/label/c.LMS_QuoteAddShowToastInfo';
import LMS_AddSuccessMessage from '@salesforce/label/c.LMS_QuoteAddShowToastSuccess';
import LMS_AddSuccessTitle from '@salesforce/label/c.LMS_QuoteAddShowToastSuccessTitle';
import LMS_AddToQuote from '@salesforce/label/c.LMS_AddToQuote';
import LMS_AllCampaignsNotCompatible from '@salesforce/label/c.LMS_AllCampaignsNotCompatible';
import LMS_AlreadyExistingCampains from '@salesforce/label/c.LMS_AlreadyExistingCampains';
import LMS_CampaignsAreNotCompatible from '@salesforce/label/c.LMS_CampaignsAreNotCompatible';
import LMS_CampaignsWithDifferentSalesChannel from '@salesforce/label/c.LMS_CampaignsWithDifferentSalesChannel';
import LMS_Category from '@salesforce/label/c.LMS_Category';
import LMS_ChooseReason from '@salesforce/label/c.LMS_ChooseReason';
import LMS_ChosenReason from '@salesforce/label/c.LMS_ChosenReason';
import LMS_ClearanceOnly from '@salesforce/label/c.LMS_ClearanceOnly';
import LMS_CommonTypeOfSale from '@salesforce/label/c.LMS_CommonTypeOfSale';
import LMS_ContactAdministrator	from '@salesforce/label/c.LMS_ContactAdministrator';
import LMS_DiscountBasis from '@salesforce/label/c.LMS_DiscountBasis';
import LMS_DisplayPictureId from '@salesforce/label/c.LMS_DisplayPictureId';
import LMS_Error from '@salesforce/label/c.LMS_Error';
import LMS_GlobalSalesChannel from '@salesforce/label/c.LMS_GlobalSalesChannel';
import LMS_LabourCost from '@salesforce/label/c.LMS_LabourCost';
import LMS_LabourTimeMinutes from '@salesforce/label/c.LMS_LabourTimeMinutes';
import LMS_NetPriceValue from '@salesforce/label/c.LMS_NetPriceValue';
import LMS_NoRowsSelected from '@salesforce/label/c.LMS_NoRowsSelected';
import LMS_NonePicklistValue from '@salesforce/label/c.LMS_NonePicklistValue';
import LMS_PartNumber from '@salesforce/label/c.LMS_PartNumber';
import LMS_PercentageCharge from '@salesforce/label/c.LMS_PercentageCharge';
import LMS_PriceValue from '@salesforce/label/c.LMS_PriceValue';
import LMS_QUO_ImportAccessories from '@salesforce/label/c.LMS_QUO_ImportAccessories';
import LMS_QUO_LaunchAccessoriesApp	from '@salesforce/label/c.LMS_QUO_LaunchAccessoriesApp';
import LMS_QUO_UnknownError	from '@salesforce/label/c.LMS_QUO_UnknownError';
import LMS_RemoveCampaignsFromQLI from '@salesforce/label/c.LMS_RemoveCampaignsFromQLI';
import LMS_RetailerOnly from '@salesforce/label/c.LMS_RetailerOnly';
import LMS_RetailerPromotions from '@salesforce/label/c.LMS_RetailerPromotions';
import LMS_Save from '@salesforce/label/c.LMS_Save';
import LMS_Search from '@salesforce/label/c.LMS_Search';
import LMS_SearchBy from '@salesforce/label/c.LMS_SearchBy';
import LMS_SearchLabel from '@salesforce/label/c.LMS_SearchLabel';
import LMS_ShortDescription from '@salesforce/label/c.LMS_ShortDescription';
import LMS_SubCategory from '@salesforce/label/c.LMS_SubCategory';
import LMS_SupplementName from '@salesforce/label/c.LMS_SupplementName';
import LMS_SupplementTerm from '@salesforce/label/c.LMS_SupplementTerm';
import LMS_SupplementValidFrom from '@salesforce/label/c.LMS_SupplementValidFrom';
import LMS_SupplementValidTo from '@salesforce/label/c.LMS_SupplementValidTo';
import LMS_UnknownError	from '@salesforce/label/c.LMS_UnknownError';
import LMS_VMEPromotions from '@salesforce/label/c.LMS_VMEPromotions';
import {NavigationMixin} from "lightning/navigation";
import QUOTE_CONFIG_CODE_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_ConfigurationVehicle__r.LMS_CVH_VehicleModel__r.LMS_VMO_Code__c';
import QUOTE_IS_CONFIG_CAR_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_isConfigCarQuote__c';
import QUOTE_IS_NEW_CAR_QUOTE_COUNT_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_isNewCarQuoteCount__c';
import QUOTE_IS_USED_CAR_QUOTE_COUNT_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_isUsedCarQuoteCount__c';
import QUOTE_RECORDTYPE_FIELD from '@salesforce/schema/LMS_Quote__c.RecordTypeId';
import QUOTE_RETAILER_CODE_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_ShowroomId__r.LMS_SWR_RetailerCode__c';
import QUOTE_STATUS_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_Status__c';
import QUOTE_STOCK_CODE_FIELD from '@salesforce/schema/LMS_Quote__c.LMS_QUO_StockVehicle__r.LMS_VHC_VehicleModel__r.LMS_VMO_Code__c';
import QuoteObject from '@salesforce/schema/LMS_Quote__c';
import SS_RECORDTYPE_NAME_FIELD from '@salesforce/schema/LMS_SilentSalesman__c.RecordType.DeveloperName';
import SS_RETAILER_CODE_FIELD from '@salesforce/schema/LMS_SilentSalesman__c.LMS_SIL_StockVehicleId__r.LMS_VHC_Account__r.LMS_ACC_ShowroomId__r.LMS_SWR_RetailerCode__c';
import SS_STOCK_CODE_FIELD from '@salesforce/schema/LMS_SilentSalesman__c.LMS_SIL_StockVehicleId__r.LMS_VHC_VehicleModel__r.LMS_VMO_Code__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SupplementObject from '@salesforce/schema/LMS_Accessory__c';
import checkIfThereIsAccessory from '@salesforce/apex/LMS_QOT_AddQliViewController.isThereAnAccesory';
import checkIfThereIsAddOn from '@salesforce/apex/LMS_QOT_AddQliViewController.isThereAnAddOn';
import getAllPromotions from '@salesforce/apex/LMS_QOT_AddQliViewController.getAllPromotions';
import getCustomSettings from '@salesforce/apex/LMS_QOT_AddQliViewController.getCustomSettings';
import getDependentMap from '@salesforce/apex/LMS_QOT_AddQliViewController.getDependentMap';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import getRetailerId from '@salesforce/apex/LMS_QOT_AddQliViewController.getCurrentGroupId';
import getShowroomDealerCode from '@salesforce/apex/LMS_QOT_AddQliViewController.getShowroomDealerCode';
import queryNotReqReason from '@salesforce/apex/LMS_QOT_AddQliViewController.queryAccessoryAndAddOnLWCReason';
import retrieveRetailerRate from '@salesforce/apex/LMS_QOT_AddQliViewController.retrieveRetailerRate';
import saveReasonOnQuoteAccessory from '@salesforce/apex/LMS_QOT_AddQliViewController.updateModifiedQuoteLWCAccessory';
import saveReasonOnQuoteAddOn from '@salesforce/apex/LMS_QOT_AddQliViewController.updateModifiedQuoteLWCAddOn';
import saveSilentSalesmanFeatures from '@salesforce/apex/LMS_QOT_AddQliViewController.saveSilentSalesmanFeatures';
import saveSupplements from '@salesforce/apex/LMS_QOT_AddQliViewController.saveQLI';
import searchSupplements from '@salesforce/apex/LMS_QOT_AddQliViewController.getSupplements';
import getPromotionOnQuote from '@salesforce/apex/GOL_PromotionDataTableController.getPromotionOnQuote'; //Added by MS

const ACCESSORIES_APP = 'Accessories_App';
const ACCESSORIES_REST = 'Accessories_REST';
const DRAFT_STATUS = 'Draft';
const ACCESSORIES_RT = 'LMS_ACS_Accessories';
const ADDONS_RT = 'LMS_ACS_AddOns';
const VMEPROMOTIONS_RT = 'LMS_ACS_VMEPromotions';
const SS_NEWVEHICLE_RT = 'LMS_SIL_NewVehicle';
const SS_USEDVEHICLE_RT = 'LMS_SIL_UsedVehicle';

const DEALER_CODE = '[DealerCode]';
const MODEL_CODE = '[ModelCode]';

export default class LMS_AddAddOn extends NavigationMixin(LightningElement) {

    @api recordId;
    @api recordType;
    @api isThereAnAddOn;
    @api salesCountryCode;
    @api sObjectType;
    @track quoteRecordType;
    @track isTaxExempt = false;
    @track selectedReasonAddOn;
    @track selectedReasonAccessory;
    @track searchData;
    @track columns;
    @track errorMsg = '';
    @track isAccessoryOrAddOnRT = false;
    @track isAccessoryRT = false;
    @track isAddOnRT = false;
    @track isPromotionRT = false;
    @track isVMEPromotionRT = false;
    @track isClearanceOnly = false;
    @track isRetailerOnly = false;
    @track isAccessoryPackOnly = false;
    @track controllingValues = [];
    @track controllingValuesReasonAccessory = [];
    @track controllingValuesReasonAddOn = [];
    @track dependentValues = [];
    @track selectedCategory;
    @track isThereAnAccessory = false;
    @track selectedSubcategory;
    @track isEmpty = false;
    @track error;
    @track draftValues = [];
    @track recTypeId;
    @track quoteTypeId;
    @track accessoriesReasonPicklist = [];
    @track params = [];
    @track paramsAccessory = [];
    @track loadMoreStatus = false;
    @track isMore = false;
    @track clickedButton = false;
    @track isLastSearched = false;
    @track selectedChannel;
    @track selectedCommonType;
    @track isChannelEmpty = false;
    @track channelOptions = [];
    @track commonTypeOptions = [];
    @track data;
    @track unCompatibleData = [];
    @track isModalOpen =  false;
    @track selectedValues;
    @track previousSelections = new Set();
    @track selectedRows =[];
    @track selectedRowIds = new Set();
    @track latestSelectedId;
    @track existingVMEIds = new Set();
    @track onFirstLoad = false;
    @track isSmart2CSSClass = '';
    @track intialSearchData;
    @api gsRESET=false;
    @api gsFsIntegration;

    @wire(getAllPromotions, { recordId: '$recordId', globalSalesChannel: '$selectedChannel', commonTypeOfSale: '$selectedCommonType' })
    wiredPromotions;

    customSettings;
    isVisibleShowLaunchAccessoriesAppButton = false;
    isVisibleShowImportAccessoriesButton = false;
    showImportAccessoriesPopup = false;
    quote;
    silentSalesman;
    @api gsRest = false;//GOL-1769
    controlValues;
    retailerId;
    retailerRate;
    totalDependentValues = [];
    searchBy = '';
    redirect;
    isUsedVehicle;
    isNewVehicle;

    label = {
        LMS_AddSuccessMessage,
        LMS_AddInfoMessage,
        LMS_ChosenReason,
        LMS_Category,
        LMS_SubCategory,
        LMS_ClearanceOnly,
        LMS_RetailerOnly,
        LMS_AccessoryPacksOnly,
        LMS_SearchBy,
        LMS_Search,
        LMS_AddToQuote,
        LMS_DisplayPictureId,
        LMS_SupplementName,
        LMS_PartNumber,
        LMS_ShortDescription,
        LMS_PriceValue,
        LMS_PercentageCharge,
        LMS_NetPriceValue,
        LMS_LabourTimeMinutes,
        LMS_LabourCost,
        LMS_SupplementTerm,
        LMS_SupplementValidFrom,
        LMS_Save,
        LMS_SearchLabel,
        LMS_SupplementValidTo,
        LMS_Accessory_NotRequiredReason,
        LMS_NonePicklistValue,
        LMS_ChooseReason,
        LMS_AddAddOns_NotRequiredReason,
        LMS_QUO_LaunchAccessoriesApp,
        LMS_QUO_ImportAccessories,
        LMS_UnknownError,
        LMS_ContactAdministrator,
        LMS_Error,
        LMS_AccessoriesAppMissingModelCode,
        LMS_AccessoriesAppMissingDealerCode,
        LMS_GlobalSalesChannel,
        LMS_CommonTypeOfSale,
        LMS_VMEPromotions,
        LMS_RetailerPromotions,
        LMS_AllCampaignsNotCompatible,
        LMS_NoRowsSelected,
        LMS_RemoveCampaignsFromQLI,
        LMS_AlreadyExistingCampains,
        LMS_CampaignsAreNotCompatible,
        LMS_CampaignsWithDifferentSalesChannel,
		LMS_DiscountBasis
    };

    @wire(getShowroomDealerCode) showroom;
    
    //Added by MS wire method
    @wire(getPromotionOnQuote, {
        quoteId: "$recordId",
    })
    wireForRefreshPromotionDatatable;

    refreshAccessories(event) {
        this.isThereAnAccessory = true;
        //GOL-1769
        if(this.gsRest){
        console.log('Call from the refresh apex')
        const eve = new CustomEvent('sucess',{
        detail: true
        })

        this.dispatchEvent(eve)

        }
    }

    connectedCallback() {
        console.log('connected---->',this.gsFsIntegration);
        this.setRTAttribute();
        this.getRetailerId();
        if (this.isAccessoryRT) {
            this.getRetailerRate();
        }
        this.setColumnsPerRT();
        this.checkIfThereIsAccessory();
        this.checkIfThereIsAddOn();
        this.initAccessoriesNotReqReason();
        this.initAddOnsNotReqReason();
        this.handleSearch();
        this.isSmart2CSSClass = window.location.href.includes('hybrid-main-screen') ? '' : 'height: 15rem';
    }

    // renderedCallback() {
    //     console.log(this.isRendered);
    //     if (this.isRendered) {
    //         return; 
    //     }
    //     this.isRendered = true;
    
    //     let style = document.createElement('style');
    //     style.innerText = '.slds-th__action{background-color: #000000; color: #ffffff;}';
    //     this.template.querySelector('lightning-datatable').appendChild(style);
    // }

    setRTAttribute() {
        if (this.recordType == ACCESSORIES_RT) {
            this.isAccessoryOrAddOnRT = true;
            this.isAccessoryRT = true;
            this.recTypeId = '0120Y000000NFqg';
            this.quoteTypeId = '0120Y000000NFrIQAW';
        } else if (this.recordType == ADDONS_RT) {
            this.isAddOnRT = true;
            this.isAccessoryOrAddOnRT = true;
            this.recTypeId = '0120Y000000NFqh';
            this.quoteTypeId = '0120Y000000NFrIQAW';
        } else if (this.recordType == VMEPROMOTIONS_RT){
            this.isVMEPromotionRT = true;
            this.recTypeId = '0120Y000000NFqi';
        }else {
            this.isPromotionRT = true;
            this.recTypeId = '0120Y000000NFqi';
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: [QUOTE_RECORDTYPE_FIELD, QUOTE_STATUS_FIELD, QUOTE_RETAILER_CODE_FIELD, QUOTE_IS_CONFIG_CAR_FIELD, QUOTE_IS_USED_CAR_QUOTE_COUNT_FIELD, QUOTE_IS_NEW_CAR_QUOTE_COUNT_FIELD, QUOTE_CONFIG_CODE_FIELD, QUOTE_STOCK_CODE_FIELD]})
    getQuoteRT({ error, data }) {
        if (data) {
            let result = JSON.parse(JSON.stringify(data));
            this.quote = result;
            this.quoteRecordType = result.fields.RecordTypeId.value;
            this.isUsedVehicle = result.fields.LMS_QUO_isUsedCarQuoteCount__c.value;
            this.isNewVehicle = result.fields.LMS_QUO_isNewCarQuoteCount__c.value;
            this.isTaxExempt = false;
            if (this.quoteRecordType == '0120Y000000NFrKQAW' || this.quoteRecordType == '0120Y000000NFrLQAW') {
                this.isTaxExempt = true;
            }
            this.setColumnsPerRT();
            this.doGetCustomSettings(result.fields.LMS_QUO_Status__c.value);
        } else if (error) {
            this.error = JSON.stringify(error);
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: [SS_RECORDTYPE_NAME_FIELD, SS_STOCK_CODE_FIELD]})
    getSilentSalesmanRT({ error, data }) {
        if (data) {
            let result = JSON.parse(JSON.stringify(data));
            this.silentSalesman = result;
            this.isUsedVehicle = false; //TODO:
            this.isNewVehicle = false; //TODO:
            let ss_rt_name = result.fields.RecordType.value.fields.DeveloperName.value;
            if (ss_rt_name == SS_NEWVEHICLE_RT) {
                this.isNewVehicle = true;
            } else if (ss_rt_name == SS_USEDVEHICLE_RT) {
                this.isUsedVehicle = true;
            }
            this.setColumnsPerRT();
            this.doGetCustomSettings(null);
        } else if (error) {
            this.error = JSON.stringify(error);
        }
    }

    doGetCustomSettings(status) {
        console.log('====<<>>>'+this.recordId);
        getCustomSettings({recordId: this.recordId})
            .then(result =>{
                this.customSettings = result;
                this.shouldShowLaunchAccessoriesAppButton(status, result);
                this.shouldShowImportAccessoriesButton(status, result);
            }).catch(error =>{
                console.error(error);
            })
    }

    setColumnsPerRT() {
        console.log('MS Test this.recordType==>'+this.recordType); //added by MS
        if (this.recordType !== VMEPROMOTIONS_RT) {
            this.columns = [
                {label: this.label.LMS_SupplementName, fieldName: 'Name', type: 'text', cellAttributes: {alignment: 'left'}}
            ];
        } else {
            this.columns = []; 
        }
        let priceLabel = this.label.LMS_PriceValue;
        let priceField = 'LMS_ACS_PriceValue__c';
        if (this.isTaxExempt) {
            priceLabel = this.label.LMS_NetPriceValue;
            priceField = 'LMS_ACS_NetPrice__c'
        }
        if (this.recordType == ACCESSORIES_RT) {
            this.columns.push(
                {label: this.label.LMS_PartNumber, fieldName: 'LMS_ACS_PartNumber__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_ShortDescription, fieldName: 'LMS_ACS_ShortDescription__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: priceLabel, fieldName: priceField, type: 'currency', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_LabourTimeMinutes, fieldName: 'LMS_ACS_FittingMinutes__c', type: 'number', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_LabourCost, fieldName: 'RetailerRate', type: 'currency', cellAttributes: {alignment: 'left'}}
            );
        } else if (this.recordType == ADDONS_RT) {
            this.columns.push(
                {label: this.label.LMS_SupplementTerm, fieldName: 'LMS_ACS_Term__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_ShortDescription, fieldName: 'LMS_ACS_ShortDescription__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: priceLabel, fieldName: priceField, type: 'currency', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_PercentageCharge, fieldName: 'LMS_ACS_PercentageCharge__c', type: 'currency', cellAttributes: {alignment: 'left'}},
            );
        } else if (this.recordType == VMEPROMOTIONS_RT) {
            this.columns.push(
                {label:'Customer Campaing Name', fieldName:'Customer_Campaign_Name__c', type:'text', cellAttributes: {alignment:'left'}},
                {label: this.label.LMS_SupplementValidFrom, fieldName: 'VME_Start_Date__c', type: 'date', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_SupplementValidTo, fieldName: 'VME_End_Date__c', type: 'date', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_DiscountBasis, fieldName: 'VME_Invoice_segment__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: priceLabel, fieldName: 'VME_Amount__c', type: 'currency', cellAttributes: {alignment: 'left'}},
				{label: this.label.LMS_PercentageCharge, fieldName: 'VME_Percentage__c', type: 'number', cellAttributes: {alignment: 'left'}},
            );
        }else {
            this.columns.push(
                {label: this.label.LMS_SupplementValidFrom, fieldName: 'LMS_ACS_ValidFrom__c', type: 'date', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_SupplementValidTo, fieldName: 'LMS_ACS_ValidTo__c', type: 'date', cellAttributes: {alignment: 'left'}},
                {label: this.label.LMS_ShortDescription, fieldName: 'LMS_ACS_ShortDescription__c', type: 'text', cellAttributes: {alignment: 'left'}},
                {label: priceLabel, fieldName: priceField, type: 'currency', cellAttributes: {alignment: 'left'}},
				{label: this.label.LMS_PercentageCharge, fieldName: 'LMS_ACS_PercentageCharge__c', type: 'number', cellAttributes: {alignment: 'left'}}
            );
        }
    }

    @wire(getDependentMap, { objDetail: {'sobjectType' : 'VME_Campaign_Specifications__c'}, contrfieldApiName: 'VME_Channel__c', depfieldApiName: 'VME_Sales_Channel__c' })
    wiredDependentPicklistValues({ error, data }) {
        console.log('Data================:', data);
        this.data = data;
        if (data) {
            this.channelOptions = this.formatPicklistOptions(Object.keys(data));
            if (!this.selectedChannel && this.channelOptions.length > 0) {
                this.selectedChannel = this.channelOptions[0].value;
            }
            this.commonTypeOptions = this.formatPicklistOptions(data[this.selectedChannel]);
            this.isChannelEmpty = false;
        } else if (error) {
            console.error('Error fetching dependent picklist values:', error);
            this.error = JSON.stringify(error);
        }
    }
    handleChannelChange(event) {
        this.selectedChannel = event.detail.value;
        this.selectedCommonType = null;
        if (this.selectedChannel === '--None--') {
            this.selectedChannel = null;
            this.selectedCommonType = null;
            this.isChannelEmpty = true;
        } else if (this.data) {
            this.commonTypeOptions = this.formatPicklistOptions(this.data[this.selectedChannel]);
            this.isChannelEmpty = false;
        } else {
            console.error('Data is not available.');
        }
    }
    handleCommonTypeChange(event) {
        this.selectedCommonType = event.detail.value;
    }
    formatPicklistOptions(data) {
        let options = [{ label: '--None--', value: null }];
        if (Array.isArray(data)) {
            for (const value of data) {
                options.push({
                    label: value === '--None--' ? null : value,
                    value: value
                });
            }
        } else {
            console.error('Data is not an array:', data);
        }
        return options;
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: SupplementObject, recordTypeId: '$recTypeId'})
    picklistValues({error, data}) {
        if(data) {
            this.error = null;

            let categoryOptions = [{label: this.label.LMS_NonePicklistValue, value:'--None--'}];

            data.picklistFieldValues.LMS_ACS_Category__c.values.forEach(key => {
                categoryOptions.push({
                    label : key.label,
                    value: key.value
                })
            });

            this.controllingValues = categoryOptions;

            let subcategoryOptions = [{label: this.label.LMS_NonePicklistValue, value:'--None--'}];

            this.controlValues = data.picklistFieldValues.LMS_ACS_Subcategory__c.controllerValues;
            this.totalDependentValues = data.picklistFieldValues.LMS_ACS_Subcategory__c.values;

            this.totalDependentValues.forEach(key => {
                subcategoryOptions.push({
                    label : key.label,
                    value: key.value
                })
            });

            this.dependentValues = subcategoryOptions;
        }
        else if(error) {
            this.error = JSON.stringify(error);
        }
    }

    /**
     Get picklist values for Accessory Reason Picklist on Quote
     */
    @wire(getPicklistValuesByRecordType, { objectApiName: QuoteObject, recordTypeId: '$quoteTypeId' })
    picklistValuesReasonAccessory({error, data}) {
        if(data) {
            this.error = null;

            let reasonOptions = [{label: LMS_ChosenReason, value: LMS_ChosenReason}];

            data.picklistFieldValues.LMS_QUO_AccessoriesNotRequiredReason__c.values.forEach(key => {
                reasonOptions.push({
                    label: key.label,
                    value: key.value
                })
            });

            this.controllingValuesReasonAccessory = reasonOptions;
        }
        else if(error) {
            this.error = JSON.stringify(error);
        }
    }

    /**
     Get picklist values for AddOn Reason Picklist on Quote
     */
    @wire(getPicklistValuesByRecordType, { objectApiName: QuoteObject, recordTypeId: '$quoteTypeId' })
    picklistValuesReasonAddOn({error, data}) {
        if(data) {
            this.error = null;

            let reasonOptions = [{label: LMS_ChosenReason, value: LMS_ChosenReason}];

            data.picklistFieldValues.LMS_QUO_AddOnsNotRequiredReason__c.values.forEach(key => {
                reasonOptions.push({
                    label: key.label,
                    value: key.value
                })
            });

            this.controllingValuesReasonAddOn = reasonOptions;
        }
        else if(error) {
            this.error = JSON.stringify(error);
        }
    }

    /**
        Handles the change on category picklist
     */
    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
        this.isEmpty = false;
        let dependValues = [];

        if(this.selectedCategory) {
            if(this.selectedCategory === '--None--') {
                this.isEmpty = true;
                dependValues = [{label:'--None--', value:'--None--'}];
                this.selectedCategory = null;
                this.selectedSubcategory = null;
                return;
            }

            this.totalDependentValues.forEach(conValues => {
                if(conValues.validFor[0] === this.controlValues[this.selectedCategory]) {
                    dependValues.push({
                        label: conValues.label,
                        value: conValues.value
                    })
                }
            });
            if (this.salesCountryCode === 'DE' && this.selectedCategory === 'Warranty') {
                dependValues = dependValues.filter(value => value.value === 'Extended Warranty' || value.value === 'Used car warranty (assembly warranty)' || value.value ==='Mobility Warranty' ); }
                this.dependentValues = dependValues;
        }
    }

    /**
     Invoked on Save Reason button click for AddOn to update the value of selected reason if an AddOn has been added.
     */
    handleReasonSaveAddOn() {
        this.params = [];

        this.params.push (
            this.value = this.recordId
        );
        this.params.push (
            this.value = this.selectedReasonAddOn
        );

        if(this.selectedReasonAddOn != 'Choose Reason' && this.selectedReasonAddOn != null) {
            saveReasonOnQuoteAddOn({params: this.params}).then(result => {
                this.showNotificationSuccess();
            });
        } else if(this.selectedReasonAddOn == 'Choose Reason') {
            this.showNotificationInfo();
        }
    }

    /**
     Invoked on Save Reason button click for Accessory to update the value of selected reason if an Accessory has been added.
     */
    handleReasonSaveAccessory() {
        this.paramsAccessory = [];
        this.paramsAccessory.push(
            this.value = this.recordId
        );
        this.paramsAccessory.push(
            this.value = this.selectedReasonAccessory
        );
        if (this.silentSalesman != null) {
            this.showNotificationSuccess();
        } else if (this.selectedReasonAccessory != 'Choose Reason' && this.selectedReasonAccessory != null) {
            saveReasonOnQuoteAccessory({params: this.paramsAccessory}).then(result => {
                this.showNotificationSuccess();
            });
        } else if (this.selectedReasonAccessory == 'Choose Reason') {
            this.showNotificationInfo();
        }
    }

    /**
     * Used for showing user toast messages when clicking on Save Reason button - success message after reason is saved.
     */
    showNotificationSuccess() {
        const evt = new ShowToastEvent({
            title: LMS_AddSuccessTitle,
            message: LMS_AddSuccessMessage,
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }

    /**
     * Used for showing user toast messages when clicking on Save Reason button - info message when reason is not selected.
     */
    showNotificationInfo() {
        const evt = new ShowToastEvent({
            title: '',
            message: LMS_AddInfoMessage,
            variant: 'info',
        });
        this.dispatchEvent(evt);
    }

    /**
     * Checks if there is an Accessory added to the Quote and sets the parameter accordingly
     */
    checkIfThereIsAccessory() {
        checkIfThereIsAccessory({recordId: this.recordId}).then(result => {
              this.isThereAnAccessory = result; //TODO: add new rts from the SSF
        });
    }

    /**
     * Checks if there is an Accessory added to the Quote and sets the parameter accordingly
     */
    checkIfThereIsAddOn() {
        checkIfThereIsAddOn({recordId: this.recordId}).then(result => {
            this.isThereAnAddOn = result; //TODO: add new rts from the SSF
        });
    }

    /**
     * Retrieves a Not required picklist value for Accessories
     */
    initAccessoriesNotReqReason() {
        if (this.recordType === ACCESSORIES_RT) { //TODO: add new rts from the SSF
            queryNotReqReason({
                recordId: this.recordId,
                recTypeName: this.recordType
            })
            .then(result => {
                this.selectedReasonAccessory = result;
            })
            .catch(error => {
                if (error.body && error.body.message) {
                    this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.message;
                } else {
                    this.errorMsg = LMS_QUO_UnknownError;
                }
            });
        }
    }

    /**
     * Retrieves a Not required picklist value for Add-ons
     */
    initAddOnsNotReqReason() {
        if (this.recordType === ADDONS_RT) {
            queryNotReqReason({
                recordId: this.recordId,
                recTypeName: this.recordType
            })
            .then(result => {
                this.selectedReasonAddOn = result;
            })
            .catch(error => {
                if (error.body && error.body.message) {
                    this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.message;
                } else {
                    this.errorMsg = LMS_QUO_UnknownError;
                }
            });
        }
    }

    /**
     Handles the change on reason picklist for Accessory
     */
    handleReasonChangeAccessory(event) {
        this.selectedReasonAccessory = event.target.value;
        this.handleReasonSaveAccessory();
    }

    /**
     Handles the change on reason picklist for AddOn
     */
    handleReasonChangeAddOn(event) {
        this.selectedReasonAddOn = event.target.value;
        this.handleReasonSaveAddOn();
    }

    /**
     Handles the change on subcategory picklist
     */
    handleSubcategoryChange(event) {
        this.selectedSubcategory = event.target.value;
    }

    /**
     Handles the change of 'Clearance Only' checkbox
     */
    handleChangeClearance(event) {
        this.isClearanceOnly = event.target.checked;
    }

    /**
     Handles the change of 'Retailer Only' checkbox
     */
    handleChangeRetailerOnly(event) {
        this.isRetailerOnly = event.target.checked;
    }

    /**
     Handles the change of 'Accessory Packs Only' checkbox
     */
    handleChangeAccessoryPackOnly(event) {
        this.isAccessoryPackOnly = event.target.checked;
    }

    /**
     Handles the change of 'Search by' input field
     */
    handleSearchBy(event) {
        this.searchBy = event.detail.value;
    }

    /**
     Retrieves retailer rate for the current showroom
     */
    getRetailerRate() {
        retrieveRetailerRate({}).then(result => {
            this.retailerRate = result;
        }).catch(error => {
            this.retailerRate = undefined;
            console.log(JSON.stringify(error));
            if (error) {
                this.errorMsg = error.body.message;
            }
        });
    }

    /**
     Retrieves retailer Id for the current user
     */
    getRetailerId() {
        getRetailerId({}).then(result => {
            this.retailerId = result;
        }).catch(error => {
            this.retailerId = undefined;
            console.log(JSON.stringify(error));
            if(error) {
                this.errorMsg = error.body.message;
            }
        });
    }

    handleSearchButton(){
        this.clickedButton = true;
        this.isLastSearched = false;
        this.handleSearch();
    }

    /**
     Handles click on the 'Search' button
     */
        handleSearch() {
        this.errorMsg = '';
        let currentRecord = '';
        let lastRecId = '';
        if(this.searchData != null && !this.clickedButton) {
            if(this.isLastSearched || this.searchData.length < 50) {
                return;
            }
            currentRecord = this.searchData;
            lastRecId = currentRecord[currentRecord.length-1].Id;
            this.isMore = true;
        }
        this.loadMoreStatus = true;
        if (this.recordType === VMEPROMOTIONS_RT ) {
            let promotionsPayload = {
                recordId: this.recordId,
                globalSalesChannel: this.selectedChannel,
                commonTypeOfSale: this.selectedCommonType
            };
            getAllPromotions(promotionsPayload)
            .then(result => {
                console.log('Result==========', result);
                this.searchData = [];
                for (let campid of result[0].existingVMEIds) {
                    this.previousSelections.add(campid);                
                }
                this.selectedRows = [...result[0].existingVMEIds];
                this.existingVMEIds = [...result[0].existingVMEIds];           
                this.searchData =result[0].sortedResult;
                if(!this.onFirstLoad){
                    this.intialSearchData = result[0].sortedResult;
                    console.log('this.intialSearchData',JSON.stringify(this.intialSearchData));
                    this.onFirstLoad = true;
                }    
                this.isLastSearched = this.searchData.length > 0;
                if (this.searchData.length > 0 && this.searchData[this.searchData.length - 1].Id == lastRecId) {
                    this.isLastSearched = true;
                }
                this.unCompatibleData = result;
                this.loadMoreStatus = false;
                this.isMore = false;
                this.clickedButton = false;  
                         
            })
            .catch(error => {
                this.searchData = undefined;
                console.log(JSON.stringify(error));
                if (error) {
                    this.errorMsg = error.body.message;
                }
                this.loadMoreStatus = false;
            });
        } else {
            let payload = {
                recTypeId: this.recTypeId,
                suppNameOrPartNumber : this.searchBy,
                category: this.selectedCategory,
                subcategory: this.selectedSubcategory,
                isClearanceOnly: this.isClearanceOnly,
                isRetailerOnly: this.isRetailerOnly,
                isAccessoryPackOnly: this.isAccessoryPackOnly,
                retailerId: this.retailerId,
                recordId: lastRecId,
                isMore: this.isMore,
                quoteId: this.recordId,
                isUsedVehicle: this.isUsedVehicle > 0,
                isNewVehicle: this.isNewVehicle > 0,
                recTypeName: this.recordType
            };
            searchSupplements(payload).then(result => {
                console.log('Result=====================',JSON.stringify(result));
                    if (lastRecId == null || lastRecId == '') {
                        this.searchData = result;
                    } else {
                        const currentData = result;
                        const newData = currentRecord.concat(currentData);
                        this.searchData = newData;
                    }
                    if (this.searchData[this.searchData.length-1].Id == lastRecId) {
                        this.isLastSearched = true;
                    }
                    this.searchData.forEach(element => {
                        if (this.isAccessoryRT) {
                            element.RetailerRate = this.retailerRate.LMS_RRA_RateValue__c;
                        }
                        element.quantity = 1;
                    });
                    this.loadMoreStatus = false;
                    this.isMore = false;
                    this.clickedButton = false;
                }).catch(error => {
                    this.searchData = undefined;
                    console.log(JSON.stringify(error));
                    if (error) {
                        this.errorMsg = error.body.message;
                    }
                    this.loadMoreStatus = false;
                });
        }
    }

    handleRowSelection(event) {
        if(this.isVMEPromotionRT){
            const selectedRows = event.detail.selectedRows;
            const selectedIds = selectedRows.map(row => row.Id);
            const currentSelectedRow = new Set(selectedRows.map(row => row.Id));
            const el = this.template.querySelector('lightning-datatable');
            const existingRows = this.existingVMEIds;
            const missingRows = existingRows.filter(id => !selectedIds.includes(id));
            const sortedData = this.unCompatibleData[0].sortedResult;
            const filteredRows = sortedData.filter(row => this.existingVMEIds.includes(row.Id));
            if (missingRows.length > 0) {
                filteredRows.forEach(row => {
                    currentSelectedRow.add(row.Id);
                })
            }
            if (selectedRows.length === this.searchData.length) {
                console.log('All rows selected');
                const incompatibleRows = this.unCompatibleData
                    .filter(item => selectedIds.includes(item.campaignId))
                    .flatMap(item => item.incompatibleCampaignIds);
                const commonIds = selectedIds.filter(id => incompatibleRows.includes(id));
                if (commonIds.length>0) {
                    filteredRows.forEach(row => {
                        currentSelectedRow.add(row.Id);
                    })                    
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: this.label.LMS_AllCampaignsNotCompatible,
                            variant: 'error'
                        })
                    );
                }else{
                    this.selectedRows =[...currentSelectedRow];         
                }
            }else{
                const newSelections = selectedIds.filter(id => !this.selectedRowIds.has(id));
                let selectedCurrentId;
                if (newSelections.length > 0) {
                    selectedCurrentId = newSelections[newSelections.length - 1];
                } else if (this.latestSelectedId) {
                    selectedCurrentId = this.latestSelectedId;
                }
                this.latestSelectedId = selectedCurrentId;
                const rowMap = new Map();
                selectedRows.forEach(selectedRow => {
                    rowMap.set(selectedRow.Id, selectedRow);
                    if (selectedRow.Id !== selectedCurrentId){
                        this.previousSelections.add(selectedRow.Id);
                    } 
                });
                const unselections = [...this.selectedRowIds].filter(id => !selectedIds.includes(id));
                unselections.forEach(unselectedId => {
                    this.previousSelections.forEach(newId => {
                        if(unselectedId === newId){
                            this.previousSelections.delete(unselectedId);
                        }
                    });
                });
                this.selectedRowIds = new Set(selectedIds);
                const newincompatibleIds = this.unCompatibleData
                    .filter(item => selectedCurrentId.includes(item.campaignId))
                    .flatMap(item => item.incompatibleCampaignIds);
                newincompatibleIds.forEach(row => {
                    this.previousSelections.forEach(newId => {
                        let selectedCurrentIdRow ;
                        let rowRow ;
                        if(newId === row ){
                            if(this.existingVMEIds.includes(selectedCurrentId)){
                                currentSelectedRow.delete(row);
                                selectedCurrentIdRow = rowMap.get(row);
                                rowRow = rowMap.get(selectedCurrentId);
                            }else{
                                currentSelectedRow.delete(selectedCurrentId);
                                selectedCurrentIdRow = rowMap.get(selectedCurrentId);
                                rowRow = rowMap.get(row);
                            }
                            if (selectedCurrentIdRow && rowRow) {
                                const selectedCurrentIdName = selectedCurrentIdRow.Name;
                                const rowName = rowRow.Name;
                                const message =  this.label.LMS_CampaignsAreNotCompatible
                                                .replace('{0}', selectedCurrentIdName)
                                                .replace('{1}', rowName);
                                this.showToast('Warning', message);
                            } 
                        }
                    });
                });
            }
            this.selectedRows = [...currentSelectedRow];
            console.log('selectedRows==== ', this.selectedRows);
            this.selectedRows = this.selectedRows 
            el.selectedRows = this.selectedRows;
            event.preventDefault();
        }
        
    }
    showToast(title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant:'warning',
                mode: 'sticky'
            })
        );
    }
    /**
     Handles click on the 'Save' button
     */
     handleAddToQuote(event) {
        this.errorMsg = '';
        let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        if(selectedRows.length >0 ){
            if(!this.isVMEPromotionRT){
                selectedRows.forEach(element => {
                    element.isChosen = true;
                    element.changedId = element.Id;
                    element.quantity = 1;
                });
                selectedRows = JSON.stringify(selectedRows);
                this.loadMoreStatus = true;
                if (this.isAccessoryRT === true) {
                    this.selectedReasonAccessory = null;
                    this.paramsAccessory = [];
                    this.paramsAccessory.push (
                        this.value = this.recordId
                    );
                    this.paramsAccessory.push (
                        this.value = this.selectedReasonAccessory
                    );
                    if (this.quote != null) {
                        saveReasonOnQuoteAccessory({params: this.paramsAccessory}).then(result => {});
                    }
                } else if (this.isAddOnRT === true) {
                    this.selectedReasonAddOn = null;
                    this.params = [];
                    this.params.push (
                        this.value = this.recordId
                    );
                    this.params.push (
                        this.value = this.selectedReasonAddOn
                    );
                    if (this.quote != null) {
                        saveReasonOnQuoteAddOn({params: this.params}).then(result => {});
                    }
                }
                if (this.quote != null) {
                    this.doSaveSupplements(selectedRows);
                } else {
                    this.doSaveSilentSalesmanFeatures(selectedRows);
                }
            }else{
                try {
                    let updatedSelectedRows = selectedRows.map(element => {
                        return {
                            ...element,
                            isChosen: true,
                            changedId: element.Id,
                            quantity: 1
                        };
                    });
                    const existingRows = this.existingVMEIds;
                    const sortedData = this.unCompatibleData[0].sortedResult;
                    const filteredRows = Array.from(this.intialSearchData.filter(row => existingRows.includes(row.Id)));                    
                    if (filteredRows.length > 0 && updatedSelectedRows.length > 0) {
                        for (const filteredRecord of filteredRows) {
                            for (const updatedRecord of updatedSelectedRows) {
                                if (updatedRecord.VME_Channel__c !== filteredRecord.VME_Channel__c) {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Error',
                                            message: this.label.LMS_CampaignsWithDifferentSalesChannel,
                                            variant: 'error',
                                        })
                                    );
                                    return;
                                }
                            }
                        }
                    }else if (filteredRows.length === 0 && updatedSelectedRows.length > 0) {
                        console.log('hello ');
                        for (let i = 0; i < updatedSelectedRows.length; i++) {
                            const updatedRecord1 = updatedSelectedRows[i];
                            for (let j = i + 1; j < updatedSelectedRows.length; j++) {
                                const updatedRecord2 = updatedSelectedRows[j];
                                if (updatedRecord1.VME_Channel__c !== updatedRecord2.VME_Channel__c) {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Error',
                                            message: this.label.LMS_CampaignsWithDifferentSalesChannel,
                                            variant: 'error',
                                        })
                                    );
                                    return;
                                }
                            }
                        }
                    }
                    if (filteredRows.length === updatedSelectedRows.length) {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: this.label.LMS_AlreadyExistingCampains,
                                variant: 'error',
                            })
                        );
                        return;
                    }else{
                        selectedRows = JSON.stringify(updatedSelectedRows);
                        this.selectedValues = selectedRows;
                        this.isModalOpen = !this.isModalOpen;
                        this.loadMoreStatus = false;
                    }                   
                } catch (error) {
                    console.error('Error in handleAddToQuote:', error);
                }
            }
        }else{
            this.errorMsg = this.label.LMS_NoRowsSelected;
        }
    }

    doSaveSupplements(selectedRows) {
        saveSupplements({quoteId: this.recordId, changedRecords: selectedRows, recType: this.recordType})
            .then(result => {
                console.log('gsRESET:', this.gsRESET);
                console.log('gsFsIntegration:', this.gsFsIntegration);

                if (this.gsFsIntegration === false) {
                    refreshApex(this.wiredPromotions);
                } else if (this.gsRESET === true) {
                    window.location.reload();
                } else {
                    this.navigateToViewRecordPage(this.recordId);
                }
                
            }).catch(error => {
                console.log(JSON.stringify(error));
                if (error) {
                    if (error.body && error.body.message) {
                        this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.message;
                    } else if(error.body &&  error.body.pageErrors[0].message){
                        this.errorMsg = error.body.pageErrors[0].message;
                    } 
                    else {
                        this.errorMsg = LMS_QUO_UnknownError;
                    }
                    this.loadMoreStatus = false;
                }
            });
    }

    doSaveSilentSalesmanFeatures(selectedRows) {
        saveSilentSalesmanFeatures({silentSalesmanId: this.recordId, changedRecords: selectedRows, recordTypeName: this.recordType})
            .then(result => {
                console.log('gsRESET:', this.gsRESET);
                console.log('gsFsIntegration:', this.gsFsIntegration);

                if (this.gsFsIntegration === false) {
                    refreshApex(this.wiredPromotions);
                } else if (this.gsRESET === true) {
                    window.location.reload();
                } else {
                    this.navigateToViewRecordPage(this.recordId);
                }
                
            }).catch(error => {
                console.log(JSON.stringify(error));
                if (error) {
                    if (error.body && error.body.message) {
                        this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.message;
                    } else if(error.body &&  error.body.pageErrors[0].message){
                        this.errorMsg = error.body.pageErrors[0].message;
                    }
                    else {
                        this.errorMsg = LMS_QUO_UnknownError;
                    }
                    this.loadMoreStatus = false;
                }
            });
    }

    /**
     Redirects to the main Quote Detail page
     */
    navigateToViewRecordPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                "recordId": recordId,
                "objectApiName": "LMS_Quote__c",
                "actionName": "view"
            },
        });
    }

    shouldShowLaunchAccessoriesAppButton(status, result) {
        console.log('====For Should '+ this.shouldTheAccessoriesButtonBeVisible(status, result, ACCESSORIES_APP));
        console.log('====For Should '+ JSON.stringify(status));
        console.log('====For Should '+ JSON.stringify(result));
        if (this.shouldTheAccessoriesButtonBeVisible(status, result, ACCESSORIES_APP)) {
            this.isVisibleShowLaunchAccessoriesAppButton = true;
        }
    }

    shouldShowImportAccessoriesButton(status, result) {
        if (this.shouldTheAccessoriesButtonBeVisible(status, result, ACCESSORIES_REST)) {
            this.isVisibleShowImportAccessoriesButton = true;
        }
    }

    shouldTheAccessoriesButtonBeVisible(status, result, app_key) {
        return (
            result &&
            !!Object.keys(result).length &&
            app_key in result &&
            (status == DRAFT_STATUS || status == null) &&
            this.recordType == ACCESSORIES_RT
        );
    }

    get shouldShowRow() {
        console.log('===<<>>>>>'+this.isVisibleShowLaunchAccessoriesAppButton +  this.isVisibleShowImportAccessoriesButton)
        return this.isVisibleShowLaunchAccessoriesAppButton || this.isVisibleShowImportAccessoriesButton;
    }

    launchAccessoriesApp(event) {
        if (this.customSettings && this.customSettings[ACCESSORIES_APP] && this.customSettings[ACCESSORIES_APP].LMS_CST_EndpointAddress__c) {
            let model_code_temp = this.modelCode;
            let dealer_code_temp = this.dealerCode;
            if (!model_code_temp) {
                this.dispatchEvent(new ShowToastEvent({
                    title: this.label.LMS_Error,
                    message: this.label.LMS_AccessoriesAppMissingModelCode,
                    variant: 'error',
                }));
            } else if (!dealer_code_temp) {
                this.dispatchEvent(new ShowToastEvent({
                    title: this.label.LMS_Error,
                    message: this.label.LMS_AccessoriesAppMissingDealerCode,
                    variant: 'error',
                }));
            } else {
                let temp = this.customSettings[ACCESSORIES_APP].LMS_CST_EndpointAddress__c;
                temp = temp.replace(DEALER_CODE, dealer_code_temp);
                temp = temp.replace(MODEL_CODE, model_code_temp);
                window.open(temp, '_blank', 'location=yes,scrollbars=yes,status=yes');
            }
        }
    }

    get modelCode() {
        try {
            if (this.quote != null) {
                if (this.isConfigCar) {
                    return this.configCode;
                } else if (this.isNewCar || this.isUsedCar) {
                    return this.stockCode;
                }
            } else if (this.silentSalesman != null) {
                return this.silentSalesman.fields.LMS_SIL_StockVehicleId__r.value.fields.LMS_VHC_VehicleModel__r.value.fields.LMS_VMO_Code__c.value;
            }
        } catch (error) {
        }
        return null;
    }

    get dealerCode() {
        if (this.quote != null) {
            return this.quote.fields.LMS_QUO_ShowroomId__r.value.fields.LMS_SWR_RetailerCode__c.value;
        } else if (this.silentSalesman != null) {
            try {
                return this.showroom.data;
            } catch (error) {
            }
        }
        return null;
    }

    get stockCode() {
        return this.quote.fields.LMS_QUO_StockVehicle__r.value.fields.LMS_VHC_VehicleModel__r.value.fields.LMS_VMO_Code__c.value;
    }

    get isNewCar() {
        return this.quote.fields.LMS_QUO_isNewCarQuoteCount__c.value;
    }

    get isUsedCar() {
        return this.quote.fields.LMS_QUO_isUsedCarQuoteCount__c.value;
    }

    get isConfigCar() {
        return this.quote.fields.LMS_QUO_isConfigCarQuote__c.value;
    }

    get configCode() {
        return this.quote.fields.LMS_QUO_ConfigurationVehicle__r.value.fields.LMS_CVH_VehicleModel__r.value.fields.LMS_VMO_Code__c.value;
    }

    importAccessories(event) {
        if (this.customSettings && this.customSettings[ACCESSORIES_REST] && this.customSettings[ACCESSORIES_REST].LMS_CST_EndpointAddress__c) {
            this.showImportAccessoriesPopup = true;
        }
    }

    closeAccessories(event) {
        this.showImportAccessoriesPopup = false;
        this.showImportAccessoriesPopup = false;
    }

    get isFeature() {
        return this.silentSalesman != null
    }

    onCloseModal(event){
        this.isModalOpen = event.detail.showModal;

        //Added by MS Start
        if(event.detail.refreshDataTable !== undefined && event.detail.refreshDataTable){
            refreshApex(this.wireForRefreshPromotionDatatable); 
        }
        //Added by MS End
    }
}