public with sharing class GOL_GetUpdatedFinanceQuote {

    @AuraEnabled
    public static List<Response> updateFinanceQuotes(List<Request> idsReceivedFromOverview) {
        List<Response> financeUpdateResults = new List<Response>();
        for (Request req : idsReceivedFromOverview) {
            financeUpdateResults.add(processFinanceQuoteUpdate(req));
        }
        return financeUpdateResults;
    }

    private static Response processFinanceQuoteUpdate(Request req) {
        Response result = new Response();

        if (req == null || req.quoteId == null || req.financeQuoteId == null) {
            result.isSuccess = false;
            result.message = 'Invalid input: quoteId or financeQuoteId is missing';
            return result;
        }

        try {
            String quotePayload = buildGetQuotePayload(req.financeQuoteId);
            HttpResponse response = GOL_GetFinanceQuote.sendFinanceQuoteRequest(quotePayload);

            if (response.getStatusCode() == 200) {
                return processSuccessfulResponse(req, response);
            } else {
                return logFailure(req.financeQuoteId, 'API Error: ' + response.getStatusCode() + ' ' + response.getStatus());
            }

        } catch (Exception e) {
            return logFailure(req.financeQuoteId, e.getMessage(), e.getStackTraceString());
        }
    }

    private static Response processSuccessfulResponse(Request req, HttpResponse response) {
        Response result = new Response();

        GOL_JSON2ApexFinancialQuoteWrapper parsedResponse =
            GOL_JSON2ApexFinancialQuoteWrapper.parse(response.getBody());

        Id updatedRecordId = GOL_GetFinanceQuote.createFinanceInformationRecord(
            req.quoteId, parsedResponse, req.financeQuoteId
        );

        GOL_GetFinanceQuote.deleteFinanceItems(updatedRecordId);

        if (parsedResponse.fixedCosts != null && !parsedResponse.fixedCosts.isEmpty()) {
            GOL_GetFinanceQuote.createFinanceItemsFixedCosts(updatedRecordId, parsedResponse.fixedCosts);
        }
        if (parsedResponse.cpiProducts != null && !parsedResponse.cpiProducts.isEmpty()) {
            GOL_GetFinanceQuote.createFinanceItemsCpiProducts(updatedRecordId, parsedResponse.cpiProducts);
        }
        if (parsedResponse.nonCpiProducts != null && !parsedResponse.nonCpiProducts.isEmpty()) {
            GOL_GetFinanceQuote.createFinanceItemsNonCpiProducts(updatedRecordId, parsedResponse.nonCpiProducts);
        }

        result.isSuccess = true;
        result.message = 'Finance record updated successfully';
        result.financeQuoteId = updatedRecordId;
        return result;
    }

    private static Response logFailure(String financeInfoId, String message, String stackTrace) {
        insertExceptionLog(financeInfoId, message, stackTrace);

        Response result = new Response();
        result.isSuccess = false;
        result.message = 'Exception: ' + message;
        result.financeQuoteId = financeInfoId;
        return result;
    }

    private static Response logFailure(String financeInfoId, String message) {
        return logFailure(financeInfoId, message, '');
    }

    private static String buildGetQuotePayload(Id financeQuoteId) {
        LMS_FinanceInformation__c record = [
            SELECT LMS_FIN_Term__c,
                   LMS_FIN_ProdName__c,
                   LMS_FIN_Deposit__c,
                   LMS_FIN_Annual_Contract_Mileage__c,
                   GOL_Type_Of_Use__c,
                   GOL_Channel__c,
                   GOL_Person_Type__c,
                   GOL_Zip_Postal_Code__c,
                   LMS_FIN_Quote__r.EPRT_QUO_External_ID__c
            FROM LMS_FinanceInformation__c
            WHERE Id = :financeQuoteId
            LIMIT 1
        ];

        Map<String, Object> quote = new Map<String, Object>{
            'externalQuoteId' => record.LMS_FIN_Quote__r.EPRT_QUO_External_ID__c,
            'duration' => record.LMS_FIN_Term__c,
            'downPaymentGrossAmount' => record.LMS_FIN_Deposit__c,
            'annualMileage' => record.LMS_FIN_Annual_Contract_Mileage__c
        };

        Map<String, Object> wrapper = new Map<String, Object>{
            'quote' => quote,
            'channel' => record.GOL_Channel__c,
            'personType' => record.GOL_Person_Type__c,
            'typeOfUse' => record.GOL_Type_Of_Use__c,
            'zipCode' => record.GOL_Zip_Postal_Code__c
        };

        return JSON.serialize(wrapper);
    }

    private static void insertExceptionLog(String financeInfoId, String message, String stackTrace) {
        try {
            LMS_Exception__c lms_exc = new LMS_Exception__c(
                LMS_EXC_Message__c    = 'FinanceInfo ID : ' + financeInfoId + ' -: ' + message,
                LMS_EXC_Type__c       = 'GOL_GetUpdatedFinanceQuote',
                LMS_EXC_StackTrace__c = stackTrace
            );
            insert lms_exc;
        } catch (Exception e) {
            System.debug('Failed to log exception: ' + e.getMessage());
        }
    }

    public class Request {
        @AuraEnabled public Id quoteId;
        @AuraEnabled public String financeQuoteId;
    }

    public class Response {
        @AuraEnabled public Boolean isSuccess;
        @AuraEnabled public String message;
        @AuraEnabled public Id financeQuoteId;
    }

    @AuraEnabled(cacheable=true)
    public static List<LMS_FinanceInformation__c> getFinanceInfoRecords() {
        return [
            SELECT Id,
                LMS_FIN_Quote__c,
                LMS_FIN_Status__c,
                LastModifiedDate,
                ERPT_FIN_InstallmentIntGrossAmt__c
            FROM LMS_FinanceInformation__c
            ORDER BY LastModifiedDate DESC
        ];
    }
}