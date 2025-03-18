public with sharing class GOL_GetFinanceProduct {

    @InvocableMethod(label='Invoke Get Product API and return list of products' description='Invocable method to get product API')
	public static List<Response>  getProduct(List<Request> lstRequestData) {

        List<Response> lstResponse = new List<Response>();
        Response results = new Response();
        
        if (lstRequestData == null || lstRequestData.isEmpty() || 
            String.isEmpty(lstRequestData.get(0).quoteExternalId) ||
            String.isEmpty(lstRequestData.get(0).typeOfUse) ||
            String.isEmpty(lstRequestData.get(0).channel) ||
            String.isEmpty(lstRequestData.get(0).personType)) {
            
            results.isSuccess = false;
            results.errorMessage = 'Invalid input: query parameters are missing';
            
            lstResponse.add(results);
            insertExceptionLog(null, results.errorMessage, 'Validation failed due to missing parameters');
            return lstResponse;
        }
        String quoteExternalId = lstRequestData.get(0).quoteExternalId;
        String typeOfUse = lstRequestData.get(0).typeOfUse;
        String channel = lstRequestData.get(0).channel;
        String personType = lstRequestData.get(0).personType;
        try {
            String strGetProductURLEndPoint = Label.GOL_Get_Finance_Product_End_Point + '?quoteId=' + quoteExternalId + '&typeOfUse=' + typeOfUse + '&channel=' + channel + '&personType='+personType;
            HttpResponse response = sendGetProductRequest(strGetProductURLEndPoint);
            // System.debug('getStatus=====>'+ response.getStatus());
            // System.debug('getStatusCode=====>'+ response.getStatusCode());
            // System.debug('getBody =====>'+ response.getBody());
            if (response.getStatusCode() == 200) {
                results.isSuccess = true;
                results.responseBody = response.getBody();
            }else if (response.getStatusCode() != 200) {
                Map<string, object> mapResponse = (Map<string,object>)JSON.deserializeUntyped(response.getBody());
                if(mapResponse != null && mapResponse.containsKey('message')){
                    results.errorMessage = String.valueOf(mapResponse.get('message'));
                }else{
                    results.errorMessage = response.getStatus();
                }
                results.isSuccess = false;
                insertExceptionLog(quoteExternalId,results.errorMessage,response.getBody());
            } else {
                results.isSuccess = false;
                results.errorMessage =  response.getStatus();
                insertExceptionLog(quoteExternalId,results.errorMessage,response.getBody());
            }
            lstResponse.add(results);
        }catch(Exception e){
            // System.debug('e====>'+ e);
            results.errorMessage = e.getMessage();
            results.isSuccess = false;
            insertExceptionLog(quoteExternalId,e.getMessage(),e.getStackTraceString());
        }
        return lstResponse;
    }  

    public static void insertExceptionLog(String quoteId,String message,String stackTrace){
        LMS_Exception__c lms_exc = new LMS_Exception__c(
            LMS_EXC_Message__c    = 'Quote ID : ' + quoteId + ' -: '+ message,
            LMS_EXC_Type__c       = 'GOL_GetFinanceProduct.getProduct',
            LMS_EXC_StackTrace__c = stackTrace
            );
        insert lms_exc; 
    }


    private static HttpResponse sendGetProductRequest(String endPoint) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:GOL_MS_Finance/' + endPoint);
        request.setMethod('GET');
        request.setTimeout(20000);
        // request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        return http.send(request);
    }

    public class Request {

        @InvocableVariable
        public String quoteExternalId;
        
        @InvocableVariable
        public String typeOfUse;

        @InvocableVariable
        public String channel;

        @InvocableVariable
        public String personType;
    }

    public class Response {
        @InvocableVariable
        public Boolean isSuccess;
        
        @InvocableVariable
        public String responseBody;
        
        @InvocableVariable
        public String errorMessage;
    }
}