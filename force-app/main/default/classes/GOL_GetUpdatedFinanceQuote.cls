public with sharing class GOL_GetUpdatedFinanceQuote {

    @AuraEnabled
    public static List<Response> updateFinanceQuotes(String quoteId, List<Id> financeQuoteIds) {
        System.debug('Incoming Quote ID: ' + quoteId);
        System.debug('Incoming Finance Quote IDs: ' + financeQuoteIds);

        List<Response> responses = new List<Response>();
        List<LMS_FinanceInformation__c> recordsToUpdate = new List<LMS_FinanceInformation__c>();

        List<LMS_FinanceInformation__c> financeRecords = [
                                                    SELECT Id,
                                                        LMS_FIN_Quote__c,
                                                        LMS_FIN_Term__c,
                                                        LMS_FIN_Deposit__c,
                                                        LMS_FIN_Annual_Contract_Mileage__c,
                                                        GOL_Type_Of_Use__c,
                                                        GOL_Channel__c,
                                                        GOL_Person_Type__c,
                                                        GOL_Zip_Postal_Code__c,
                                                        LMS_FIN_ProdName__c,
                                                        LMS_FIN_FinanceInstitution__c,
                                                        LMS_FIN_Finance_Reference__c,
                                                        CurrencyIsoCode,
                                                        ERPT_FIN_CreditTimeUoM__c,
                                                        LMS_FIN_Quote__r.EPRT_QUO_External_ID__c,
            											GOL_FIN_Finance_Product_Description__c,
                                                        GOL_JLR_QUOTE_FIN_ID__c
                                                    FROM LMS_FinanceInformation__c
                                                    WHERE Id IN :financeQuoteIds
                                                ];

        for (LMS_FinanceInformation__c record : financeRecords) {
            if (record.LMS_FIN_Quote__c != quoteId) {
                responses.add(new Response(false, 'Mismatched quoteId for record: ' + record.Id, record.Id));
                continue;
            }

            try {
                String payload = buildUpdatedPayload(record);
                system.debug('paylaod: ' + payload);
                HttpResponse res = GOL_GetFinanceQuote.sendFinanceQuoteRequest(payload);
                system.debug('Response: ' + res.getBody());

                if (res.getStatusCode() == 200) {
                    GOL_JSON2ApexFinancialQuoteWrapper parsed = GOL_JSON2ApexFinancialQuoteWrapper.parse(res.getBody());

                    // record.LMS_FIN_Term__c = parsed.quote.duration;
                    // record.LMS_FIN_Deposit__c = parsed.quote.downPaymentGrossAmount;
                    // record.LMS_FIN_Annual_Contract_Mileage__c = parsed.quote.annualMileage;
                    // record.GOL_Channel__c = parsed.channel;
                    // record.GOL_Person_Type__c = parsed.personType;
                    // record.GOL_Type_Of_Use__c = parsed.typeOfUse;
                    // // record.GOL_Zip_Postal_Code__c = ''; // if not from response
                    // record.LMS_FIN_ProdName__c = parsed.financialProduct.name;
					// record.GOL_View_Quote_Details__c  = JSON.serialize(parsed.quoteDetails);
                    recordsToUpdate.add(GOL_GetFinanceQuote.createFinanceInformationRecord(quoteId,parsed,record.Id));
                    responses.add(new Response(true, 'Record updated successfully', record.Id));
                } else {
                    String msg = 'API Error: ' + res.getStatusCode() + ' - ' + res.getStatus();
                    insertExceptionLog(record.Id, msg, '');
                    responses.add(new Response(false, msg, record.Id));
                }

            } catch (Exception ex) {
                insertExceptionLog(record.Id, ex.getMessage(), ex.getStackTraceString());
                responses.add(new Response(false, 'Callout Exception: ' + ex.getMessage(), record.Id));
            }
        }

        if (!recordsToUpdate.isEmpty()) {
            update recordsToUpdate;
        }

        return responses;
    }

    private static String buildUpdatedPayload(LMS_FinanceInformation__c record) {
        List<ERPT_FinanceItem__c> financeItems = [
            SELECT RecordType.DeveloperName, ERPT_FII_Description__c, ERPT_FII_GrossAmount__c, 
                   ERPT_FII_ExternalRef__c, ERPT_FII_financialProductRef__c, ERPT_FII_FullName__c
            FROM ERPT_FinanceItem__c 
            WHERE ERPT_FII_FinanceInformation__c = :record.Id
        ];
        List<Object> cpiProducts = new List<Object>();
        List<Object> nonCpiProducts = new List<Object>();
        List<Object> services = new List<Object>();
    
        for (ERPT_FinanceItem__c item : financeItems) {
            if (item.RecordType.DeveloperName == 'ERPT_FII_CPIProduct') {
                cpiProducts.add(new Map<String, Object>{
                    'financialProductId' => item.ERPT_FII_financialProductRef__c,
                    'name' => item.ERPT_FII_FullName__c,
                    // 'description' => item.ERPT_FII_Description__c,
                    'id' => item.ERPT_FII_ExternalRef__c,
                    'checked' => true
                });
            } else if (item.RecordType.DeveloperName == 'ERPT_FII_NonCPIProduct') {
                nonCpiProducts.add(new Map<String, Object>{
                    'financialProductId' => item.ERPT_FII_financialProductRef__c,
                    'name' => item.ERPT_FII_FullName__c,
                    // 'description' => item.ERPT_FII_Description__c,
                    'id' => item.ERPT_FII_ExternalRef__c,
                    'checked' => true
                });
            } else if (item.RecordType.DeveloperName == 'ERPT_FII_FixedCost') {
                services.add(new Map<String, Object>{
                    'serviceId' => item.ERPT_FII_ExternalRef__c,
                    'label' => item.ERPT_FII_Description__c,
                    'defaultValue' => item.ERPT_FII_Description__c,
                    'selectedValue' => item.ERPT_FII_Description__c
                });
            }
        }
    
        Map<String, Object> units = new Map<String, Object>{
            'mileageUnit' => 'KILOMETERS',
            'currencyCode' => record.CurrencyIsoCode,
            'creditTimeUnit' => record.ERPT_FIN_CreditTimeUoM__c
        };
    
        Map<String, Object> inputFields = new Map<String, Object>{
            'durationsRange' => new Map<String, Object>{
                'selectedValue' => record.LMS_FIN_Term__c
            },
            'downPaymentGrossAmountRange' => new Map<String, Object>{
                'selectedValue' => record.LMS_FIN_Deposit__c
            }
        };
    
        if (record.LMS_FIN_Annual_Contract_Mileage__c != null) {
            inputFields.put('annualMileagesRange', new Map<String, Object>{
                'selectedValue' => record.LMS_FIN_Annual_Contract_Mileage__c
            });
        }
    
        // Construct product section
        Map<String, Object> product = new Map<String, Object>{
            'fullId' => record.LMS_FIN_Finance_Reference__c,
            'name' => record.LMS_FIN_ProdName__c,
            'description' => record.LMS_FIN_ProdName__c,
            'selected' => true,
            'provider' => record.LMS_FIN_FinanceInstitution__c,
            'units' => units,
            'inputFields' => inputFields,
            'zipCode' => record.GOL_Zip_Postal_Code__c,
            'ageRange' => new List<Object>()
        };
    
        if (!cpiProducts.isEmpty()) product.put('cpiProducts', cpiProducts);
        if (!nonCpiProducts.isEmpty()) product.put('nonCpiProducts', nonCpiProducts);
        if (!services.isEmpty()) product.put('services', services);
    
        // Final payload
        Map<String, Object> payload = new Map<String, Object>{
            'quoteId' => record.LMS_FIN_Quote__r.EPRT_QUO_External_ID__c,
            'typeOfUse' => record.GOL_Type_Of_Use__c,
            'personType' => record.GOL_Person_Type__c,
            'channel' => record.GOL_Channel__c,
            'product' => product
        };
    
        return JSON.serialize(payload);
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
    public static List<LMS_FinanceInformation__c> getFinanceInfoRecords(Id quoteId) {
        Id RecordTypeId = Schema.SObjectType.LMS_FinanceInformation__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.LMS_FIN_CENTRAL_FINANCING_RT).getRecordTypeId();//GOL-3364
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
                LMS_FIN_Annual_Contract_Mileage__c,
                LMS_FIN_SysLink__c,
                GOL_JLR_QUOTE_FIN_ID__c
            FROM LMS_FinanceInformation__c
            WHERE LMS_FIN_Quote__c = :quoteId
            AND RecordTypeId = :RecordTypeId //GOL-3364
            ORDER BY LastModifiedDate DESC
        ];
    }
}