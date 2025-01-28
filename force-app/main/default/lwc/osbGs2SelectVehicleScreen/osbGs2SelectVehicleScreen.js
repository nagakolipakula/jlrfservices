import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import  {OmniscriptActionCommonUtil}  from "omnistudio/omniscriptActionUtils"; 
import { getNamespaceDotNotation } from 'omnistudio/omniscriptInternalUtils';

export default class osbGs2SelectVehicleScreen extends OmniscriptBaseMixin(LightningElement) {
    
    _actionUtil;
    _ns  = getNamespaceDotNotation();
    isSuccess;
    _actionUtil;
    goBacktoMyBookings = false;
    @api vehicleServiceIPData = [];
    @track activeStepNumber = 8;
    @api stepName;
    @track selecteService = false;
    @track isSpinner = false;
    @track disabledselectvehiclebutton = false;
    @track disabledNextbutton = true;
    @track IsNewBooking = false;
    @track isUpdateVehicle = false;
    selectvehiclebuttonname = 'SELECT VEHICLE';
    carboxcardcss = "border-radius: 0px;";
    selectVehicleBtnCss = "background-color: white;color: black;border: 1px solid rgba(12, 18, 28, 0.2);width: 100%;height: 34px;";
    nextBtnCss = "color: white !important;padding: 1% 4% 1% 4%;";
    @api AllVehicleDetails;
    @api selectedVehicleDetails;
    @api selectedVehicle;
    @api selectedVehicleService = {};
    @api selectedServiceParameters;
    @track handleUpdateVehicleIndexVal;
    @track handleSelectedVehicleindexval;
    VINvalidation = false;
    modelvalidation = false;
    Licenseplatevalidation = false;
    Mileagevalidation = false;
    MileagePositivevalidation = false;
    isNoVehicle = false; //if true then show empty vehicle screen
    isEditBooking='';
    modelOptions = [
        { "label": "AB24 CDE", "value": "AB24 CDE" },
        { "label": "AB25 CDE", "value": "AB25 CDE" },
        { "label": "AB26 CDE", "value": "AB26 CDE" }
    ];
    updateVehicleDetails = { "VIN": "", "VehicleRegistrationNumber": "", "Licenseplate": "", "Mileage": "" };

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        
        const OmniJsonDatas = this.omniJsonData || {};
        console.log('ConnectedCallback -> Full OmniJsonData:', JSON.stringify(OmniJsonDatas));
        var { actionName, selectedVehicle, selectedVehicleService, selectedVehicleAllService } = OmniJsonDatas;
    
        // this.AllVehicleDetails = (this.omniJsonData?.Vehicle || []).filter(vehicle => vehicle != null);
        if(this.omniJsonData.Vehicle !== undefined && this.omniJsonData.Vehicle.length>0){
            this.AllVehicleDetails = JSON.parse(JSON.stringify(this.omniJsonData.Vehicle));
        }
        if (selectedVehicleAllService) {
            this.selectedVehicleService = JSON.parse(JSON.stringify(selectedVehicleAllService));
        } else {
            this.selectedVehicleService = {};
        }
        
        this.selectedVehicle = selectedVehicle ? JSON.parse(JSON.stringify(selectedVehicle)) : {};
        this.vehicleServiceIPData = selectedVehicleAllService ? JSON.parse(JSON.stringify(selectedVehicleAllService)) : [];
    
        // console.log('ConnectedCallback -> Selected Vehicle:', JSON.stringify(this.selectedVehicle, null, 2));
        // console.log('ConnectedCallback -> Selected Vehicle Service:', JSON.stringify(this.selectedVehicleService, null, 2));
        // console.log('ConnectedCallback -> Selected Vehicle All Service:', JSON.stringify(this.selectedVehicleAllService, null, 2));

        
        if (this.AllVehicleDetails !== undefined && this.AllVehicleDetails.length>0) {
            this.AllVehicleDetails = this.AllVehicleDetails.map((vehicle, index) => 
                this.processVehicle(vehicle, actionName, selectedVehicle?.VehicleRegistrationNumber, this.selectedVehicle, this.selectedVehicleService, index)
            );
    
            this.finalizeVehicleSelection();
    
            if (this.selectedVehicle?.VIN) {
                this.restoreSelectedServices();
            }
        } else {
            this.handleNoVehiclesAvailable();
        }
    }       
    
    restoreSelectedServices() {
        // console.log('Restoring selected services from connectedCallback...');
        
        this.vehicleServiceIPData.forEach(serviceCategory => {
            const selectedCategory = this.selectedVehicleService[serviceCategory.category];
    
            if (!selectedCategory) {
                this.selectedVehicleService[serviceCategory.category] = [];
            }
    
            if (selectedCategory) {
                const selectedJobs = selectedCategory.map(job => job.id);
                
                serviceCategory.jobs.forEach(job => {
                    job.selectedServiceVal = selectedJobs.includes(job.id);
                });
            }
        });
        
        this.selecteService = true;
        this.disabledNextbutton = false;
        this.nextBtnCss = "background: black !important;color: white !important;padding: 1% 4% 1% 4%;";
        
       // this.template.querySelector('c-osb-gs2-Display-Footer').activeStepNumber(9),unlockStep(3);

        // console.log('Restored vehicleServiceIPData:', JSON.stringify(this.vehicleServiceIPData, null, 2));
        // console.log('Selected Vehicle Service:', JSON.stringify(this.selectedVehicleService, null, 2));
    }
    
    
    // clearAllData(OmniJsonData) {
    //     OmniJsonData.editBookingData = {};
    //     OmniJsonData.selectedVehicle = null;
    //     OmniJsonData.selectedVehicleService = null;
    //     OmniJsonData.otherField1 = null;
    //     OmniJsonData.otherField2 = {};
    
    //     this.omniApplyCallResp({
    //         editBookingData: OmniJsonData.editBookingData,
    //         selectedVehicle: OmniJsonData.selectedVehicle,
    //         selectedVehicleService: OmniJsonData.selectedVehicleService,
    //         otherField1: OmniJsonData.otherField1,
    //         otherField2: OmniJsonData.otherField2
    //     });
    
    //     console.log('Cleared all data in OmniJsonData');
    // }
    
    
    // clearEditBookingData(OmniJsonData) {
    //     OmniJsonData.editBookingData = {};
    //     this.omniApplyCallResp(OmniJsonData);
    // }
    
    processVehicle(vehicle, actionName, VehicleRegistrationNumber, selectedVehicle, selectedVehicleService, index) {
        if (!vehicle) {
            return;
        }
        let processedVehicle;
        if (this.isEditBookingMatch(vehicle, VehicleRegistrationNumber)) {
            if (!this.checkEmptyObject(this.selectedVehicleService)) {
                this.selecteService = true;
                this.disabledNextbutton = false;
                this.nextBtnCss = "background: black !important;color: white !important;padding: 1% 4% 1% 4%;";
            }
            // console.log('this.selectedVehicleService==> '+this.checkEmptyObject(this.selectedVehicleService));
            // return this.handleGetSelectedVehicleService(selectedVehicle.VIN, selectedVehicle.dealerCode, selectedVehicle.index);
            processedVehicle = this.highlightVehicle(vehicle, index);
        } else {
            processedVehicle = this.resetVehicle(vehicle, index);
        }
        // if (this.isNewBookingMatch(actionName, selectedVehicle, vehicle)) {
        //       return this.highlightVehicle(vehicle);
        // }
        return processedVehicle;
    }
    
    isEditBookingMatch(vehicle, VehicleRegistrationNumber) {
        return VehicleRegistrationNumber === vehicle.VehicleRegistrationNumber;
    }
    
    // isNewBookingMatch(actionName, selectedVehicle, vehicle) {
    //     return actionName === 'newBooking' && selectedVehicle?.VehicleRegistrationNumber === vehicle.VehicleRegistrationNumber;
    // }
    
    highlightVehicle(vehicle, index) {
        // console.log(index+'<==index highlightVehicle vehicle==> '+JSON.stringify(vehicle));
        this.selectedVehicle = {
            ...vehicle,
            carboxcardcss: "border-radius: 0px;border: 1px solid black;",
            selectvehiclebuttonname: 'SELECTED',
            selectVehicleBtnCss: "background-color: white;color: black;border:0px solid #555555;width: 100%;height: 34px;",
            disabledselectvehiclebutton: true,
            index:index,
            Licenseplate: vehicle.VehicleRegistrationNumber,
            dealerCode:"M3053I1757"
        };
        return this.selectedVehicle;
    }
    
    resetVehicle(vehicle, index) {
        return {
            ...vehicle,
            disabledselectvehiclebutton: this.disabledselectvehiclebutton,
            carboxcardcss: this.carboxcardcss,
            selectvehiclebuttonname: this.selectvehiclebuttonname,
            selectVehicleBtnCss: this.selectVehicleBtnCss,
            index:index,
            Licenseplate: vehicle.VehicleRegistrationNumber,
            dealerCode:"M3053I1757"
        };
    }
    
    finalizeVehicleSelection() {
        if (this.selectedVehicle) {
            // console.log('finalizeVehicleSelection -> selectedVehicle:', JSON.stringify(this.selectedVehicle, null, 2));
            // console.log('finalizeVehicleSelection -> selectedVehicleService:', JSON.stringify(this.selectedVehicleService, null, 2));
            // console.log('finalizeVehicleSelection -> selectedVehicleAllService:', JSON.stringify(this.vehicleServiceIPData, null, 2));
    
            // this.vehicleServiceIPData.forEach(service => {
            //     service.jobs.forEach(job => {
            //         console.log(`Service Category: ${service.category}, Job ID: ${job.id}, Selected: ${job.selectedServiceVal}`);
            //     });
            // });
    
            const omniResponse = { 
                selectedVehicle: this.selectedVehicle, 
                selectedVehicleService: this.selectedVehicleService, 
                selectedVehicleAllService: this.vehicleServiceIPData 
            };
            
            // console.log('finalizeVehicleSelection -> omniApplyCallResp data:', JSON.stringify(omniResponse, null, 2));
            this.omniApplyCallResp(omniResponse);
        } else {
            this.resetAllVehicles();
        }
    }
    
    resetAllVehicles() {
        this.AllVehicleDetails = this.AllVehicleDetails.map(vehicle => this.resetVehicle(vehicle));
        this.omniApplyCallResp({ selectedVehicle: '', selectedVehicleService: '' });
    }
    checkEmptyObject(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }  
        return true;
    }
    handleNoVehiclesAvailable() {
        // console.log('No vehicles available, setting isNoVehicle to true');
        this.isNoVehicle = true;
    }    
    
    handleSelectVehicleClick(event) {
        this.isSpinner = true;
        this.clearSlectedService();
        let indexval = event.target.dataset.mid;
        this.selectedVehicle = this.AllVehicleDetails[indexval];
        // this.finalizeVehicleSelection();
        this.handleGetSelectedVehicleService(this.AllVehicleDetails[indexval].VIN, this.AllVehicleDetails[indexval].dealerCode, indexval);
        /*Start - Call OSBGS2_MenuPricing IP and pass IPInput parameters to get the response service data*/
        // const IPInput =  { 
        //     vin:  this.AllVehicleDetails[indexval].VIN,
        //     dealerCode: this.AllVehicleDetails[indexval].dealerCode
        // };
        // const  options  = {} ;
        // const  params  = {
        //     input:  JSON.stringify(IPInput) ,
        //     sClassName:  `${this._ns}IntegrationProcedureService`,
        //     sMethodName:  "OSBGS2_MenuPricing" ,
        //     options:  JSON.stringify(options)
        // } ;
        // this._actionUtil.executeAction(params,null,this,null,null)
        // .then((response) => {
        //     const vehicleServiceData = response.result?.IPResult?.result?.service || [];
        //     if(vehicleServiceData !== undefined && vehicleServiceData.length>0){
        //         this.vehicleServiceIPData = vehicleServiceData;
        //         this.AllVehicleDetails[indexval] = this.highlightVehicle(this.AllVehicleDetails[indexval]);
        //     }else{
        //         this.AllVehicleDetails[indexval] = this.highlightVehicle(this.AllVehicleDetails[indexval]);
        //     }
        // }).catch ((error) => { 
        //         console.error(error ,  " ERROR ");
        //  });
        /*End - Call OSBGS2_MenuPricing IP and pass IPInput parameters to get the response service data*/
        this.AllVehicleDetails.forEach(element => { 
            element.selectvehiclebuttonname = this.selectvehiclebuttonname;
            element.carboxcardcss = this.carboxcardcss;
            element.selectVehicleBtnCss = this.selectVehicleBtnCss;
            element.disabledselectvehiclebutton = this.disabledselectvehiclebutton;
        });

        const vehicleSelectedEvent = new CustomEvent('vehicleselected', {
            detail: { selectedVehicle: this.selectedVehicle },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(vehicleSelectedEvent);
    }
    handleGetSelectedVehicleService(vin, dealerCode, indexval) {
        console.log('Fetching services for VIN: ', vin);
    
        const IPInput = {
            vin: 'SALZA2AN0LH000153'
            //vin: vin, commented out as error handling needs to be implemented - see below
        };
    
        const options = {};
        const params = {
            input: JSON.stringify(IPInput),
            sClassName: `${this._ns}IntegrationProcedureService`,
            sMethodName: "OSBGS2_MenuPricing",
            options: JSON.stringify(options)
        };
    
        this._actionUtil.executeAction(params, null, this, null, null)
            .then((response) => {
                if(response.result.IPResult.issues){
                    console.log('Error during API call -- UI Work required. VIN: ', vin);
                }
                // let vehicleServiceData = response.result?.IPResult?.result?.service || [];
                let vehicleServiceData = response.result?.IPResult?.result?.jobHierarchy?.operationGroup || [];
                // console.log('Fetched vehicleServiceIPData:', JSON.stringify(vehicleServiceData,null,2));
                
                if (vehicleServiceData && vehicleServiceData.length > 0) {
                    this.vehicleServiceIPData = vehicleServiceData.map(serviceDetail => ({
                        category: serviceDetail.description,
                        jobs: serviceDetail.jobs || []
                    }));
                    // console.log('Processed vehicleServiceIPData:', JSON.stringify(this.vehicleServiceIPData));
                    this.AllVehicleDetails[indexval] = this.highlightVehicle(this.AllVehicleDetails[indexval], indexval);
                    this.handleSelectServiceVehicle();
                } else {
                    this.AllVehicleDetails[indexval] = this.resetVehicle(this.AllVehicleDetails[indexval], indexval);
                }
            }).catch((error) => {
                console.error('Error fetching services:', error);
            });
    }

    handleSelectServiceVehicle() {
        // console.log('Displaying fetched services');
        this.isSpinner = false;
        this.selecteService = true;
        this.disabledNextbutton = false;
        this.nextBtnCss = "background: black !important;color: white !important;padding: 1% 4% 1% 4%;";
        
        if (this.vehicleServiceIPData.length > 0) {
            
            this.vehicleServiceIPData.forEach(currentItem => {
                if (currentItem.category === 'SCHEDULED SERVICES') {
                    currentItem.isSCHEDULEDSERVICES = true;
                    currentItem.isOpenAccordion = true;
                } else {
                    currentItem.isSCHEDULEDSERVICES = false;
                    currentItem.isOpenAccordion = false;
                }
                currentItem.jobs.forEach(jobItem => {
                    jobItem.selectedServiceVal = false;
                    if(currentItem.category === 'SCHEDULED SERVICES'){
                        var descriptionValues = this.getMileageValue(jobItem.description);
                        jobItem.descriptionMileage = descriptionValues.mileageValue;
                        jobItem.descriptionFirstLine = descriptionValues.firstLineDescription;
                        jobItem.descriptionSecondLine = descriptionValues.secondLineDescription;
                    }
                });
            });

            let scheduledServiceIndex = this.vehicleServiceIPData.findIndex(service => service.category === 'SCHEDULED SERVICES');
            if (scheduledServiceIndex !== -1) {
                var closestIndexVal = this.closestScheduledServiceMileage(43000,this.vehicleServiceIPData[scheduledServiceIndex].jobs);
                console.log('closestIndexVal===> '+closestIndexVal);
                this.vehicleServiceIPData[scheduledServiceIndex].jobs[closestIndexVal].selectedServiceVal = true;
                this.selectedVehicleService['SCHEDULED SERVICES'] = [this.vehicleServiceIPData[scheduledServiceIndex].jobs[closestIndexVal]];
            }
            this.finalizeVehicleSelection();
        }
    }
    closestScheduledServiceMileage(VehicleMileage, scheduledServiceMileage) {
        console.log('VehicleMileage==>'+VehicleMileage);
        console.log('scheduledServiceMileage==>'+JSON.stringify(scheduledServiceMileage,null,2));
        // By default that will be a big number
        var closestValue = Infinity;
        // We will store the index of the element
        var closestIndex = 0;
        for (var i = 0; i < scheduledServiceMileage.length; ++i) {
            if(scheduledServiceMileage[i].descriptionMileage !== undefined){
            var diff = Math.abs(scheduledServiceMileage[i].descriptionMileage - VehicleMileage);
            if (diff < closestValue) {
            closestValue = diff;
            closestIndex = i;
            }
        }
        }
        return closestIndex;
    }
    getMileageValue(serviceDescriptionValue){
        var descriptionValue = {"firstLineDescription":"","secondLineDescription":"","mileageValue":0};
        try{
            var serviceDescription = serviceDescriptionValue.split("-");
            if(serviceDescription.length>2){
                var result = serviceDescription[serviceDescription.length-3]+"-"+serviceDescription[serviceDescription.length-2];
                var result2 = serviceDescription[serviceDescription.length-1];
                var finalResult = result2.split("/");
                var finalResultVal = finalResult[finalResult.length-3];
                //console.log(finalResultVal);//output 21,000MIs
                var mileageNumb = finalResultVal.match(/\d/g);
                mileageNumb = mileageNumb.join("");
                //console.log(numb);//output 21000

                descriptionValue.firstLineDescription = result.trim();
                descriptionValue.secondLineDescription = result2.trim();
                descriptionValue.mileageValue = mileageNumb;
            }
            return descriptionValue;
        }catch(error){
            console.log('getMileageValue Error ',error);
            return descriptionValue;
        }
    }
    handleServiceRadioSelection(event) {
        var childindex = event.target.dataset.id;
        var headerindex = event.target.dataset.mid;
        var headerName = event.target.dataset.name;
    
        this.vehicleServiceIPData[headerindex].jobs.forEach(job => {
            job.selectedServiceVal = false;
        });
        this.vehicleServiceIPData[headerindex].jobs[childindex].selectedServiceVal = true;
        this.selectedVehicleService[headerName] = [this.vehicleServiceIPData[headerindex].jobs[childindex]];
        
        // console.log('Updated selectedVehicleService:', this.selectedVehicleService);
        this.finalizeVehicleSelection();
    }
    
    handleServiceCheckboxSelection(event) {
        try {
            let childindex = event.target.dataset.id;
            let headerindex = event.target.dataset.mid;
            let headerName = event.target.dataset.name;
            let headerId = event.target.dataset.serviceheaderid;
            let clonedVehicleServiceIPData = JSON.parse(JSON.stringify(this.vehicleServiceIPData));
            let clonedSelectedVehicleService = JSON.parse(JSON.stringify(this.selectedVehicleService));
    
            clonedVehicleServiceIPData[headerindex].jobs[childindex].selectedServiceVal = event.target.checked;
    
            let selectedServiceAllVal = [];
            var selectedServices = [...this.template.querySelectorAll(`[data-serviceheaderid="${headerId}"]`)]
                .filter(element => element.checked)
                .map(element => element.dataset.id);
    
            if (selectedServices !== undefined && selectedServices.length > 0) {
                selectedServices.forEach(currentItemIndex => {
                    selectedServiceAllVal.push(clonedVehicleServiceIPData[headerindex].jobs[currentItemIndex]);
                });
            }
    
            clonedSelectedVehicleService[headerName] = selectedServiceAllVal;
    
            this.vehicleServiceIPData = clonedVehicleServiceIPData;
            this.selectedVehicleService = clonedSelectedVehicleService;
            this.finalizeVehicleSelection();
            // console.log('Updated selectedVehicleService:', this.selectedVehicleService);
        } catch (error) {
            console.error("Error in handleServiceCheckboxSelection: ", error);
        }
    }

    clearSlectedService(){//Clear the Selected Service array
        // console.log('clearSlectedService===>'+JSON.stringify(this.selectedVehicleService));
        for (var key in this.selectedVehicleService) {
        if (typeof this.selectedVehicleService[key] == "string") {
                this.selectedVehicleService[key] = '';
            } else if (typeof this.selectedVehicleService[key] == 'object') {
                this.selectedVehicleService[key] = [];
            } else if (Array.isArray(this.selectedVehicleService[key])) {
                this.selectedVehicleService[key] = [];
            } else {
                delete this.selectedVehicleService[key];
            }
        }
    }
    handleUpdateVehicleClick(event) {
        this.isSpinner = true;
        this.isUpdateVehicle = true;
        let VehicleRegistrationNumberNo = event.target.dataset.id;
        let indexval = event.target.dataset.mid;
        this.handleUpdateVehicleIndexVal = event.target.dataset.mid;
        if (this.AllVehicleDetails[this.handleUpdateVehicleIndexVal] != undefined) {
            this.updateVehicleDetails = Object.assign({},this.AllVehicleDetails[this.handleUpdateVehicleIndexVal]); //this.AllVehicleDetails[this.handleUpdateVehicleIndexVal];
            this.modelOptions.forEach(currentItem => {
                // console.log('====> ' + currentItem.value);
                if (currentItem.value === VehicleRegistrationNumberNo) {
                    currentItem.selectedModelValue = "selected";
                } else {
                    currentItem.selectedModelValue = "";
                }
            });
            // console.log('Update this.updateVehicleDetails===>' + JSON.stringify(this.updateVehicleDetails));
        }
        this.IsNewBooking = true;
        this.isSpinner = false;
    }
    handleAddNewVehicle(event) {
        this.isSpinner = true;
        this.isUpdateVehicle = false;
        let VehicleRegistrationNumberNo = event.target.dataset.id;
        this.updateVehicleDetails = { "VIN": "", "VehicleRegistrationNumber": "", "Licenseplate": "", "Mileage": "" };
        this.modelOptions.forEach(currentItem => {
            currentItem.selectedModelValue = "";
        });
        this.IsNewBooking = true;
        this.isSpinner = false;
    }
    handleNeworUpdateVehicleInput(event) {
        let inputfieldname = event.target.dataset.name;
        if (inputfieldname === 'VIN' && !this.isUpdateVehicle) {
            this.updateVehicleDetails.VIN = event.target.value;
            this.VINvalidation = false;
        }
        if (inputfieldname === 'modelname' && !this.isUpdateVehicle) {
            this.updateVehicleDetails.VehicleRegistrationNumber = event.target.value;
            this.modelvalidation = false;
        }
        if (inputfieldname === 'Licenseplate' && !this.isUpdateVehicle) {
            this.updateVehicleDetails.Licenseplate = event.target.value;
            this.Licenseplatevalidation = false;
        }
        if (inputfieldname === 'Mileage') {
            this.updateVehicleDetails.Mileage = event.target.value;
            if(event.target.value >=0.01 && !"-".includes(event.target.value)){
                this.Mileagevalidation = false;
                this.MileagePositivevalidation = false;
            }else if(event.target.value <0 || "-".includes(event.target.value)){
                if(event.target.value == ''){
                    this.Mileagevalidation = false;
                    this.MileagePositivevalidation = false;
                }else{
                    this.Mileagevalidation = false;
                    this.MileagePositivevalidation = true;
                }
            }else{
                this.Mileagevalidation = false;
                this.MileagePositivevalidation = false;
            }
        }
        // console.log(inputfieldname + ' Input value==>' + event.target.value);
    }
    handleMileageInputVal(event){
        
            this.updateVehicleDetails.Mileage = event.target.value;
            if(event.target.value >=0.01 && !"-".includes(event.target.value)){
                this.Mileagevalidation = false;
                this.MileagePositivevalidation = false;
            }else if(event.target.value <0 || "-".includes(event.target.value)){
                if(event.target.value == ''){
                    this.Mileagevalidation = false;
                    this.MileagePositivevalidation = false;
                }else{
                    this.Mileagevalidation = false;
                    this.MileagePositivevalidation = true;
                }
            }else{
                this.Mileagevalidation = false;
                this.MileagePositivevalidation = false;
            }
    }
    handleCancelNewBookingClick() {
        this.isSpinner = true;
        this.isUpdateVehicle = false;
        this.updateVehicleDetails = this.AllVehicleDetails[this.handleUpdateVehicleIndexVal]; 
        // console.log('MS Cancel==>' + JSON.stringify(this.updateVehicleDetails));
        this.IsNewBooking = false;
        this.VINvalidation = false;
        this.modelvalidation = false;
        this.Licenseplatevalidation = false;
        this.Mileagevalidation = false;
        this.MileagePositivevalidation = false;
        this.isSpinner = false;
    }
    handleSaveNewBookingClick() {
        this.isSpinner = true;
        this.clearSlectedService();
        // console.log('handleSaveNewBookingClick1=');

        if(this.selecteService){
        this.AllVehicleDetails[this.handleSelectedVehicleindexval].selectvehiclebuttonname = this.selectvehiclebuttonname;
        this.AllVehicleDetails[this.handleSelectedVehicleindexval].carboxcardcss = this.carboxcardcss;
        this.AllVehicleDetails[this.handleSelectedVehicleindexval].selectVehicleBtnCss = this.selectVehicleBtnCss;
        this.AllVehicleDetails[this.handleSelectedVehicleindexval].disabledselectvehiclebutton = this.disabledselectvehiclebutton;
        this.selecteService = false;
        this.disabledNextbutton = false;
        this.nextBtnCss = "color: white !important;padding: 1% 4% 1% 4%;";
        }

        if (this.isUpdateVehicle && this.handleInputValidations()) { // Update vehicle
            if (this.updateVehicleDetails.Mileage != '' && this.updateVehicleDetails.Mileage != undefined) {
                this.AllVehicleDetails[this.handleUpdateVehicleIndexVal].Mileage = this.updateVehicleDetails.Mileage;
                let updatedVehicle = {
                    "VIN": this.AllVehicleDetails[this.handleUpdateVehicleIndexVal].VIN, "Licenseplate": this.AllVehicleDetails[this.handleUpdateVehicleIndexVal].Licenseplate, "Mileage": this.AllVehicleDetails[this.handleUpdateVehicleIndexVal].Mileage, "VehicleName": "Range Rover", "VehicleRegistrationNumber": this.AllVehicleDetails[this.handleUpdateVehicleIndexVal].VehicleRegistrationNumber};
                var data = {selectedVehicle:'',updatedVehicleDetails:updatedVehicle};
                this.omniApplyCallResp(data);
            }
            this.IsNewBooking = false;           
        }
        if (!this.isUpdateVehicle && this.handleInputValidations()) { //Add new vehicle
            let newVehicleAdd = {
                "VIN": this.updateVehicleDetails.VIN, "Licenseplate": this.updateVehicleDetails.Licenseplate, "Mileage": this.updateVehicleDetails.Mileage, "VehicleName": "Range Rover", "VehicleRegistrationNumber": this.updateVehicleDetails.VehicleRegistrationNumber,
                "disabledselectvehiclebutton": this.disabledselectvehiclebutton, "carboxcardcss": this.carboxcardcss, "selectvehiclebuttonname": this.selectvehiclebuttonname, "selectVehicleBtnCss": this.selectVehicleBtnCss
            };
            this.AllVehicleDetails = [newVehicleAdd, ...this.AllVehicleDetails];
            this.IsNewBooking = false;
            this.isNoVehicle = false;
            let newVehicleDetail = {
                "VIN": this.updateVehicleDetails.VIN, "Licenseplate": this.updateVehicleDetails.Licenseplate, "Mileage": this.updateVehicleDetails.Mileage, "VehicleName": "Range Rover", "VehicleRegistrationNumber": this.updateVehicleDetails.VehicleRegistrationNumber};
            var data = {selectedVehicle:'',newVehicleDetails:newVehicleDetail};
            this.omniApplyCallResp(data);

            // console.log('Length==> ' + this.AllVehicleDetails.length);
        }
        this.isSpinner = false;
    }

    handleBackToMyBookingsClick() {
        const currentStepName = this.omniJsonData?.omniStepName;
        const previousStepName = this.omniJsonData?.previousOmniStepName;
        const keys = [
            'omniStepName', 'previousOmniStepName', 'selectedStep', 'selectedVehicle', 'VehicleName', 'VIN', 'VehicleRegistrationNumber', 'actionName',
            'dateSearched', 'location', 'selectedStepName', 'locationSearched', 'name', 'OSB_GS2_ContactDetailsOOTB', 'Block2',
            'selectedOption', 'selectedLocationName', 'selectedLocationTimeSlot', 'lastName', 'emailAddress', 'countryCode', 'phoneNumber',
            'details', 'selectedDropOffOption', 'selectedDate', 'selectedLocationDate'
        ];
        
        const data = Object.fromEntries(keys.map(key => [key, '']));
        this.omniApplyCallResp(data);
    
        if (currentStepName === 'Select Vehicle' && previousStepName === 'SummaryFromMyBookings') {
            this.navigateBackSteps(2);
        } else {
            this.omniPrevStep();
        }
    }
    
    navigateBackSteps(steps) {
        for (let i = 0; i < steps; i++) {
            this.omniPrevStep();
        }
    }

    handleStepChange(event) {
        this.activeStepNumber = event.detail.stepNumber;
    }

    handleNextBtnClick() {
        this.activeStepNumber = 9;
        this.finalizeVehicleSelection();
        this.template.querySelector('c-osb-gs2-progress-tracker').unlockStep(this.activeStepNumber);
        this.omniNextStep();
    }

    handleInputValidations() {
        // console.log('handleInputValidations');
        // console.log(this.updateVehicleDetails.VIN + '<========>' + this.updateVehicleDetails.VehicleRegistrationNumber);
        if (this.updateVehicleDetails.VIN == undefined || this.updateVehicleDetails.VIN == '') {
            this.VINvalidation = true;
        } else { this.VINvalidation = false; }

        if (this.updateVehicleDetails.VehicleRegistrationNumber == undefined || this.updateVehicleDetails.VehicleRegistrationNumber == '') {
            this.modelvalidation = true;
        } else { this.modelvalidation = false; }

        if (this.updateVehicleDetails.Licenseplate == undefined || this.updateVehicleDetails.Licenseplate == '') {
            this.Licenseplatevalidation = true;
        } else { this.Licenseplatevalidation = false; }

        if (this.updateVehicleDetails.Mileage == undefined || this.updateVehicleDetails.Mileage == '') {
            this.Mileagevalidation = true; this.MileagePositivevalidation = false;
        } else { this.Mileagevalidation = false; }
        
        if (!this.MileagePositivevalidation && !this.VINvalidation && !this.modelvalidation && !this.Licenseplatevalidation && !this.Mileagevalidation) {
            return true;
        } else {
            return false;
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

    handleDataReady(event) {
        if (event.detail.hasAllData) {
            this.disabledNextbutton = false;
            this.nextBtnCss = "background: black !important; color: white !important; padding: 1% 4% 1% 4%;";
            this.template.querySelector('c-osb-gs2-display-footer').activeStepNumber().unlockStep(3).disabledNextbutton();
        } else {
            this.disabledNextbutton = true;
            this.nextBtnCss = "background: #E9ECEC !important; color: white !important; padding: 1% 4% 1% 4%;";
        }
    }
}