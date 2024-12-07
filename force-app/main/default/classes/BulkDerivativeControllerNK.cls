public with sharing class BulkDerivativeControllerNK {

    @AuraEnabled(cacheable=true)
    public static List<BulkDerivativeWrapper> getBulkDerivative(String productId, String marketId) {
        try {
            System.debug('Incoming ProductId: ' + productId);
            System.debug('Incoming MarketId: ' + marketId);

            List<Bulk_Derivative__c> derivatives = [
                SELECT Id, Name, Market__r.Name, Product__c, Product__r.Name, Feature__c, Feature__r.Name,
                    Engineering_Rule_Constraint__c, OXO_configuration__c, Dependency__c, Product_Pack__c, IsDeleted
                FROM Bulk_Derivative__c
                WHERE Product__r.Name = :productId AND Market__r.Name = :marketId
            ];

            System.debug('DEBUG: Fetched Bulk Derivatives: ' + derivatives);

            List<BulkDerivativeWrapper> wrapperList = new List<BulkDerivativeWrapper>();
            for (Bulk_Derivative__c bulkDerive : derivatives) {
                BulkDerivativeWrapper wrapper = new BulkDerivativeWrapper();
                wrapper.Id = bulkDerive.Id;
                wrapper.FeatureName = bulkDerive.Feature__r.Name;
                wrapper.EngineeringRule = bulkDerive.Engineering_Rule_Constraint__c;
                wrapper.OxoConfig = bulkDerive.OXO_configuration__c;
                wrapper.Dependency = bulkDerive.Dependency__c;
                wrapper.productPack = bulkDerive.Product_Pack__c;
                wrapperList.add(wrapper);
            }

            return wrapperList;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Bulk Derivative data: ' + e.getMessage());
        }
    }

    @InvocableMethod
    public static List<validationResponse> validateCellEdits(List<bulkDerivatives> inputDerivatives) {
        System.debug('Input Derivatives: ' + inputDerivatives);

        try {
            List<Bulk_Derivative__c> bulkDerivativeListForUpdate = new List<Bulk_Derivative__c>();
            List<validationResponse> validationResponseList = new List<validationResponse>();

            for (bulkDerivatives bulkData : inputDerivatives) {
                for (Bulk_Derivative__c derivative : bulkData.bulkdreivativeDataFromFlow) {
                    System.debug('Processing Derivative: ' + derivative);

                    validationResponse response = new validationResponse();
                    response.bulkDerivativeRecIds = new List<Id>{derivative.Id};
                    response.FeatureName = new List<String>{derivative.Feature__r.Name};

                    if (derivative.Engineering_Rule_Constraint__c == 'Standard' && derivative.OXO_configuration__c != 'S') {
                        response.Error = new List<Boolean>{true};
                        response.Success = new List<Boolean>{false};
                    } else if (derivative.Engineering_Rule_Constraint__c == 'NA' && derivative.OXO_configuration__c != 'NA') {
                        response.Error = new List<Boolean>{true};
                        response.Success = new List<Boolean>{false};
                    } else {
                        response.Error = new List<Boolean>{false};
                        response.Success = new List<Boolean>{true};
                        bulkDerivativeListForUpdate.add(derivative);
                    }

                    validationResponseList.add(response);
                }
            }

            // Update valid records
            if (!bulkDerivativeListForUpdate.isEmpty()) {
                update bulkDerivativeListForUpdate;
            }

            return validationResponseList;

        } catch (Exception e) {
            throw new AuraHandledException('Error validating derivatives: ' + e.getMessage());
        }
    }

    // Wrapper for fetching data
    public class BulkDerivativeWrapper {
        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public String FeatureName { get; set; }
        @AuraEnabled public String EngineeringRule { get; set; }
        @AuraEnabled public String OxoConfig { get; set; }
        @AuraEnabled public String Dependency { get; set; }
        @AuraEnabled public String productPack { get; set; }
    }

    // Wrapper for incoming flow data
    public class bulkDerivatives {
        @InvocableVariable
        public List<Bulk_Derivative__c> bulkdreivativeDataFromFlow;
    }

    // Response for validations
    public class validationResponse {
        @InvocableVariable public List<Id> bulkDerivativeRecIds;
        @InvocableVariable public List<Boolean> Error;
        @InvocableVariable public List<Boolean> Success;
        @InvocableVariable public List<String> FeatureName;
    }

    @AuraEnabled
    public static String processIdsInApex(String payload) {
        try {
            // Deserialize the payload
            Map<String, List<String>> idsMap = (Map<String, List<String>>) JSON.deserialize(payload, Map<String, List<String>>.class);

            List<String> marketIds = idsMap.get('marketIds');
            List<String> derivativeIds = idsMap.get('derivativeIds');

            // Log the incoming IDs
            System.debug('Market IDs: ' + marketIds);
            System.debug('Derivative IDs: ' + derivativeIds);

            // Add your logic here (e.g., query, update, etc.)
            // Example: Query all derivatives for the given market IDs
            List<Bulk_Derivative__c> derivatives = [
                SELECT Id, Name 
                FROM Bulk_Derivative__c 
                WHERE Market__c IN :marketIds AND Product__c IN :derivativeIds
            ];

            System.debug('Queried Derivatives: ' + derivatives);

            return 'Processed successfully with ' + derivatives.size() + ' records.';
        } catch (Exception e) {
            throw new AuraHandledException('Error processing IDs in Apex: ' + e.getMessage());
        }
    }
}