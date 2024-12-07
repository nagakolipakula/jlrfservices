public with sharing class BulkDerivativeController {
    @AuraEnabled(cacheable=true)
    public static List<BulkDerivativeWrapper> getBulkDerivative(){
        try {
            List<Bulk_Derivative__c> bulkDerivativeList = [select Id, Name, Market__r.Name, Product__c, Product__r.Name, Feature__c, Feature__r.Name, 
            Engineering_Rule_Constraint__c, OXO_configuration__c,Dependency__c,Product_Pack__c  from Bulk_Derivative__c where Product__c = '01ta50000045MyTAAU' and Market__c = 'a7oa5000000VZvxAAG'];

            List<BulkDerivativeWrapper> wrapperList = new List<BulkDerivativeWrapper>();

            for(Bulk_Derivative__c bulkDerive : bulkDerivativeList) {
                BulkDerivativeWrapper wrapper = new BulkDerivativeWrapper();
                wrapper.Id = bulkDerive.Id;
                wrapper.FeatureName = bulkDerive.Feature__r.Name;
                wrapper.EngineeringRule = bulkDerive.Engineering_Rule_Constraint__c;
                wrapper.OxoConfig = bulkDerive.OXO_configuration__c;
                wrapper.Dependency = bulkDerive.Dependency__c;
                wrapper.productPack = bulkDerive.Product_Pack__c;
              //  wrapper.FitmentSpecification = terRule.Fitment_Specification__c;

                wrapperList.add(wrapper);
            }

            return wrapperList;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class BulkDerivativeWrapper {
        @AuraEnabled
        public String Id {get; set;}
        @AuraEnabled
        public String FeatureName {get; set;}
        @AuraEnabled
        public String EngineeringRule {get; set;}
        @AuraEnabled
        public String OxoConfig {get; set;}
        @AuraEnabled
        public String Dependency {get; set;}
        @AuraEnabled
        public String productPack {get; set;}
      //  @AuraEnabled
       // public String FitmentSpecification;
    }

    @AuraEnabled
    public static String updateBulkDerivate(Object bulkDerivateData ){
        //try {
            System.debug('bulkDerivateData ==>> '+bulkDerivateData);

            return 'done';
           
    }

    //Logic to remove  characters from string

    public static string removeChar(String source, Integer index) {
        return source.left(index)+source.right(source.length()-index-1);
    }

    //Invocable method for Flow 
    @InvocableMethod(label='Validate Changed Values' description='Validate the edits made within the datatable') 
   // public static List<List<validationResponse>> validateCellEdits(List<bulkDerivatives> inputDerivatives) {
    public static List<validationResponse> validateCellEdits(List<bulkDerivatives> inputDerivatives) {
        System.debug('inputDerivatives ==>> '+inputDerivatives);
        System.debug('inputDerivatives[0] ==>> '+inputDerivatives[0]);

        String jsonObj = JSON.serialize(inputDerivatives);
        System.debug('jsonObj ==>> '+jsonObj);
        String ModifiedJsonObject = removeChar(jsonObj, 0);
        ModifiedJsonObject = ModifiedJsonObject.removeEnd(']').replaceAll('__c', '');
        System.debug('ModifiedJsonObject =>> '+ModifiedJsonObject);
       /* JsonParser wrapJsonParser = (JsonParser)JSON.deserializeStrict(ModifiedJsonObject.replaceAll('__c', ''), JsonParser.class);
        System.debug('wrapJsonParser ==>> '+wrapJsonParser); */
        List<Id> editedBulkDerivativeIds = new List<Id>();

        Map<Id, String> editedValuesMap = new Map<Id,String>();
     
        JsonParser jsonParseResponse = JsonParser.parse(ModifiedJsonObject);
        for(JsonParser.bulkdreivativeDataFromFlow  res : jsonParseResponse.bulkdreivativeDataFromFlow){
            editedBulkDerivativeIds.add(res.Id);
            editedValuesMap.put(res.Id, res.OXO_configuration);
        }
        System.debug('editedBulkDerivativeIds ==>> '+editedBulkDerivativeIds);
        System.debug('editedValuesMap ==>> '+editedValuesMap);

        //Get the details of the edited Bulk Derivative Ids that are to be validated
        Map<Id, Bulk_Derivative__c> bulkDerivativeMapList = new Map<Id, Bulk_Derivative__c>([SELECT Id, Name, Feature__r.Name, Dependency__c, Pack__c, Pack__r.Name, Engineering_Rule_Constraint__c, OXO_configuration__c
                                                          from Bulk_Derivative__c WHERE Id IN: editedBulkDerivativeIds]);
        System.debug('bulkDerivativeMapList ==>> '+bulkDerivativeMapList);
        List<List<validationResponse>> validationOutputToFLowList = new List<List<validationResponse>>();
        validationResponse validityResponse = new validationResponse();
        List<validationResponse> validationResponseList = new List<validationResponse>();
        List<Id> bulkDerivativeRecordIds = new List<Id>();
        List<Boolean> errorList = new List<Boolean>();
        List<Boolean> successList = new List<Boolean>();
        List<String> FeatureList = new List<String>();

        List<Bulk_Derivative__c> bulkDerivativeListForUpdate = new  List<Bulk_Derivative__c>();



        for(ID editedKey : editedValuesMap.keySet())
        {
            for(ID bulkDrivativeMapListId : bulkDerivativeMapList.keySet()) {

                if( editedKey == bulkDrivativeMapListId)
                {

                    System.debug('editedKey =>> '+editedKey);
                    System.debug('bulkDerivativeFromMap.Id =>> '+bulkDrivativeMapListId);
                    System.debug('edited Oxo Config =>> '+editedValuesMap.get(editedKey));
                    Bulk_Derivative__c bulkDerivativeRecord = bulkDerivativeMapList.get(bulkDrivativeMapListId);
                    System.debug('Engineering Constraint ==>> '+bulkDerivativeRecord.Engineering_Rule_Constraint__c);
                    System.debug('Dependency ==>> '+bulkDerivativeRecord.Dependency__c);
                    System.debug('Pack ==>> '+bulkDerivativeRecord.Pack__c);
                    System.debug('Feature Name ==>> '+bulkDerivativeRecord.Feature__r.Name);

                    //Validation - Start    
                        if((bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Standard' && editedValuesMap.get(editedKey) != 'S') 
                            || (bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Legal' && editedValuesMap.get(editedKey) != 'S')
                            || (bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'NA' && editedValuesMap.get(editedKey) != 'NA'))
                            {
                                System.debug('Return Error - Territorial Rule Broken');
                                // validityResponse.Error = true;
                                // validityResponse.Success = false;
                                // validityResponse.FeatureName = bulkDerivativeRecord.Feature__r.Name;
                                // validationResponseList.add(validityResponse);
                                errorList.add(true);
                                successList.add(false);
                                FeatureList.add(bulkDerivativeRecord.Feature__r.Name);
                                validityResponse.Error = errorList;
                                validityResponse.Success = successList;
                                validityResponse.FeatureName = FeatureList;

                            }
                            
                     /*   else if((bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Available' && editedValuesMap.get(editedKey) != 'O')
                                || (bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Available' && editedValuesMap.get(editedKey) != 'P'))
                                {
                                    System.debug('Return Error - Territorial Rule Broken');
                                } */
                        else if((bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Available' && editedValuesMap.get(editedKey) == 'O')
                            || (bulkDerivativeRecord.Engineering_Rule_Constraint__c == 'Available' && editedValuesMap.get(editedKey) == 'P'))
                            {
                                System.debug('Return Success - Successfully Saved');
                                // validityResponse.Success = true;
                                // validityResponse.Error = false;
                                // validityResponse.FeatureName = bulkDerivativeRecord.Feature__r.Name;
                                // validationResponseList.add(validityResponse);
                                
                                Bulk_Derivative__c bulkDerivativeObject = new Bulk_Derivative__c();
                                bulkDerivativeObject.Id = bulkDerivativeRecord.Id;
                                bulkDerivativeObject.OXO_configuration__c = editedValuesMap.get(editedKey);
                                System.debug('bulkDerivativeObject ==>> '+bulkDerivativeObject);
                                bulkDerivativeListForUpdate.add(bulkDerivativeObject);

                                bulkDerivativeRecordIds.add(bulkDerivativeRecord.Id);
                                errorList.add(false);
                                successList.add(true);
                                FeatureList.add(bulkDerivativeRecord.Feature__r.Name);
                                validityResponse.Error = errorList;
                                validityResponse.Success = successList;
                                validityResponse.FeatureName = FeatureList; 
                                validityResponse.bulkDerivativeRecIds = bulkDerivativeRecordIds;
                            }

                     //Validation - End

                }
            }
        }

        System.debug('bulkDerivativeListForUpdate ==>> '+bulkDerivativeListForUpdate);
        update bulkDerivativeListForUpdate;

        // validationOutputToFLowList.add(validationResponseList);
        // System.debug('validationOutputToFLowList ==>> '+validationOutputToFLowList);
        validationResponseList.add(validityResponse);
        System.debug('validationResponseList ==>> '+validationResponseList);
       //return validationOutputToFLowList;
        return validationResponseList;

    }



    public class bulkDerivatives {
        @InvocableVariable
        public List<Bulk_Derivative__c> bulkdreivativeDataFromFlow;
       // @InvocableVariable
      //  public String Id;
       // @InvocableVariable
      //  public String OXOConfig;
      //public bulkdreivativeTestData bulkdreivativeTestData {get;set;}
    }

    public class bulkdreivativeTestData {
        public String Id {get;set;}
		//public attributes attributes {get;set;}
		public String OXO_configuration{get;set;}
    }

    public class validationResponse {
        @InvocableVariable
        public List<Id> bulkDerivativeRecIds;
        @InvocableVariable
        public List<Boolean> Error;
        @InvocableVariable
        public List<Boolean> Success;
        @InvocableVariable
        public List<String> FeatureName;
    }
}