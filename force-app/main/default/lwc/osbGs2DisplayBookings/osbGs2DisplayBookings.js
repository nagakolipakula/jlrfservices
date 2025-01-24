import { LightningElement, api,track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';
import { getNamespaceDotNotation } from 'omnistudio/omniscriptInternalUtils';


export default class osbGs2DisplayBookings extends OmniscriptBaseMixin(LightningElement) {
    activeTab = 'upcoming';
    selectedBookingId = null;
    hasUpcomingBookings = true;
    hasPastBookings = true;
    isCancelBookingFromMyBookingsPage = false;
    isMobilitySelected = false;
    showEditBooking = false;
    @track selectedBookingDetails;
    selectedDropOffDate;
    @api stepName;
    bookings = [];


    

    _actionUtil;
    _ns = getNamespaceDotNotation();
    customLabels = null;

    connectedCallback() {
    //    console.log('Omni Data -- ' + JSON.stringify(this.omniJsonData));
    //    console.log('Custom Labels -- ' + JSON.stringify(this.omniScriptHeaderDef.allCustomLabels));
    //    console.log('Upcoming ' + JSON.stringify(this.omniScriptHeaderDef.allCustomLabels.Upcoming_bookings));
    //    console.log('Past ' + JSON.stringify(this.omniScriptHeaderDef.allCustomLabels.Past_bookings));
    //    console.log('Reference ' + JSON.stringify(this.omniScriptHeaderDef.allCustomLabels.Reference));

        this.customLabels = this.omniScriptHeaderDef.allCustomLabels;
        const bookingData = this.omniJsonData.Response || [];

        if (bookingData != null) {
            console.log('Booking Data from OmniJson:', JSON.stringify(bookingData, null, 2));
            this.bookings = this.processBookings(bookingData);
            console.log('here 2');
        } else {
            console.log('No booking data found in omniJsonData.');
        }
    }

    processBookings(data) {
        data = this.mapBookData(data);

        return data.map((booking, index) => {
            const isCanceled = booking.Status === 'Canceled';
            const isPast = /*!this.isFutureDate(booking.DropOffDate) ||*/ isCanceled;   
            return {
                id: booking.Id,
                reference: booking.Reference,
                service: booking.Service,
                vehicle: booking.VehicleMake + ' ' + booking.VehicleModel + ' ' + booking.VehicleYear,
                licensePlate: booking.VehicleRegistrationNumber,
                retailer: booking.Retailer,
                dropOffDate: booking.DropOffDate,
                dropOffTime: this.formatTime(booking.DropOffTimeUnformatted),
                Status: booking.Status,
                rowClass: index % 2 === 0 ? 'even-row' : 'odd-row',
                style: `background-color: ${index % 2 === 0 ? '#EAEBED' : '#ffffff'};`,
                isPast: isPast,
                dmsId: booking.DMSExternalId,
                vin: booking.VIN,
                customerName: booking.CustomerName,
                parentId: booking.ParentRecordId
            };
        });
    }

    mapBookData(bookingData){
        const groupedByParentId = {};
        bookingData.LineItems.forEach(item => {
            const parentId = item.ParentRecordId;
            const subject = item.Subject || "";

            if (!groupedByParentId[parentId]) {
                groupedByParentId[parentId] = [];
            }
            if (subject) {
                groupedByParentId[parentId].push(subject);
            }
        });

        let mappedBooking = Object.entries(groupedByParentId).map(([parentId, subjects]) => {
            const booking = bookingData.ServiceAppointments.find(item => item.ParentRecordId === parentId);
            if(booking){
                let bookingRecord = { ...booking };
                bookingRecord.Service = subjects.join(", ").trim();
                return bookingRecord;
            }
        });
        return mappedBooking;
    }

    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    toggleDropdown(event) {
        const dropdown = event.currentTarget.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    closeDropdown(event) {
        const dropdown = event.currentTarget.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    handleAction(event) {
        const action = event.target.dataset.action;
        const bookingId = event.target.dataset.id;

        const booking = this.findBookingById(bookingId);
        if (booking) {
            this.selectedBookingDetails = booking;

            this.updateOmniScriptData(booking).then(() => {
                if (action === 'modifyBooking') {
                    //Commented Edit booking (modify Booking) for future requirements
                    // var data = { val: null,
                    //              omniNKclickName: null,  
                    //              actionName: 'editBooking',
                    //              omniStepName: 'SelectVehicle',
                    //              previousOmniStepName: 'MyBooking',
                    //              editBookingData: this.selectedBookingDetails
                    //             };
                    // this.omniApplyCallResp(data);
                    // this.omniNextStep();
                } else if (action === 'cancelBooking') {
                    this.selectedDropOffDate = this.formatDateMMDDYYYY(this.selectedBookingDetails.dropOffDate);
                    this.isCancelBookingFromMyBookingsPage = true;
                    // this.handleCancelBookingConfirmation();
                    var data = { omniStepName: 'ServiceBooking', previousOmniStepName: 'MyBooking' }
                    this.omniApplyCallResp(data);
                } else if (action === 'EditServiceBooking') {
                    console.log('Edit Booking entered');
                }
            }).catch(error => {
                console.error('Error during action handling', error);
            });
        }
    }

    handleRowClick(event) {
        if (event.target.closest('.dropdown') || event.target.closest('.custom-menu-icon')) {
            return;
        }
        const bookingId = event.currentTarget.dataset.id;
        const action = event.target.dataset.action;
        const cellIndex = event.target.cellIndex;

        if (!action && cellIndex <= 6) {
            console.log(`Row clicked, Booking ID: ${bookingId}`);
            this.selectedBookingId = bookingId;
            this.selectedBookingDetails = this.findBookingById(bookingId);
            this.selectedDropOffDate = this.formatDateMMDDYYYY(this.selectedBookingDetails.dropOffDate);

            this.isMobilitySelected = this.selectedBookingDetails.mobility &&
            this.selectedBookingDetails.mobility.details &&
            this.selectedBookingDetails.mobility.selectedOption !== "Mobility substitute";
            var data = { existingBookingDetail: true, 
                         omniStepName: 'Select Vehicle',
                         previousOmniStepName: 'Bookings Page',
                         bookingInfo: this.selectedBookingDetails //needed or pass bookingId only
                        }
            this.omniApplyCallResp(data);
            //this.showModifyBooking = true;
            this.omniNextStep();
        }
    }

    findBookingById(bookingId) {
        return this.bookings.find(booking => booking.id === bookingId);
    }

    updateOmniScriptData(booking) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    sortBookingsByDate(bookings) {
        return bookings.sort((a, b) => {
            const dateA = this.parseDate(a.dropOffDate);
            const dateB = this.parseDate(b.dropOffDate);
            return dateA - dateB;
        });
    }

    parseDate(dateString) {
        if(dateString !== undefined && dateString.includes('/')){
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        }
        return null;
    }

    isFutureDate(dropOffDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateParts = dropOffDate.split('/');
        const dropOff = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        return dropOff >= today;
    }

    get styledBookings() {
        const upcomingBookings = this.bookings.filter(booking => !booking.isPast);
        const sortedUpcomingBookings = this.sortBookingsByDate(upcomingBookings);
        return this.styleBookings(sortedUpcomingBookings);
    }

    get upcomingBooking() {
        const upcomingBookings = this.bookings.filter(booking => !booking.isPast);

        if (upcomingBookings.length > 0) {
            this.hasUpcomingBookings = true;
            return this.hasUpcomingBookings;
        } else {
            this.hasUpcomingBookings = false;
            return this.hasUpcomingBookings;
        }
    }

    get pastBooking() {
        const pastBookings = this.bookings.filter(booking => booking.isPast);

        if (pastBookings.length > 0) {
            this.hasPastBookings = true;
            return this.hasPastBookings;
        } else {
            this.hasPastBookings = false;
        }
    }

    get styledPastBookings() {
        const pastBookings = this.bookings.filter(booking => booking.isPast);
        const sortedPastBookings = this.sortBookingsByDateDescending(pastBookings);
        return this.styleBookings(sortedPastBookings);
    }

    sortBookingsByDateDescending(bookings) {
        return bookings.sort((a, b) => {
            const dateA = this.parseDate(a.dropOffDate);
            const dateB = this.parseDate(b.dropOffDate);
            return dateB - dateA;
        });
    }

    styleBookings(bookings) {
        return bookings.map((booking, index) => ({
            ...booking,
            rowClass: index % 2 === 0 ? 'even-row' : 'odd-row',
            style: `background-color: ${index % 2 === 0 ? '#EAEBED' : '#ffffff'};`
        }));
    }

    handleTabClick(event) {
        this.activeTab = event.target.dataset.tab;
    }

    get isUpcomingTab() {
        return this.activeTab === 'upcoming';
    }

    get isPastTab() {
        return this.activeTab === 'past';
    }

    get upcomingTabClass() {
        let baseClass = 'tablinks';
        if (this.activeTab === 'upcoming') {
            baseClass += ' active upcoming-active';
        }
        return baseClass;
    }

    get pastTabClass() {
        return `tablinks ${this.activeTab === 'past' ? 'active' : ''}`;
    }

    handleCancelBookingClose() {
        this.isCancelBookingFromMyBookingsPage = false;
    }

    ipInputParams(IPInput) {
        const options = {};
        this._ipParams = {
            input: JSON.stringify(IPInput),
            sClassName: `${this._ns}IntegrationProcedureService`,
            sMethodName: "OSBGS2_CancelBooking",
            options: JSON.stringify(options)
        };
        return this;
    }    

    handleCancelBookingConfirmation() {
        if (this.selectedBookingDetails) {
            this.selectedDropOffDate = this.formatDateMMDDYYYY(this.selectedBookingDetails.dropOffDate);
            this.isCancelBookingFromMyBookingsPage = true;
    
            return this.updateOmniScriptData(this.selectedBookingDetails)
                .then(() => {
                    console.log('dmsId: ', JSON.stringify(this.selectedBookingDetails.dmsId))
                    console.log('ISOCODE: ', JSON.stringify(this.omniJsonData.ISOCode))
                    const inputParams = {
                        DMSBookingId: this.selectedBookingDetails.dmsId,
                        CountryCode: this.omniJsonData.ISOCode
                    };
    
                    return this.ipInputParams(inputParams);
                })
                .then(() => {
                    console.log('IP Request Params:', JSON.stringify(this._ipParams, null, 2));
                    this._actionUtil = new OmniscriptActionCommonUtil();
    
                    return this._actionUtil.executeAction(this._ipParams, null, this, null, null);
                })
                .then(response => {
                    console.log('IP Response:', JSON.stringify(response, null, 2));
                    console.log('Cancellation successful:', JSON.stringify(response));
                    this.template.querySelector('c-osb-gs2-show-toast').showToast('success', 'Booking cancelled successfully', 'utility:success', 3000);
                    this.isCancelBookingFromMyBookingsPage = false;
                    /*HANLE REFRESH OF DATA*/

            
                        let cancelsuccess = {
                             "omnistatus": 'Cancel', 
                             "previousOmniStatus": JSON.stringify(this.selectedBookingDetails.Status),
                                  
                        };
                        this.selectedBookingDetails.Status = 'Canceled';
                        this.omniApplyCallResp(cancelsuccess);
                        console.log('dmsstatus: ', JSON.stringify(this.selectedBookingDetails.Status));
               

                    if(!response.result.IPResult.success){
                        let cancelBookingErrorData = {
                            "CancelUpdateFailed": true,
                            "payload": response.result.IPResult.result.Payload,
                            "responseError": JSON.stringify(response.result.IPResult.result.errors),
                        };
                        console.log('Cancellation Fail:', JSON.stringify(response.result.IPResult.result.errors));
                        this.template.querySelector('c-osb-gs2-show-toast').showToast('Fail', 'Booking cancelled Fail', 'utility:Fail', 3000);
                        this.omniApplyCallResp(cancelBookingErrorData);
                    }

                    /* HANDLE ERROR - DISPLAY MESSAGE ON SCREEN AND MARKETING CLOUD ERROR HANDLING*/

                    /*this.loadPageData();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    // window.location.reload();*/

                })
                .catch(error => {
                    console.error('Error during booking cancellation', error);
                });
        } else {
            return Promise.reject('No booking details found.');
        }
    }

    loadPageData() {
        const bookingData = this.omniJsonData.Response || [];
        if (bookingData.length > 0) {
            this.bookings = this.processBookings(bookingData);
        } else {
            console.log('No booking data found in omniJsonData.');
        }
    }
    formatDateMMDDYYYY(d) {
        if (d !== undefined || !d || !d.includes('/')) {
            console.error('Invalid date:', d);
            return '';
        }
        var months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        var dateParts = d.split("/");
        if (dateParts.length !== 3) {
            console.error('Date format incorrect:', d);
            return '';
        }
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        var e = new Date(dateObject);
        return months[e.getMonth()] + ' ' + this.addDaytord(e.getDate()) + ', ' + e.getFullYear();
    }

    addDaytord(n) {
        var ords = [, 'st', 'nd', 'rd'];
        var ord, m = n % 100;
        return n + ((m > 10 && m < 14) ? 'th' : ords[m % 10] || 'th');
    }

    navigateToEdit() {
        this.showEditBooking = true;
        this.updateOmniScriptData(this.selectedBookingDetails).then(() => {
            console.log('Navigation to edit and OmniScript data updated');
        }).catch(error => {
            console.error('Error updating OmniScript data during edit navigation', error);
        });
    }

    get cancelButtonClasses() {
        let baseClass = 'CancelServiceBookingBtnCSS slds-m-right_small';
        if (this.isPastTab) {
            baseClass += ' disabled-button';
        }
        return baseClass;
    }

    get editButtonClasses() {
        let baseClass = 'EditServiceBookingBtnCSS';
        if (this.isPastTab) {
            baseClass += ' disabled-button';
        }
        return baseClass;
    }
}