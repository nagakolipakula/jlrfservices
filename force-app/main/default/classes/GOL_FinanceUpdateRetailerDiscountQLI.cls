public with sharing class GOL_FinanceUpdateRetailerDiscountQLI {

    @AuraEnabled
	public static String updateRetailerDiscount(RequestQLIWrapper requestDataWrapper) {
        System.debug('MS lstRequestData==> '+requestDataWrapper);
        String msg = '';
        try{
            if(requestDataWrapper!=null){
            LMS_QuoteLineItem__c qli = new LMS_QuoteLineItem__c(Id=requestDataWrapper.quoteLineItemId,LMS_QLI_DiscountPercent__c=requestDataWrapper.retailerdiscountpercent,
                                                               LMS_QLI_DiscountAmount__c=requestDataWrapper.retailerdiscountAmount,LMS_QLI_DiscountNetAmount2__c=requestDataWrapper.retailerdiscountNetAmount2,LMS_QLI_TaxAdjust__c=requestDataWrapper.retailerdiscountamountInclVal);
        
            	update qli;
                msg = 'success';
            }
        }catch(Exception ex){
                msg = ex.getMessage();
        }
        return msg;
    }
    
    public class RequestQLIWrapper {

        @AuraEnabled
        public String quoteLineItemId{get;set;}
        
        @AuraEnabled
        public Double retailerdiscountpercent{get;set;} //LMS_QLI_DiscountPercent__c

        @AuraEnabled
        public Double retailerdiscountAmount{get;set;} //LMS_QLI_DiscountAmount__c

        @AuraEnabled
        public Double retailerdiscountNetAmount2{get;set;} //LMS_QLI_DiscountNetAmount2__c
        
        @AuraEnabled
        public Double retailerdiscountamountInclVal{get;set;} //LMS_QLI_TaxAdjust__c
        
    }
}