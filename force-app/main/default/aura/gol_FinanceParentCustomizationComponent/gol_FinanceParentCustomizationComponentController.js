({
	onInit : function(component, event, helper) {
        console.log('MS Quote id::==> '+ component.get("v.quoteId"));
        var VehicleQliRecord = component.get("v.qliRecord");
        console.log('MS VehicleQliRecord::==> '+JSON.stringify(VehicleQliRecord));
        if(VehicleQliRecord.LMS_QLI_DiscountPercent__c==0 || ($A.util.isEmpty(VehicleQliRecord.LMS_QLI_DiscountPercent__c) && $A.util.isEmpty(VehicleQliRecord.LMS_QLI_DiscountAmount__c))){
            component.set('v.customizationfirstcircle','circle-outline');
        }else{
            component.set('v.customizationfirstcircle','circle-fill');
        }
        
        var TotalPromotionsAndDiscountsGrossVal = component.get("v.TotalPromotionsAndDiscountsGross");
        if($A.util.isEmpty(component.get("v.TotalPromotionsAndDiscountsGross")) || component.get("v.TotalPromotionsAndDiscountsGross") == 0){
            component.set('v.customizationsecondcircle','circle-outline');
        }else{
            component.set('v.customizationsecondcircle','circle-fill');
        }
    },
    toggleSection: function(cmp, event, helper) {
        var firsticonname = cmp.get("v.customizationfirsticon");
        if(firsticonname === "utility:add"){
            cmp.set('v.customizationfirsticon','utility:dash');
        }else{
            cmp.set('v.customizationfirsticon','utility:add');
        }
    },
    toggleJlrSupportSection: function(cmp, event, helper) {
        var secondiconname = cmp.get("v.customizationsecondicon");
        if(secondiconname === "utility:add"){
            cmp.set('v.customizationsecondicon','utility:dash');
        }else{
            cmp.set('v.customizationsecondicon','utility:add');
        }
    },
    getRetailerDiscountValueFromLwc: function(cmp, event, helper) {
        var retailerDiscountVal = event.getParam('retailerDiscountValue');
        console.log('MS==> '+JSON.stringify(retailerDiscountVal));
        cmp.set('v.isretailerdiscountamountupdate','Yes');
        cmp.set('v.retailerdiscountpercent',parseFloat(retailerDiscountVal.retailerdiscountpercent));
        cmp.set('v.retailerdiscountAmount',parseFloat(retailerDiscountVal.retailerdiscountAmount));
        cmp.set('v.retailerdiscountNetAmount2',parseFloat(retailerDiscountVal.retailerdiscountNetAmount2));
        cmp.set('v.retailerdiscountamountInclVal',parseFloat(retailerDiscountVal.retailerdiscountamountInclVal));
        //console.log('MS==> typeof =='+typeof retailerDiscountVal.retailerdiscountamountInclVal);
        var navigate = cmp.get("v.navigateFlow");
        navigate("NEXT");
    }
})