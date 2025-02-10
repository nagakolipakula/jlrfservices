import { LightningElement, api,track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';
import { getNamespaceDotNotation } from 'omnistudio/omniscriptInternalUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class osbGs2RetailerSearch extends OmniscriptBaseMixin(LightningElement) {
    activeStepNumber = 9;
    @api stepName;
    @api previousStepName;
    @api stepActive;
    radius = '75';
    postcode = '';
    searchButtonClicked = false;
    places = [];
    _selectedDate;
    isMobilityEnabled = false;
    isDropOffEnabled = false;
    minDate = this.getTodayDate();
    goBacktoMyBookings = false;
    customLabels;
    @track errorMessage = '';

    searchBtnCss = "background: #E9ECEC !important; color: white !important;";
    nextBtnCss = "background: #E9ECEC !important; color: white !important; padding: 1% 4% 1% 4%;";
    disabledSearchbutton = true;
    disabledNextbutton = true;
    reGoodDate;

    _actionUtil;
    _ns = getNamespaceDotNotation();

    connectedCallback() {
      
        try {
            const OmniJsonData = this.omniJsonData;

            this.customLabels = { ...this.omniScriptHeaderDef.allCustomLabels };
          
            const isValidData = OmniJsonData?.selectedLocationTimeSlot && 
                                OmniJsonData?.selectedOption && 
                                OmniJsonData?.selectedDropOffOption;
            if (isValidData) {
                this.disabledNextbutton = false;
                this.nextBtnCss = "background: black !important; color: white !important; padding: 1% 4% 1% 4%;";
            }
    
            if (OmniJsonData?.location?.selectedLocationId) {
                this.postcode = OmniJsonData.locationSearched || '';
                this.selectedDate = OmniJsonData.dateSearched || '';
                this.searchButtonClicked = true;
                this.isMobilityEnabled = true;
                this.isDropOffEnabled = true;
                this.updateButtonState();
                this.handleSearch();
            }
        } catch (error) {
            console.error('Error during connectedCallback:', error);
        }
    }

    @api
    set selectedDate(value) {
        this._selectedDate = value;
        this.updateButtonState();
    }

    get selectedDate() {
        return this._selectedDate;
    }

    get searchButtonClass() {
        
        let baseClass = 'SearchBtnCSS';
        if (this.postcode && this.selectedDate) {
            return `${baseClass} enabled`;
        }
        return `${baseClass} disabled`;
    }

    get nextButtonClass() {
        let baseClass = 'NextBtnCSS slds-float_right';
        return this.disabledNextbutton ? `${baseClass} disabled` : `${baseClass} enabled`;
    }

    get mobilitySection() {
        return this.isMobilityEnabled ? 'accordion-section' : 'accordion-section grayed-out';
    }

    get dropOffSection() {
        return this.isDropOffEnabled ? 'accordion-section' : 'accordion-section grayed-out';
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    updateOmniScriptData() {
        const data = this.getSelection();
        this.omniApplyCallResp(data);
    }

    getSelection() {
        return {
            locationSearched: this.postcode,
            dateSearched: this.selectedDate
        };
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.updateButtonState();
    }


    handleDateChange(event) {
        const inputDate = event.target.value;
        const selected = new Date(inputDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedMidnight = new Date(selected);
        selectedMidnight.setHours(0, 0, 0, 0);
                
        if (!inputDate) {
          //  this.errorMessage = 'Please select a date.';
            const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
            if (toastComponent) {
                toastComponent.showToast('success', 'Please select a date.', 'utility:success', 5000);
            }
            return;
        }

        if (selectedMidnight >= today) {
            this.errorMessage = '';
            this.selectedDate = inputDate;
        } else {
         //   this.errorMessage = 'Please select a date that is today or in the future.'; 
            const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
            if (toastComponent) {
                toastComponent.showToast('success', 'Please select a date that is today or in the future.', 'utility:success', 5000);
            }
        }
        this.updateButtonState();
    }

    /*handleDateChange(event) {
    const inputDate = event.target.value;
    const selected = new Date(inputDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for valid date format
    if (!this.isGoodDate(inputDate)) {
        this.showToast('Please provide a date in the format MM/dd/YYYY', 'error');
        console.log('INPUTDATE: ', inputDate);
        return;
    }

    if (!inputDate) {
        this.showToast('Please select a date.', 'error');
        return;
    }

    const selectedMidnight = new Date(selected);
    selectedMidnight.setHours(0, 0, 0, 0);

    if (selectedMidnight >= today) {
        this.errorMessage = '';
        this.selectedDate = inputDate;
    } else {
        this.showToast('Please select a date that is today or in the future.', 'error');
    }
    
    this.updateButtonState();
}

    isGoodDate(dateString) {
       
       const reGoodDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
       // /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/;
       console.log('GoodDate: ', reGoodDate);
        return reGoodDate.test(dateString);
    }

    showToast(message, type) {
        const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
        if (toastComponent) {
            toastComponent.showToast(type === 'error' ? 'error' : 'success', message, type === 'error' ? 'utility:error' : 'utility:success', 5000);
        }
    }*/


    updateButtonState() {
        const isFormValid = this.postcode && this.selectedDate;
        
        this.disabledSearchbutton = !isFormValid;
        this.searchBtnCss = isFormValid
            ? "background: black !important; color: white !important; "
            : "background: #E9ECEC !important; color: white !important;";
    }

    handleSearch() {
        const IPInput = this.createInputObject();
        const params = this.ipInputParams(IPInput);
        this._actionUtil = new OmniscriptActionCommonUtil();

        this._actionUtil.executeAction(params, null, this, null, null)
            .then(response => this.processResponse(response))
            .catch(error => this.handleSearchError(error));

    }

    createInputObject() {
       
        return {
            address: this.postcode,
            radius: this.radius,
            countryCode: this.omniJsonData.country_code
        };  
    }

    ipInputParams(IPInput) {
        const options = {};
        return {
            input: JSON.stringify(IPInput),
            sClassName: `${this._ns}IntegrationProcedureService`,
            sMethodName: "OSBGS2_getRetailersFromPostcode",
            options: JSON.stringify(options)
        };
    }

    processResponse(response) {
        const places = response.result.IPResult.result.Data;
        const success = response.result.IPResult.result.success;
        if (!success) {
            //this.showToast('No locations found', 'Please enter a valid postalcode or city name', 'error');
            const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
            if (toastComponent) {
                toastComponent.showToast('success', 'Please enter a valid postal code or city name', 'utility:success', 5000);
            }
        } else {
            if (places && places.length > 0) {
                console.log('places.length: ', places.length);
                console.log('places: ', JSON.stringify(places));
                this.places = places;
                this.searchButtonClicked = true;
                this.updateOmniScriptData();
    
                const displayRetailersComponent = this.template.querySelector('c-osb-gs2-display-retailers');
                if (displayRetailersComponent) {
                    displayRetailersComponent.places = places;
                    displayRetailersComponent.selectedDate = this.selectedDate;
                }
            } else {
                this.places = [];
                this.searchButtonClicked = false;
                //this.showToast('No locations found', 'No locations found in the entered postcode or city name', 'error');
                const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
                if (toastComponent) {
                    //toastComponent.showToast('error', 'No locations found in the entered postcode or city name', 'utility:error', 5000);
                    if (toastComponent) {
                        toastComponent.showToast('success', 'No results found in the entered postcode or city name', 'utility:success', 5000);
                    }
                }
            }
        }
    }

    handleSearchError(error) {
        this.places = [];
        this.searchButtonClicked = false;
        const errorMessage = error.body ? error.body.message : 'Please enter a valid postalcode or city name';
        //this.showToast('Error', errorMessage, 'error');
        const toastComponent = this.template.querySelector('c-osb-gs2-show-toast');
        if (toastComponent) {
            toastComponent.showToast('success', errorMessage, 'utility:success', 5000);
        }
    }

    // showToast(title, message, variant) {
    //     this.dispatchEvent(new ShowToastEvent({
    //         title,
    //         message,
    //         variant
    //     }));
    // }

  //  handleNavigateTo() {
  //      this.omniNavigateTo(this.omniScriptHeaderDef.asIndex - 23);
  //  }
    navigateBackSteps(steps) {
        for (let i = 0; i < steps; i++) {
            this.omniPrevStep();
        }
    }

    handleBackToMyBookingsClick() {
        this.navigateBackSteps(2);
    
        const keys = [
            'omniStepName', 'previousOmniStepName', 'selectedStep', 'selectedVehicle', 'VehicleName', 'VIN', 'VehicleRegistrationNumber', 'actionName',
            'dateSearched', 'location', 'selectedStepName', 'locationSearched', 'name', 'OSB_GS2_ContactDetailsOOTB', 'Block2',
            'selectedOption', 'selectedLocationName', 'selectedLocationTimeSlot', 'lastName', 'emailAddress', 'countryCode', 'phoneNumber',
            'details', 'selectedDropOffOption', 'selectedDate', 'selectedLocationDate'
        ];
    
        const data = Object.fromEntries(keys.map(key => [key, '']));
        
        this.omniApplyCallResp(data);
    }    

    handleStepChange(event) {
        this.activeStepNumber = event.detail.stepNumber;
     //   console.log('stepnumber', this.activeStepNumber);
    }

    handleNextBtnClick() {
        if (!this.disabledNextbutton) {
            this.activeStepNumber = 10;
            this.template.querySelector('c-osb-gs2-progress-tracker').unlockStep(3);
            this.navigateFwdSteps(1);
        }
    }

    navigateFwdSteps(steps) {
        for (let i = 0; i < steps; i++) {
            this.omniNextStep();
        }
    }

    handleTimeSlotSelected(event) {
        this.isMobilityEnabled = true;
    }

    handleMobilitySelected(event) {
        this.isDropOffEnabled = true;
    }

    handleDataReady(event) {
        if (event.detail.hasAllData) {
            this.disabledNextbutton = false;
            this.nextBtnCss = "background: black !important; color: white !important; padding: 1% 4% 1% 4%;";
            this.template.querySelector('c-osb-gs2-display-footer').unlockStep(3);
            this.refs.child.nextbuttoninfo = false;
        } else {
            this.disabledNextbutton = true;
            this.nextBtnCss = "background: #E9ECEC !important; color: white !important; padding: 1% 4% 1% 4%;";
        }
    }

    handleBackToMyBookingsClick() {
        this.goBacktoMyBookings = true;        
    }

    handleKeepBookingClose() {
        this.goBacktoMyBookings = false;
    }

    handleCancelBookingClose() {
        this.goBacktoMyBookings = false;
    }

    handleExitNDiscardConfirmation () {
        this.navigateBackSteps(3);
        const keys = [
            'omniStepName', 'previousOmniStepName', 'selectedStep', 'selectedVehicle', 'VehicleName', 'VIN', 'VehicleRegistrationNumber', 'actionName',
            'dateSearched', 'location', 'selectedStepName', 'locationSearched', 'name', 'OSB_GS2_ContactDetailsOOTB', 'Block2',
            'selectedOption', 'selectedLocationName', 'selectedLocationTimeSlot', 'lastName', 'emailAddress', 'countryCode', 'phoneNumber',
            'details', 'selectedDropOffOption', 'selectedDate', 'selectedLocationDate', 'Vehicle', 'selectedVehicleService', 'selectedVehicleAllService', 'OSB_GS2_MyBooking', 'ContactDetails'
        ];
        const data = Object.fromEntries(keys.map(key => [key, '']));        
        this.omniApplyCallResp(data);
    }
}