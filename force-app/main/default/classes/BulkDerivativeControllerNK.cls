public with sharing class BulkDerivativeControllerNK {

    @AuraEnabled(cacheable=true)
    public static List<BulkDerivativeWrapper> getBulkDerivative(List<String> productIds, String marketId) {
        try {
            System.debug('Incoming ProductIds: ' + productIds);
            System.debug('Incoming MarketId: ' + marketId);
            
            List<Bulk_Derivative__c> derivatives = [
                SELECT Id, Name, Market__r.Name, Product__c, Product__r.Name, Feature__c, Feature__r.Name,
                    Engineering_Rule_Constraint__c, OXO_configuration__c, Dependency__c, Product_Pack__c,
                    Product__r.Body_Style__c, Product__r.Engine__c, Product__r.VehicleTrimLevel, 
                    Product__r.Model_Code__c, Product__r.Derivative_Pack_Code__c
                FROM Bulk_Derivative__c
                WHERE Product__r.Name IN :productIds AND Market__r.Name = :marketId
            ];

            System.debug('DEBUG: Fetched Bulk Derivatives: ' + derivatives);

            Map<String, Map<String, String>> productToFeaturesMap = new Map<String, Map<String, String>>();

            // Initialize the product-to-feature map
            for (String productId : productIds) {
                productToFeaturesMap.put(productId, new Map<String, String>());
            }

            List<BulkDerivativeWrapper> wrapperList = new List<BulkDerivativeWrapper>();
            for (Bulk_Derivative__c bulkDerive : derivatives) {
                // Populate product-to-feature mapping
                Map<String, String> featureMap = productToFeaturesMap.get(bulkDerive.Product__r.Name);
                featureMap.put(bulkDerive.Feature__r.Name, bulkDerive.OXO_configuration__c);

                BulkDerivativeWrapper wrapper = new BulkDerivativeWrapper();
                wrapper.Id = bulkDerive.Id;
                wrapper.FeatureName = bulkDerive.Feature__r.Name;
                wrapper.EngineeringRule = bulkDerive.Engineering_Rule_Constraint__c;
                wrapper.OxoConfig = bulkDerive.OXO_configuration__c;
                wrapper.Dependency = bulkDerive.Dependency__c;
                wrapper.productPack = bulkDerive.Product_Pack__c;
                wrapper.BodyStyle = bulkDerive.Product__r.Body_Style__c;
                wrapper.Engine = bulkDerive.Product__r.Engine__c;
                wrapper.Trim = bulkDerive.Product__r.VehicleTrimLevel;
                wrapper.ModelCode = bulkDerive.Product__r.Model_Code__c;
                wrapper.DerivativePackCode = bulkDerive.Product__r.Derivative_Pack_Code__c;
                wrapper.ProductValues = productToFeaturesMap; // Assign the feature map
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
        @AuraEnabled public String BodyStyle { get; set; }
        @AuraEnabled public String Engine { get; set; }
        @AuraEnabled public String Trim { get; set; }
        @AuraEnabled public String ModelCode { get; set; }
        @AuraEnabled public String DerivativePackCode { get; set; }
        @AuraEnabled public Map<String, Map<String, String>> ProductValues { get; set; }
    }
}