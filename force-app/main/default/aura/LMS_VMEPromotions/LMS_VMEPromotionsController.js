({
    onInit : function(component, event, helper) {
        console.log('=====>>>'+component.get("v.isGSRESET"));
        console.log('=====>>>'+component.get("v.RecordType") );
        console.log('=====>>>'+component.get("v.isThereAnAddOn"));
        console.log('=====>>>'+component.get("v.SObjectType"));
        if(component.get("v.isGSRESET")){
        component.set("v.RecordType", 'LMS_ACS_VMEPromotions');
        component.set("v.SObjectType", 'LMS_Quote__c');
        component.set("v.recordId", component.get("v.quoteId"));
        }
        var action = component.get('c.cloneQuoteExpiryDate'); 
        action.setParams({
            quoteId: component.get("v.isGSRESET") == true ? component.get("v.quoteId") : component.get("v.recordId") 
        });
        action.setCallback(this, function(a){
            var state = a.getState();
			var quote = a.getReturnValue();
            if(state == 'SUCCESS') {
                console.log('====<<>>>>'+quote.LMS_QUO_ShowroomId__r.LMS_SWR_Retailer__r.LMS_ACC_NSCImporter__r.LMS_ACC_VMECampaign__c)
                component.set('v.accessToVMECampaign', quote.LMS_QUO_ShowroomId__r.LMS_SWR_Retailer__r.LMS_ACC_NSCImporter__r.LMS_ACC_VMECampaign__c);
            }
        });
        $A.enqueueAction(action);
    },
})