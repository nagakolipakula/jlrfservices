public with sharing class GOL_GetUpdatedFinanceQuote {

    @AuraEnabled
    public static List<Response> updateFinanceQuotes(String quoteId, List<Id> financeQuoteIds) {
        System.debug('Incoming Quote ID: ' + quoteId);
        System.debug('Incoming Finance Quote IDs: ' + financeQuoteIds);

        List<Response> responses = new List<Response>();
        List<LMS_FinanceInformation__c> recordsToUpdate = new List<LMS_FinanceInformation__c>();

        List<LMS_FinanceInformation__c> financeRecords = [
            SELECT Id, LMS_FIN_Quote__c, LMS_FIN_Term__c, LMS_FIN_Deposit__c, LMS_FIN_Annual_Contract_Mileage__c,
                GOL_Type_Of_Use__c, GOL_Channel__c, GOL_Person_Type__c, GOL_Zip_Postal_Code__c,
                LMS_FIN_ProdName__c
            FROM LMS_FinanceInformation__c
            WHERE Id IN :financeQuoteIds
        ];

        for (LMS_FinanceInformation__c record : financeRecords) {
            if (record.LMS_FIN_Quote__c != quoteId) {
                responses.add(new Response(false, 'Mismatched quoteId for record: ' + record.Id, record.Id));
                continue;
            }

            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(buildGetQuotePayload(record.Id));
            Map<String, Object> quote = (Map<String, Object>) parsed.get('quote');
            // Map<String, Object> product = (Map<String, Object>) parsed.get('product');
            record.LMS_FIN_Term__c = (Integer) quote.get('duration');
            record.LMS_FIN_Deposit__c = (Decimal) quote.get('downPaymentGrossAmount');
            record.LMS_FIN_Annual_Contract_Mileage__c = (Integer) quote.get('annualMileage');
            record.GOL_Channel__c = (String) parsed.get('channel');
            record.GOL_Person_Type__c = (String) parsed.get('personType');
            record.GOL_Type_Of_Use__c = (String) parsed.get('typeOfUse');
            record.GOL_Zip_Postal_Code__c = (String) parsed.get('zipCode');
            record.LMS_FIN_ProdName__c = 'NK 01';

            recordsToUpdate.add(record);
            responses.add(new Response(true, 'Record updated successfully', record.Id));
        }

        if (!recordsToUpdate.isEmpty()) {
            update recordsToUpdate;
        }

        return responses;
    }

    private static String buildGetQuotePayload(Id financeQuoteId) {
        LMS_FinanceInformation__c record = [
            SELECT LMS_FIN_Term__c, LMS_FIN_ProdName__c, LMS_FIN_Deposit__c, LMS_FIN_Annual_Contract_Mileage__c,
                   GOL_Type_Of_Use__c, GOL_Channel__c, GOL_Person_Type__c, GOL_Zip_Postal_Code__c,
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

    private static Response logFailure(String financeInfoId, String message, String stackTrace) {
        insertExceptionLog(financeInfoId, message, stackTrace);
        return new Response(false, 'Exception: ' + message, financeInfoId);
    }

    private static Response logFailure(String financeInfoId, String message) {
        return logFailure(financeInfoId, message, '');
    }

    private static void insertExceptionLog(String financeInfoId, String message, String stackTrace) {
        try {
            insert new LMS_Exception__c(
                LMS_EXC_Message__c = 'FinanceInfo ID : ' + financeInfoId + ' -: ' + message,
                LMS_EXC_Type__c = 'GOL_GetUpdatedFinanceQuote',
                LMS_EXC_StackTrace__c = stackTrace
            );
        } catch (Exception e) {
            System.debug('Failed to log exception: ' + e.getMessage());
        }
    }

    public class Request {
        @AuraEnabled public Id quoteId;
        @AuraEnabled public Id financeQuoteId;
    }

    public class Response {
        @AuraEnabled public Boolean isSuccess;
        @AuraEnabled public String message;
        @AuraEnabled public Id financeQuoteId;

        public Response() {}
        public Response(Boolean success, String msg, Id financeId) {
            this.isSuccess = success;
            this.message = msg;
            this.financeQuoteId = financeId;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<LMS_FinanceInformation__c> getFinanceInfoRecords() {
        return [
            SELECT Id,
                LMS_FIN_Status__c,
                LastModifiedDate,
                ERPT_FIN_InstallmentIntGrossAmt__c,
                LMS_FIN_ProdName__c,
                LMS_FIN_Quote__c,
                LMS_FIN_Quote__r.EPRT_QUO_External_ID__c,
                LMS_FIN_Term__c,
                LMS_FIN_Deposit__c,
                GOL_JLR_ID__c,
                LMS_FIN_Annual_Contract_Mileage__c
            FROM LMS_FinanceInformation__c
            ORDER BY LastModifiedDate DESC
        ];
    }
}