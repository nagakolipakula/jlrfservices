public with sharing class BulkDerivativeControllerNK {

    @AuraEnabled(cacheable=true)
    public static List<BulkDerivativeWrapper> getBulkDerivative(String productId, String marketId) {
        try {
            System.debug('Incoming ProductId: ' + productId);
            System.debug('Incoming MarketId: ' + marketId);

            List<Bulk_Derivative__c> derivatives = [
                SELECT Id, Name, Market__r.Name, Product__c, Product__r.Name, Feature__c, Feature__r.Name,
                    Engineering_Rule_Constraint__c, OXO_configuration__c, Dependency__c, Product_Pack__c
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

    @AuraEnabled(cacheable=true)
    public static List<Product2> getDiscoveryDerivatives() {
        try {
            return [
                SELECT Id, Name 
                FROM Product2 
                WHERE Name LIKE '%Discovery%' OR Name LIKE '%Velar%'
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Discovery derivatives: ' + e.getMessage());
        }
    }

    public class BulkDerivativeWrapper {
        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public String FeatureName { get; set; }
        @AuraEnabled public String EngineeringRule { get; set; }
        @AuraEnabled public String OxoConfig { get; set; }
        @AuraEnabled public String Dependency { get; set; }
        @AuraEnabled public String productPack { get; set; }
    }
}