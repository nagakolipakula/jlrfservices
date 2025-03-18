public with sharing class GOL_SendFinInfoToBank {

    @InvocableMethod(label='Invoke Context Share Send To Bank API' description='Invoke Context Share Send To Bank API')
    public static void sendFinanceContext(List<String> lstFinanceInfoId) {
        String financeInfoId = lstFinanceInfoId[0];
        sendFinanceContextRequestAsync(financeInfoId);
    }
    
    @future(callout=true)
    public static void sendFinanceContextRequestAsync(String financeInfoId) {
        System.debug('financeInfoId - '+financeInfoId);
        LMS_FinanceInformation__c financeRecord = fetchFinanceRecord(financeInfoId);
        if (financeRecord == null) {
            System.debug('Finance record not found for Id: ' + financeInfoId);
            insertExceptionLog(financeInfoId, 'Finance record not found', 'financeRecord returned null');
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
        System.debug('Request Payload: ' + requestBody);
        HttpResponse response = executeHttpPost(financeInfoId, requestBody);

        if (response != null && response.getStatusCode() == 200) {
            String systemLinkUrl = getRouteOutUrl(response.getBody());
            if (systemLinkUrl != null) {
                updateFinanceSystemLink(financeInfoId, systemLinkUrl);
            } else {
                System.debug('No valid system link URL found in response.');
                insertExceptionLog(financeInfoId, 'No valid system link URL in response', response.getBody());
            } 
        } else {
            String errorMessage = response != null ? response.getStatus() : 'No response received';
            insertExceptionLog(financeInfoId, 'Callout failed', errorMessage);
        }
    }

    private static void insertExceptionLog(String financeInfoId, String message, String stackTrace) {
        try {
            LMS_Exception__c lms_exc = new LMS_Exception__c(
                LMS_EXC_Message__c    = 'FinanceInfo ID : ' + financeInfoId + ' -: ' + message,
                LMS_EXC_Type__c       = 'GOL_SendFinInfoToBank',
                LMS_EXC_StackTrace__c = stackTrace
            );
            insert lms_exc;
        } catch (Exception e) {
            System.debug('Failed to log exception: ' + e.getMessage());
        }
    }

    private static String getRouteOutUrl(String responseBody) {
        try {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            if (responseMap != null && responseMap.containsKey('routeOut')) {
                Map<String, Object> routeOut = (Map<String, Object>) responseMap.get('routeOut');
                if (routeOut.containsKey('url')) {
                    return (String) routeOut.get('url');
                }
            }
        } catch (Exception e) {
            System.debug('Error parsing JSON response: ' + e.getMessage());
            insertExceptionLog(null, 'JSON Parsing Error', e.getStackTraceString());
        }
        return null;
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
                LMS_FIN_SysLink__c = systemLinkUrl,
                LMS_FIN_Status__c = 'Sent to POS'
            );
            update financeRecord;
            System.debug('Successfully updated LMS_FIN_Status__c: ' + financeRecord.LMS_FIN_Status__c);
            System.debug('Successfully updated LMS_FIN_SysLink__c: ' + systemLinkUrl);
        } catch (Exception e) {
            System.debug('Failed to update LMS_FIN_SysLink__c: ' + e.getMessage());
            insertExceptionLog(financeInfoId, 'Failed to update LMS_FIN_SysLink__c', e.getStackTraceString());
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