public with sharing class GOL_FS_ViewQuoteFieldMappingController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getFieldMappings(LMS_FinanceInformation__c financeRecord) {
        System.debug('Apex getFieldMappings called with financeRecord: ' + JSON.serializePretty(financeRecord));

        Map<String, Object> response = new Map<String, Object>();

        try {
            if (financeRecord == null || financeRecord.Id == null) {
                System.debug('ERROR: financeRecord is NULL or does not have an ID.');
                throw new AuraHandledException('Finance record is invalid.');
            }

            LMS_FinanceInformation__c queriedFinanceRecord = [
                SELECT Id, LMS_FIN_Finance_Reference__c, LMS_FIN_Quote__r.LMS_QUO_SalesCountry__c
                FROM LMS_FinanceInformation__c
                WHERE Id = :financeRecord.Id
                LIMIT 1
            ];

            if (queriedFinanceRecord == null) {
                System.debug('Finance record not found.');
                throw new AuraHandledException('Finance record not found.');
            }

            System.debug('Retrieved financeRecord: ' + JSON.serializePretty(queriedFinanceRecord));

            String salesCountry = queriedFinanceRecord.LMS_FIN_Quote__r != null ? queriedFinanceRecord.LMS_FIN_Quote__r.LMS_QUO_SalesCountry__c : null;
            String productCode = queriedFinanceRecord.LMS_FIN_Finance_Reference__c;

            System.debug('Extracted Sales Country (Country_Code__c): ' + salesCountry);
            System.debug('Extracted Product Code: ' + productCode);

            if (salesCountry == null) {
                System.debug('Sales Country is NULL or EMPTY. Query may return no results.');
            }

            List<GOL_View_Quote_Field_Mapping__mdt> fieldMappings = [
                SELECT MasterLabel, Product_Code__c, Field_Name__c, Field_Name_in_FSDev__c, Sequence__c, Country_Code__c
                FROM GOL_View_Quote_Field_Mapping__mdt
                WHERE Country_Code__c = :salesCountry
                AND Product_Code__c = :productCode
            ];

            System.debug('Field Mappings Retrieved: ' + fieldMappings.size());

            response.put('salesCountry', salesCountry);
            response.put('productCode', productCode);
            response.put('fieldMappings', fieldMappings);
            response.put('countryCode', fieldMappings.isEmpty() ? null : fieldMappings[0].Country_Code__c);

            return response;
        } catch (Exception e) {
            System.debug('Error in Apex getFieldMappings: ' + e.getMessage());
            throw new AuraHandledException('Error fetching field mappings: ' + e.getMessage());
        }
    }
}