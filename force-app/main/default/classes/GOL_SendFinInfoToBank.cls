public with sharing class GOL_SendFinInfoToBank {
    
    private static String FULL_FINANCE_GET_QUOTE_ENDPOINT;
    private static String FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN;
    
    @InvocableMethod(label='Invoke Context Share Send To Bank API' description='Invoke Context Share Send To Bank API')
    public static List<Response> sendFinanceContext(List<String> lstFinanceInfoId) {
        String financeInfoId = lstFinanceInfoId[0];
        return new List<Response>{sendFinanceContextRequestAsync(financeInfoId)};
    }

    @AuraEnabled(cacheable=false)
    public static String sendFinanceContext(String financeInfoId) {
        Response results =  sendFinanceContextRequestAsync(financeInfoId);
        return JSON.serialize(results);
    }
    
    //@future(callout=true)//Chaneg return type to response class
    public static Response sendFinanceContextRequestAsync(String financeInfoId) {
        Response responseObj = new Response();
        try{
            System.debug('financeInfoId - '+financeInfoId);
            LMS_FinanceInformation__c financeRecord = fetchFinanceRecord(financeInfoId);
            if (financeRecord == null) {
                System.debug('Finance record not found for Id: ' + financeInfoId);
                insertExceptionLog(financeInfoId, 'Finance record not found', 'financeRecord returned null');
                //return;
                responseObj.isSuccess = false;
                responseObj.message = 'Finance record not found for Id: ' + financeInfoId;
                return responseObj;
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
            payload.provider = financeRecord.LMS_FIN_FinanceInstitution__c;

            String requestBody = JSON.serialize(payload);
            System.debug('Request Payload: ' + requestBody);
            HttpResponse response = executeHttpPost(financeInfoId, requestBody);
            System.debug('response : ' + response);
            if (response != null && response.getStatusCode() == 200) {
                String systemLinkUrl = getRouteOutUrl(response.getBody());
                if (systemLinkUrl != null) {
                    updateFinanceSystemLink(financeInfoId, systemLinkUrl);
                    responseObj.isSuccess = true;
                    responseObj.message = 'URL link found successfully!';
                    responseObj.url = systemLinkUrl;
                    //Add success message to response body : isSuccess --> true
                } else {
                    System.debug('No valid system link URL found in response.');                
                    insertExceptionLog(financeInfoId, 'No valid system link URL in response', response.getBody());
                    responseObj.isSuccess = false;
                    responseObj.message = 'No valid system link URL in response';
                    //add error message to response body isSuccess --> false + message :  'No valid system link URL in response', response.getBody()
                } 
            } else {
                String errorMessage = response != null ? response.getStatus() : 'No response received';
                insertExceptionLog(financeInfoId, 'ContextShareAPI Callout failed', errorMessage);
                responseObj.isSuccess = false;
                responseObj.message = 'ContextShareAPI Callout failed: '+ errorMessage;
            }
        }catch(Exception e){
            System.debug('Error sending finance info to Bank: ' + e.getMessage());
            insertExceptionLog(financeInfoId, 'Error sending finance info to Bank', e.getStackTraceString());
            responseObj.isSuccess = false;
            responseObj.message = 'ContextShareAPI Callout failed: ' + e.getMessage();
        }
        return responseObj;
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
            throw e;
        }
        return null;
    }    

    private static HttpResponse executeHttpPost(String financeInfoId, String requestBody) {
        try {
            
            //Label.GOL_Get_Finance_Quote_End_Point, Label.GOL_FS_X_Client_origin
        	FULL_FINANCE_GET_QUOTE_ENDPOINT = LMS_CST_IntegrationEndpoint__c.getInstance(GOL_Constants.FULL_FINANCE_GET_QUOTE_API).LMS_CST_EndpointAddress__c;
        	FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN = LMS_CST_IntegrationEndpoint__c.getInstance(GOL_Constants.FULL_FINANCE_GET_QUOTE_API).LMS_CST_Scope__c;

            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('callout:GOL_MS_Finance/' + FULL_FINANCE_GET_QUOTE_ENDPOINT + '/' + financeInfoId + '/context');
            request.setMethod('POST');
            request.setTimeout(20000);
            request.setBody(requestBody);
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');
            request.setHeader('X-Client-origin', FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN);
            return http.send(request);
        } catch (CalloutException e) {
            System.debug('Callout failed: ' + e.getMessage());
            //return null;
            throw e;
        }
    }

    private static void updateFinanceSystemLink(String financeInfoId, String systemLinkUrl) {
        try {
            System.debug('Call updateFinanceSystemLink');
            LMS_FinanceInformation__c financeRecord = new LMS_FinanceInformation__c(
                Id = financeInfoId,
                LMS_FIN_SysLink__c = systemLinkUrl,
                LMS_FIN_Status__c = GOL_Constants.SEND_TO_POS
            );
            update financeRecord;
            System.debug('Successfully updated LMS_FIN_Status__c: ' + financeRecord.LMS_FIN_Status__c);
            System.debug('Successfully updated LMS_FIN_SysLink__c: ' + systemLinkUrl);
        } catch (Exception e) {
            System.debug('Failed to update LMS_FIN_SysLink__c: ' + e.getMessage());
            insertExceptionLog(financeInfoId, 'Failed to update LMS_FIN_SysLink__c', e.getStackTraceString());
            throw e;
        }
    }

    private static LMS_FinanceInformation__c fetchFinanceRecord(String financeInfoId) {
        try {
            return [
                SELECT 
                    LMS_FIN_Quote__c,            
                    GOL_Type_Of_Use__c,
                    GOL_Channel__c, 
                    GOL_Person_Type__c,
                    LMS_FIN_FinanceInstitution__c
                FROM LMS_FinanceInformation__c 
                WHERE Id = :financeInfoId 
                LIMIT 1
            ];
        } catch (Exception e) {
            System.debug('Error fetching finance record: ' + e.getMessage());
            return null;
        }
    }

    public class Response {
        @InvocableVariable
        public Boolean isSuccess;
        
        @InvocableVariable
        public String message;
        
        @InvocableVariable
        public String url;
    }

}