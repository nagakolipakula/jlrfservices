public with sharing class GOL_SendFinInfoToBank {

    @future(callout=true)
    public static void sendFinanceContextRequestAsync(String financeInfoId) {
        LMS_FinanceInformation__c financeRecord = fetchFinanceRecord(financeInfoId);
        if (financeRecord == null) {
            System.debug('Finance record not found for Id: ' + financeInfoId);
            return;
        }

        GOL_SendFinInfoToBankWrapper payload = new GOL_SendFinInfoToBankWrapper();
        String externalQuoteId = '';
        if (financeRecord.LMS_FIN_Quote__c != null) {
            try {
                LMS_Quote__c quoteRecord = [SELECT EPRT_QUO_External_ID__c FROM LMS_Quote__c WHERE Id = :financeRecord.LMS_FIN_Quote__c LIMIT 1];
                externalQuoteId = quoteRecord.EPRT_QUO_External_ID__c != null ? quoteRecord.EPRT_QUO_External_ID__c : '';
            } catch (Exception e) {
                System.debug('Error fetching quote: ' + e.getMessage());
            }
        }
        payload.quoteId = externalQuoteId;
        payload.typeOfUse = financeRecord.GOL_Type_Of_Use__c;
        payload.channel = financeRecord.GOL_Channel__c;
        payload.personType = financeRecord.GOL_Person_Type__c;

        String requestBody = JSON.serialize(payload);
        HttpResponse response = executeHttpPost(financeInfoId, requestBody);

        if (response != null && response.getStatusCode() == 200) {
            updateFinanceSystemLink(financeInfoId, 'Updated Successfully');
        }
    }

    private static HttpResponse executeHttpPost(String financeInfoId, String requestBody) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('callout:GOL_MS_Finance/' + Label.GOL_Get_Finance_Quote_End_Point + '/' + financeInfoId + '/context');
            request.setMethod('POST');
            request.setTimeout(20000);
            request.setBody(requestBody);
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');
            return http.send(request);
        } catch (CalloutException e) {
            System.debug('Callout failed: ' + e.getMessage());
            return null;
        }
    }

    private static void updateFinanceSystemLink(String financeInfoId, String systemLinkUrl) {
        try {
            LMS_FinanceInformation__c financeRecord = new LMS_FinanceInformation__c(
                Id = financeInfoId,
                LMS_FIN_SysLink__c = systemLinkUrl
            );
            update financeRecord;
            System.debug('Successfully updated LMS_FIN_SysLink__c: ' + systemLinkUrl);
        } catch (Exception e) {
            System.debug('Failed to update LMS_FIN_SysLink__c: ' + e.getMessage());
        }
    }

    private static LMS_FinanceInformation__c fetchFinanceRecord(String financeInfoId) {
        try {
            return [
                SELECT 
                    LMS_FIN_Quote__c,            
                    GOL_Type_Of_Use__c,
                    GOL_Channel__c, 
                    GOL_Person_Type__c
                FROM LMS_FinanceInformation__c 
                WHERE Id = :financeInfoId 
                LIMIT 1
            ];
        } catch (Exception e) {
            System.debug('Error fetching finance record: ' + e.getMessage());
            return null;
        }
    }
}