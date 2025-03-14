public without sharing class LMS_QOT_AddQliViewController {

    private static final String FITTING_RATE = 'Fitting Rate';
    public final static Id QLI_RT_PROMOTION_ID = LMS_QuoteLineItemHelper.QLI_RT_PROMOTION_ID;


    @AuraEnabled
    public static Map<String, LMS_CST_IntegrationEndpoint__c> getCustomSettings(Id recordId) {
        String country_code = getCountryCode(recordId);
        Map<String, LMS_CST_IntegrationEndpoint__c> result = new Map<String, LMS_CST_IntegrationEndpoint__c>();
        List<LMS_CST_IntegrationEndpoint__c> integration_records = [
            SELECT
                Id, LMS_CST_EndpointAddress__c, LMS_CST_Scope__c, LMS_CST_IsActive__c, LMS_CST_SalesCountryCode__c
            FROM
                LMS_CST_IntegrationEndpoint__c
            WHERE
                LMS_CST_IsActive__c = true AND
                LMS_CST_SalesCountryCode__c =: country_code AND
                (
                    LMS_CST_Scope__c = 'Accessories_App' OR
                    LMS_CST_Scope__c = 'Accessories_REST'
                )
        ];
        for (LMS_CST_IntegrationEndpoint__c integration_record : integration_records) {
            result.put(integration_record.LMS_CST_Scope__c, integration_record);
        }
        return result;
    }
    @TestVisible
    private static String getCountryCode(Id recordId) {
        String object_name = recordId.getSObjectType().getDescribe().getName();
        if (object_name.equalsIgnoreCase(LMS_Constants.QUOTE)) {
            return [SELECT Id, LMS_QUO_SalesCountry__c FROM LMS_Quote__c WHERE Id =: recordId]?.LMS_QUO_SalesCountry__c;
        } else if (object_name.equalsIgnoreCase(LMS_Constants.SALESMAN)) {
            return [SELECT Id, LMS_SIL_MarketCode__c FROM LMS_SilentSalesman__c WHERE Id =: recordId]?.LMS_SIL_MarketCode__c;
        }
        return null;
    }

    @AuraEnabled
    public static String saveOtherTaxQLI(List<LMS_QuoteLineItem__c> qliList) {
        LMS_QuoteLineItemsRelatedController.SaveResult sr;
        try {
            update qliList;
        } catch(DmlException dmlEx) {
            sr.error = dmlEx.getDmlMessage(0);
            sr.info = 'err';
        } catch(Exception e) {
            sr.error = e.getMessage();
            sr.info = 'err';
        }
        return JSON.serialize(sr);
    }

    /**
     * Method validates whether the sales price requires the approval. When does not require, it save qlis.
     *
     * @param qliList list of quote line items
     * @param recType qli record type api name
     *
     * @return an error message or an info about successfully saving the records
     */
    @AuraEnabled
    public static String saveQuoteLineItem(List<LMS_QuoteLineItem__c> qliList, String recType) {
        List<LMS_QuoteLineItem__c> qliListNoVat = new List<LMS_QuoteLineItem__c>();
        if (recType == LMS_Constants.QLI_EXTRAS_RT) {
            for (LMS_QuoteLineItem__c qli : qliList) {
                if (qli.LMS_QLI_TaxPercent__c == 0) {
                    qliListNoVat.add(qli);
                }
            }
        }
        if (qliList.isEmpty()) {
            return null;
        }
        Id recTypeId = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(recType).getRecordTypeId();
        String validationMsg;
        for (LMS_QuoteLineItem__c qli : qliList) {
            if (qli.LMS_QLI_SalesPrice__c < 0  && LMS_Utils.fetchCurrentUserJobRole() == LMS_Constants.USR_JOB_ROLE_EXECUTIVE) {
                if (recType != LMS_Constants.QLI_EXTRAS_RT) {
                    qli.LMS_QLI_ItemNeedsApproval__c = true;
                    validationMsg = Label.LMS_QLI_NeedsApproval;
                } 
            } else {
                qli.LMS_QLI_ItemNeedsApproval__c = false;
            }
            if(getCountryCode(qli.LMS_QLI_Quote__c) == 'AT'){
                qli.LMS_QLI_isNonTaxable__c =  true;
            }
            qli.RecordTypeId = recTypeId;
            if(getCountryCode(qli.LMS_QLI_Quote__c) == 'AT'){
                qli.LMS_QLI_isNonTaxable__c =  true;
            }
        }
        LMS_QuoteLineItemsRelatedController.SaveResult sr = new LMS_QuoteLineItemsRelatedController.SaveResult(Label.LMS_QLI_SavedSuccessfully, '');
        try {
            insert qliList;
            if (validationMsg != null) {
                sr.info = validationMsg;
            }
        } catch (DmlException dmlEx) {
            sr.error = dmlEx.getDmlMessage(0);
            sr.info = 'err';
        } catch (Exception e) {
            sr.error = e.getMessage();
            sr.info = 'err';
        }
        for (LMS_QuoteLineItem__c qli : qliListNoVat) {
            qli.LMS_QLI_TaxPercent__c = 0;
        }
        if (!qliListNoVat.isEmpty()) {
            update qliListNoVat;
        }
        return JSON.serialize(sr);
    }

    @AuraEnabled
    public static String saveSilentSalesmanFeature(List<LMS_SilentSalesman_Feature__c> ssfToSave, String recType) {
        List<LMS_SilentSalesman_Feature__c> ssfsWithNoVat = new List<LMS_SilentSalesman_Feature__c>();
        if (recType == 'LMS_SIF_Extras') {
            for (LMS_SilentSalesman_Feature__c ssf : ssfToSave) {
                if (ssf.LMS_SIF_TaxPercent__c == 0) {
                    ssfsWithNoVat.add(ssf);
                }
            }
        }
        if (ssfToSave.isEmpty()) {
            return null;
        }
        Id recTypeId = Schema.SObjectType.LMS_SilentSalesman_Feature__c.getRecordTypeInfosByDeveloperName().get(recType).getRecordTypeId();
        for (LMS_SilentSalesman_Feature__c ssf : ssfToSave) {
            ssf.RecordTypeId = recTypeId;
            if(getCountryCode(ssf.LMS_SIF_SilentSalesmanId__c) == 'AT'){
                ssf.LMS_SIF_isNonTaxable__c =  true;
            }
        }
        LMS_QuoteLineItemsRelatedController.SaveResult sr = new LMS_QuoteLineItemsRelatedController.SaveResult(Label.LMS_QLI_SavedSuccessfully, '');
        try {
            insert ssfToSave;
        } catch (DmlException dmlEx) {
            sr.error = dmlEx.getDmlMessage(0);
            sr.info = 'err';
        } catch (Exception e) {
            sr.error = e.getMessage();
            sr.info = 'err';
        }
        for (LMS_SilentSalesman_Feature__c ssf : ssfsWithNoVat) {
            ssf.LMS_SIF_TaxPercent__c = 0;
        }
        if (!ssfsWithNoVat.isEmpty()) {
            update ssfsWithNoVat;
        }
        return JSON.serialize(sr);
    }

    /**
    * Retrieves the Category Picklist
    */
    @AuraEnabled
    public static List<Object> getCategories() {
        return LMS_Utils.getPicklistValues('LMS_Accessory__c', 'LMS_ACS_Category__c');
    }

    /**
    * Retrieves the AddOn Picklist
    */
    @AuraEnabled
    public static List<Object> getReasonList() {
        return LMS_Utils.getPicklistValues(LMS_Constants.QUOTE, LMS_Constants.QUO_ADDONS_NOT_REQUIRED);
    }

    /**
    * Retrieves the Accessory Picklist
    */
    @AuraEnabled
    public static List<Object> getReasonListForAccessories() {
        return LMS_Utils.getPicklistValues(LMS_Constants.QUOTE, LMS_Constants.QUO_ACCESSORY_NOT_REQUIRED);
    }

    /**
    * Returns true or false depending if there are any AddOns added to the quote
    */
    @AuraEnabled
    public static Boolean isThereAnAddOn(Id recordId) {
        return [
            SELECT Id
            FROM LMS_QuoteLineItem__c qli
            WHERE LMS_QLI_Quote__c =: recordId
                AND qli.RecordType.DeveloperName =: LMS_Constants.QLI_ADD_ONS_RT
        ].size() > 0;
    }

    //Added as part LMS-12427
    @AuraEnabled
    public static String currentSalescountryCode() {
        String salesCountryCode;
       
        User currentUser = [SELECT Id, LMS_USR_SalesCountryCode__c FROM User WHERE Id = :UserInfo.getUserId()]; 
        
        salesCountryCode = currentUser.LMS_USR_SalesCountryCode__c; 
        
        return salesCountryCode; 
    }
    
    /**
    * Saves the selected reason on the Quote
    */
    @AuraEnabled
    public static void updateModifiedQuote(String recordId, String selectedReason, String recType) {
        LMS_Quote__c quoteToUpdate = [
            SELECT Id, LMS_QUO_FinanceProductNotRequiredReason__c,
                   LMS_QUO_TradeInNotRequiredReason__c
            FROM LMS_Quote__c
            WHERE Id =: recordId
        ];

        if(recType == LMS_Constants.QLI_TRADEIN_VEHICLE_RT) {
            quoteToUpdate.LMS_QUO_TradeInNotRequiredReason__c = selectedReason;
        } else {
            quoteToUpdate.LMS_QUO_FinanceProductNotRequiredReason__c = selectedReason;
        }
        update quoteToUpdate;

    }

    /**
    * Updates the reason field on the Quote for LWC Accessory component
    */
    @AuraEnabled
    public static void updateModifiedQuoteLWCAccessory(List<Object> params) {
        Id recordId = (Id) params[0];
        String selectedReason = (String) params[1];
        LMS_Quote__c quoteToUpdate = [
            SELECT Id, LMS_QUO_AccessoriesNotRequiredReason__c
            FROM LMS_Quote__c
            WHERE Id =: recordId
        ];
        quoteToUpdate.LMS_QUO_AccessoriesNotRequiredReason__c = selectedReason;
        try {
            update quoteToUpdate;
        } catch (Exception e) {
        }
    }

    /**
    * Updates the reason field on the Quote for LWC AddOn component
    */
    @AuraEnabled
    public static void updateModifiedQuoteLWCAddOn(List<Object> params) {
        Id recordId = (Id) params[0];
        String selectedReason = (String) params[1];
        LMS_Quote__c quoteToUpdate = [
            SELECT Id, LMS_QUO_AddOnsNotRequiredReason__c
            FROM LMS_Quote__c
            WHERE Id =: recordId
        ];
        quoteToUpdate.LMS_QUO_AddOnsNotRequiredReason__c = selectedReason;
        try {
            update quoteToUpdate;
        } catch (Exception e) {
        }
    }

    /**
     * Retrieves init values for the reason picklists (Accessory, Add-on)
     */
    @AuraEnabled
    public static String queryAccessoryAndAddOnLWCReason(Id recordId, String recTypeName) {
        if (recordId.getSObjectType().getDescribe().getName().equalsIgnoreCase(LMS_Constants.QUOTE)) {
            LMS_Quote__c quote = [
                SELECT LMS_QUO_AccessoriesNotRequiredReason__c, LMS_QUO_AddOnsNotRequiredReason__c
                FROM LMS_Quote__c
                WHERE Id =: recordId
            ];
            if (recTypeName == LMS_Constants.ACS_ACCESSORY_RT) {
                return quote.LMS_QUO_AccessoriesNotRequiredReason__c;
            } else if (recTypeName == LMS_Constants.ACS_ADD_ONS_RT) {
                return quote.LMS_QUO_AddOnsNotRequiredReason__c;
            }
        }
        return null;
    }

    /**
     * Retrieves init values for the reason picklists (Trade-in, Financing)
     */
    @AuraEnabled
    public static String queryTradeInAndFinanceOnAuraReason(Id recordId, String objAPIName) {
        LMS_Quote__c quote = [
            SELECT LMS_QUO_FinanceProductNotRequiredReason__c,
                LMS_QUO_TradeInNotRequiredReason__c
            FROM LMS_Quote__c
            WHERE Id =: recordId
        ];

        if(objAPIName == LMS_Constants.FINANCE_INFORMATION) {
            return quote.LMS_QUO_FinanceProductNotRequiredReason__c;
        } else if(objAPIName == LMS_Constants.STOCK_VEHICLE) {
            return quote.LMS_QUO_TradeInNotRequiredReason__c;
        } else {
            return null;
        }
    }

    /**
    * Clears the reason entered on the Quote if there was a reason saved and then the Quote Line Item has been added.
    */
    @AuraEnabled
    public static void clearModifiedQuote(Id recordId, String recType) {
        LMS_Quote__c quoteToUpdate = [
            SELECT Id, LMS_QUO_FinanceProductNotRequiredReason__c,
                LMS_QUO_AccessoriesNotRequiredReason__c,
                LMS_QUO_AddOnsNotRequiredReason__c,
                LMS_QUO_TradeInNotRequiredReason__c
            FROM LMS_Quote__c
            WHERE Id =: recordId
        ];

        if(recType == LMS_Constants.QLI_ACCESSORY_RT) {
            quoteToUpdate.LMS_QUO_AccessoriesNotRequiredReason__c = null;
        } else if(recType == LMS_Constants.QLI_ADD_ONS_RT) {
            quoteToUpdate.LMS_QUO_AddOnsNotRequiredReason__c = null;
        } else if(recType == LMS_Constants.QLI_TRADEIN_VEHICLE_RT) {
            quoteToUpdate.LMS_QUO_TradeInNotRequiredReason__c = null;
        } else {
            quoteToUpdate.LMS_QUO_FinanceProductNotRequiredReason__c = null;
        }

        update quoteToUpdate;
    }

    /**
    * Returns true or false depending if there are any Accessories added to the quote
    */
    @AuraEnabled
    public static Boolean isThereAnAccesory(Id recordId) {
        return [
            SELECT Id
            FROM LMS_QuoteLineItem__c qli
            WHERE LMS_QLI_Quote__c =:recordId
                AND qli.RecordType.DeveloperName =: LMS_Constants.QLI_ACCESSORY_RT
            ].size() > 0;
    }

    /**
     * Retrieves the list of categories for the specified record type
     *
     * @param recType record type api name
     *
     * @return list of categories
     */
    @AuraEnabled
    public static List<Object> retrieveCategories(String recType) { 
        LMS_Accessory__c acs = new LMS_Accessory__c();
        List<Schema.PicklistEntry> ple =
            acs.getSobjectType().getDescribe().fields.getMap().get('LMS_ACS_Category__c').getDescribe().getPicklistValues();
        List<LMS_CST_ACS_Category2RT__c> allCategories = LMS_CST_ACS_Category2RT__c.getAll().values();
        List<jsQueryResponse> categoryList = new List<jsQueryResponse>();

        for( Schema.PicklistEntry f : ple){
            for (LMS_CST_ACS_Category2RT__c category : allCategories) {
                if (f.getValue() == category.LMS_CST_Value__c
                    && recType == category.LMS_CST_RecordType__c) {
                        categoryList.add(new jsQueryResponse(f.getLabel(),f.getValue()));
                    }
            }
        }       
        return categoryList;
    }

    /**
     * Based on the chosen category, it returns the list of subcategories.
     *
     * @param chosenCategory selected category
     *
     * @return list of categories
     */
    @AuraEnabled
    public static List<Object> getSubCategories(String chosenCategory) {
        return LMS_Utils.getDependentSelectOptions('LMS_Accessory__c','LMS_ACS_Category__c','LMS_ACS_Subcategory__c', chosenCategory);
    }

    public class jsQueryResponse {
        @AuraEnabled public String fieldValue {get; set;}
        @AuraEnabled public String fieldLabel {get; set;}
         
        public jsQueryResponse(String fieldLabel, String fieldValue ) {
            this.fieldValue = fieldValue;
            this.fieldLabel = fieldLabel;
        }
    }

    /**
     * Based on quote id and an accessory record type, this method is selecting all possible supplements which can be
     * used for a vehicle related to the quote.
     *
     * @param recordId quote id
     * @param recType accessory record type api name
     *
     * @return list of vehicle supplements ids
     */
    @AuraEnabled
    public static List<Id> getPossibleSupplementIds(String recordId, String recType) {
        System.debug(recordId);
        System.debug(recType);
        Id accRecType = Schema.SObjectType.LMS_Accessory__c.getRecordTypeInfosByDeveloperName().get(recType).getRecordTypeId();
        System.debug(accRecType);
        LMS_QuoteLineItem__c vhcQLi = [
                SELECT Id, LMS_QLI_StockVehicle__r.LMS_VHC_VehicleModel__r.Name, LMS_QLI_ConfigurationVehicle__r.LMS_CVH_VehicleModel__r.Name
                FROM LMS_QuoteLineItem__c
                WHERE LMS_QLI_Quote__c = :recordId
                AND (LMS_QLI_StockVehicle__c != null OR LMS_QLI_ConfigurationVehicle__c != null)
                LIMIT 1
        ];
        System.debug(vhcQLi);
        List<LMS_VehicleSupplement__c> possibleSupplements = [
                SELECT LMS_VHS_Supplement__c
                FROM LMS_VehicleSupplement__c
                WHERE LMS_VHS_VehicleModel__r.Name = :vhcQLi.LMS_QLI_StockVehicle__r.LMS_VHC_VehicleModel__r.Name
                OR LMS_VHS_VehicleModel__r.Name = :vhcQLi.LMS_QLI_ConfigurationVehicle__r.LMS_CVH_VehicleModel__r.Name
        ];
        List<Id> possibleIds = new List<Id>();
        for (LMS_VehicleSupplement__c vsup : possibleSupplements) {
            possibleIds.add(vsup.LMS_VHS_Supplement__c);
        }
        System.debug(possibleIds);
        return  possibleIds;
    }

    /**
     * Fetches a retailer rate for the current showroom
     *
     * @return available retailer rate with a LMS_RRA_RateValue__c or 0
     */
    @AuraEnabled
    public static LMS_RetailerRate__c retrieveRetailerRate() {
        List<Account> accounts = [
            SELECT Id, (
                SELECT LMS_RRA_RateValue__c
                FROM Retailer_Rates__r 
                WHERE LMS_RRA_ValidFrom__c <=: Date.today()
                AND LMS_RRA_RateType__c =: FITTING_RATE
                ORDER BY LMS_RRA_ValidFrom__c DESC
                LIMIT 1
            )
            FROM Account
            WHERE Id IN (SELECT LMS_SWR_Retailer__c FROM LMS_Showroom__c WHERE Id =: LMS_CacheUtils.getShowroomId())
            LIMIT 1
        ];
        if (accounts != null && !accounts.isEmpty() && accounts[0].Retailer_Rates__r != null && !accounts[0].Retailer_Rates__r.isEmpty()) {
            return accounts[0].Retailer_Rates__r[0];
        } else {
            return new LMS_RetailerRate__c(LMS_RRA_RateValue__c = 0);
        }
    }

    /**
     * Checks whether there are stock vehicles or configuration vehicles related to the quote
     *
     * @param recordId current record id
     *
     * @return true when there are related vehicles
     */
    @AuraEnabled
    public static Boolean isThereACar(Id recordId) {
        return [
            SELECT Id
            FROM LMS_QuoteLineItem__c
            WHERE LMS_QLI_Quote__c =:recordId 
            AND (
                    (LMS_QLI_StockVehicle__c != null
                AND LMS_QLI_StockVehicle__r.RecordType.DeveloperName != :LMS_Constants.QLI_TRADEIN_VEHICLE_RT
                    )
                OR (LMS_QLI_ConfigurationVehicle__c != null)
            )
        ].size() > 0;
    }

    /**
     * Executed after pressing the Add to quote button. Chosen accessories are inserted and added to the current quote.
     *
     * @param QuoteId current quote record id
     * @param changedRecords the changed records list (to be deserialized)
     * @param recType the api name of record type
     */
    @AuraEnabled
    public static void saveQLI(Id quoteId, String changedRecords, String recType , Map<Id,LMS_Accessory__c> passByGsReset, string gsReset) {
        System.debug('Under the passByGsReset' + passByGsReset);
        recType = recType.replace('ACS', 'QLI');
        Decimal fittingCost = 0;
        String country_code = getCountryCode(quoteId);
        Id recTypeId = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(recType).getRecordTypeId();
        Double retailerRate = retrieveRetailerRate().LMS_RRA_RateValue__c;
        Map<Id, String> chosenAccessoriesId2Quantity = getChosenAccessoriesId2Quantity(changedRecords);
        List<LMS_QuoteLineItem__c> qliToSave = new List<LMS_QuoteLineItem__c>();
        for (LMS_Accessory__c accessory : getAccessories(chosenAccessoriesId2Quantity.keySet())) {
            Integer quantity = chosenAccessoriesId2Quantity.get(accessory.Id) != null ? Integer.valueOf(chosenAccessoriesId2Quantity.get(accessory.Id)) : 1;
            if (recType == LMS_Constants.QLI_ACCESSORY_RT) {
                fittingCost = accessory.LMS_ACS_FittingTime__c != null ? accessory.LMS_ACS_FittingTime__c * retailerRate : null;
            }
            Boolean nonTaxVal = false;
            Boolean nonTaxCheckAsPerMarket = false;
            if(!String.IsEmpty(gsReset) && gsReset.contains('true')){
                System.debug('Under the if' + accessory);
                String market = accessory.LMS_ACS_Retailer__r.LMS_ACC_NSC_Reference__c;
                if(market.contains('ES') || market.contains('PT') || market.contains('IC') || market.contains('AD') ){
                    nonTaxCheckAsPerMarket = false;
                }else{
                   nonTaxCheckAsPerMarket = true;
                }
                nonTaxVal = passByGsReset.containsKey(accessory.Id) ? passByGsReset.get(accessory.Id).LMS_ACS_IsNonTaxable__c : nonTaxCheckAsPerMarket;
            }
            System.debug('========<<>>>'+nonTaxVal);
            LMS_QuoteLineItem__c qli = new LMS_QuoteLineItem__c(
                LMS_QLI_Quote__c =  quoteId,
                LMS_QLI_Quantity__c = quantity,
                LMS_QLI_Supplement__c = accessory.Id,
                LMS_QLI_AccessoryDescription__c = accessory.LMS_ACS_ShortDescription__c,
                LMS_QLI_AccessoryFittingTime__c = accessory.LMS_ACS_FittingTime__c,
                LMS_QLI_AccessoryMinimumSalesPrice__c = accessory.LMS_ACS_MinimumSalesPrice__c,
                LMS_QLI_AccessoryMSRP__c = accessory.LMS_ACS_MSRP__c,
                LMS_QLI_AccessoryName__c = accessory.Name,
                LMS_QLI_AccessoryPartNumber__c = accessory.LMS_ACS_PartNumber__c,
                LMS_QLI_SalesPrice__c = accessory.LMS_ACS_PriceValue__c, //accessory.LMS_ACS_PriceValue__c, is 1500 eur and qli is czk, that becomes 60 eurs. Needs to be converted
                LMS_QLI_AccessoryFittingCost__c = fittingCost,
                RecordTypeId = recTypeId,
                LMS_QLI_PercentageCharge__c = accessory.LMS_ACS_PercentageCharge__c,
                LMS_QLI_IsDicsountAvailable__c = accessory.LMS_ACS_IsDiscountAvailable__c,
                LMS_QLI_AddByDefault__c = accessory.LMS_ACS_AddByDefault__c,
                LMS_QLI_IsNonTaxable__c = nonTaxVal 
            );
            if(!String.IsEmpty(gsReset) && gsReset.contains('true')){
              system.debug('Do nothing changes is for Smart 1.0');
            }else{
            if(country_code == 'AT'){
                qli.LMS_QLI_IsNonTaxable__c =  true;
            }else{
                qli.LMS_QLI_IsNonTaxable__c = accessory.LMS_ACS_IsNonTaxable__c;
            }
            }           
            if (qli.LMS_QLI_Quantity__c > 1) {
                qli.LMS_QLI_AccessoryMinimumSalesPrice__c = qli.LMS_QLI_AccessoryMinimumSalesPrice__c * qli.LMS_QLI_Quantity__c;
            }
            qliToSave.add(qli);
        }
        insert qliToSave;
    }

    @AuraEnabled
    public static void saveSilentSalesmanFeatures(Id silentSalesmanId, String changedRecords, String recordTypeName) {
        recordTypeName = recordTypeName.replace('ACS', 'SIF');
        Decimal fittingCost = 0;
        String country_code = getCountryCode(silentSalesmanId);
        Id recordTypeId = Schema.SObjectType.LMS_SilentSalesman_Feature__c.getRecordTypeInfosByDeveloperName().get(recordTypeName).getRecordTypeId();
        Double retailerRate = retrieveRetailerRate().LMS_RRA_RateValue__c;
        Map<Id, String> chosenAccessoriesIdByQuantity = getChosenAccessoriesId2Quantity(changedRecords);
        List<LMS_SilentSalesman_Feature__c> features = new List<LMS_SilentSalesman_Feature__c>();
        for (LMS_Accessory__c accessory : getAccessories(chosenAccessoriesIdByQuantity.keySet())) {
            Integer quantity = chosenAccessoriesIdByQuantity.get(accessory.Id) != null ? Integer.valueOf(chosenAccessoriesIdByQuantity.get(accessory.Id)) : 1;
            if (recordTypeName == LMS_Constants.SALESMAN_ACCESSORIES_RT) {
                fittingCost = accessory.LMS_ACS_FittingTime__c != null ? accessory.LMS_ACS_FittingTime__c * retailerRate : null;
            }
            LMS_SilentSalesman_Feature__c feature = new LMS_SilentSalesman_Feature__c(
                LMS_SIF_SilentSalesmanId__c = silentSalesmanId,
                LMS_SIF_Quantity__c = quantity,
                LMS_SIF_Supplement__c = accessory.Id,
                LMS_SIF_AccessoryDescription__c = accessory.LMS_ACS_ShortDescription__c,
                LMS_SIF_AccessoryFittingTime__c = accessory.LMS_ACS_FittingTime__c,
                LMS_SIF_AccessoryMinimumSalesPrice__c = accessory.LMS_ACS_MinimumSalesPrice__c,
                LMS_SIF_AccessoryMSRP__c = accessory.LMS_ACS_MSRP__c,
                LMS_SIF_AccessoryName__c = accessory.Name,
                LMS_SIF_AccessoryPartNumber__c = accessory.LMS_ACS_PartNumber__c,
                LMS_SIF_SalesPrice__c = accessory.LMS_ACS_PriceValue__c,
                LMS_SIF_AccessoryFittingCost__c = fittingCost,
                RecordTypeId = recordTypeId,
                LMS_SIF_PercentageCharge__c = accessory.LMS_ACS_PercentageCharge__c,
                LMS_SIF_IsDicsountAvailable__c = accessory.LMS_ACS_IsDiscountAvailable__c,
                LMS_SIF_AddByDefault__c = accessory.LMS_ACS_AddByDefault__c,
                LMS_SIF_Price__c = accessory.LMS_ACS_PriceValue__c,
                Name = accessory.Name
            );
            if(country_code == 'AT'){
                feature.LMS_SIF_isNonTaxable__c =  true;
            }else{
                feature.LMS_SIF_isNonTaxable__c = accessory.LMS_ACS_IsNonTaxable__c;
            }
            if (feature.LMS_SIF_Quantity__c > 1) {
                feature.LMS_SIF_AccessoryMinimumSalesPrice__c = feature.LMS_SIF_AccessoryMinimumSalesPrice__c * feature.LMS_SIF_Quantity__c;
            }
            features.add(feature);
        }
        try {
            insert features;
        } catch (Exception e) {

        }
    }

    private static Map<Id, String> getChosenAccessoriesId2Quantity(String changedRecords) {
        List<WrapperToSave> wrappers = (List<WrapperToSave>) JSON.deserialize(changedRecords, List<WrapperToSave>.class);
        Map<Id, String> chosenAccessoriesId2Quantity = new Map<Id, String> ();
        for (WrapperToSave wrap : wrappers) {
            if (wrap.isChosen == false) {
                continue;
            }
            chosenAccessoriesId2Quantity.put(wrap.changedId, wrap.quantity);
        }
        return chosenAccessoriesId2Quantity;
    }

    private static List<LMS_Accessory__c> getAccessories(Set<ID> ids) {
        return [
            SELECT
                Id, Name, LMS_ACS_ShortDescription__c, LMS_ACS_FittingTime__c, format(LMS_ACS_MinimumSalesPrice__c),
                format(LMS_ACS_MSRP__c), LMS_ACS_PartNumber__c, format(LMS_ACS_PriceValue__c), CurrencyIsoCode,
                LMS_ACS_PercentageCharge__c, LMS_ACS_IsDiscountAvailable__c, LMS_ACS_AddByDefault__c,LMS_ACS_IsNonTaxable__c,LMS_ACS_Retailer__r.LMS_ACC_NSC_Reference__c
            FROM
                LMS_Accessory__c
            WHERE
                Id IN: ids
        ];
    }

    public class WrapperToSave {
        public String changedId {get;set;}
        public Boolean isChosen {get;set;}
        public String quantity {get;set;}
    }

    /**
     * Returns the list of other taxes related to the salesCountry
     *
     * @param salesCountry - current quote salesCountry
     *
     * @return list of other taxes
     */
    @AuraEnabled
    public static Map<Id, LMS_OtherTax__c> getTaxList(ID salesCountry){
        return new Map<Id, LMS_OtherTax__c> ([
            SELECT Id, Name, LMS_OTX_Description__c, LMS_OTX_DefaultValue__c, LMS_OTX_VatTaxRate__c
            FROM LMS_OtherTax__c
            WHERE LMS_OTX_SalesCountry__c =: salesCountry
                AND LMS_OTX_Automatic_Tax__c = false
        ]);
    }
	
	/**
     * Returns the list of other taxes QLI related to the quote
     *
     * @param quoteId current quote id
     *
     * @return list of other taxes QLI
     */
	@AuraEnabled(Cacheable = true)
	public static List<LMS_QuoteLineItem__c> getAllOtherTaxQLI(Id recordId){
		return  [select id, Name, LMS_QLI_OtherTax__r.Name, LMS_QLI_LineItemDescription__c, LMS_QLI_TaxInfo__c, LMS_QLI_OtherTaxAutomatic__c, LMS_QLI_TaxAdjust__c,
				LMS_QLI_TaxBase__c, LMS_QLI_BPMSubtraction__c, LMS_QLI_NetPrice__c, LMS_QLI_SalesPrice__c, LMS_QLI_TaxPercent__c, LMS_QLI_OtherTax__r.LMS_OTX_Adjustable__c
                from LMS_QuoteLineItem__c where LMS_QLI_Quote__c =: recordId AND recordType.DeveloperName =: LMS_Constants.QLI_OTHERTAX_RT
                AND LMS_QLI_SalesCountryCode__c != 'DE'];
    }

    @AuraEnabled
    public static void deleteQuoteLineItem(Id recordId){
        LMS_QuoteLineItem__c qli = new LMS_QuoteLineItem__c(Id = recordId);
        delete qli;
    }

    @AuraEnabled(cacheable=true)
    public static Id getRecordTypeId(String objectName, String developerName){
        return [SELECT Id FROM RecordType WHERE SObjectType =: objectName  AND DeveloperName =: developerName].Id;
    }

    /**
    * Returns current retailer Id
     *
     * @return Id of a retailer that the current user is in
     */
    @AuraEnabled
    public static String getCurrentGroupId() {
        return LMS_AccountHelper.fetchAccountIdForUser(UserInfo.getUserId());
    }

    /**
     * Retrieves supplements of given record type
     *
     * @param recType record type api name
     *
     * @return list of supplements
     */
    @AuraEnabled
    public static List<LMS_Accessory__c> getSupplements(
        String recTypeId,
        String suppNameOrPartNumber,
        String category,
        String subcategory,
        Boolean isClearanceOnly,
        Boolean isRetailerOnly,
        Boolean isAccessoryPackOnly,
        String retailerId,
        String recordId,
        Boolean isMore,
        String quoteId,
        Boolean isUsedVehicle,
        Boolean isNewVehicle,
        String recTypeName
    ) {
        Set<String> filteredSupplementIds = getFilteredSupplements(quoteId);
        if (filteredSupplementIds == null) {
            throw new AuraHandledException(Label.LMS_NoRecordsFound);
        } else {
            List<LMS_Quote__c> quotes = [
                SELECT Id, LMS_QUO_ConfigurationVehicle__c, LMS_QUO_ConfigurationVehicle__r.LMS_CVH_VehicleDerivative__r.LMS_VDT_ServicePlanCat__c,
                    LMS_QUO_StockVehicle__c, LMS_QUO_StockVehicle__r.LMS_VHC_VehicleDerivative__r.LMS_VDT_ServicePlanCat__c
                FROM LMS_Quote__c WHERE Id =: quoteId
            ];
            Date today = System.today();
            String query = 'SELECT Id, Name, LMS_ACS_DisplayPictureId__c, LMS_ACS_PartNumber__c, LMS_ACS_ShortDescription__c,'
                + 'LMS_ACS_PriceValue__c, LMS_ACS_NetPrice__c, LMS_ACS_FittingMinutes__c, LMS_ACS_Term__c, LMS_ACS_ValidFrom__c, '
                + 'LMS_ACS_ValidTo__c, LMS_ACS_Retailer__c , LMS_ACS_PercentageCharge__c , LMS_ACS_Category__c , LMS_ACS_Subcategory__c , LMS_ACS_Code__c '
                + 'FROM LMS_Accessory__c WHERE RecordTypeId =: recTypeId AND LMS_ACS_Active__c = true ';
            if (String.isNotBlank(recordId)) {
                query += ' AND Id >: recordId ';
            }
            if (filteredSupplementIds.contains('None')) {
                query += ' AND LMS_ACS_Code__c = \'\'';
            } else {
                query += ' AND (Id IN: filteredSupplementIds OR LMS_ACS_Code__c = \'\') ';
            }
            if (category != null && category != '') {
                query += ' AND LMS_ACS_Category__c =: category';
            }
            if (subcategory != null && subcategory != '') {
                query += ' AND LMS_ACS_Subcategory__c =: subcategory';
            }
            if (isClearanceOnly) {
                query += ' AND LMS_ACS_Clearance__c = true';
            }
            if (isRetailerOnly) {
                query += ' AND LMS_ACS_Level__c = \'Retailer\'';
            }
            if (isAccessoryPackOnly) {
                query += ' AND LMS_ACS_Accessory_Pack__c = true';
            }
            if (!String.isEmpty(suppNameOrPartNumber)) {
                //query += ' AND (Name LIKE \'%' + suppNameOrPartNumber  + '%\' OR LMS_ACS_PartNumber__c LIKE \'%' + suppNameOrPartNumber + '%\')';
                query += ' AND (Name LIKE \'%' + String.escapeSingleQuotes(suppNameOrPartNumber)  + '%\' OR LMS_ACS_PartNumber__c LIKE \'%' + String.escapeSingleQuotes(suppNameOrPartNumber) + '%\')';
            }
            if (retailerId != null && retailerId != '') {
                query += ' AND (LMS_ACS_PreventFromSharing__c = false OR (LMS_ACS_PreventFromSharing__c = true AND LMS_ACS_Retailer__c = \'' + retailerId + '\'))';
            }
            if (recTypeId == Schema.SObjectType.LMS_Accessory__c.getRecordTypeInfosByDeveloperName().get(LMS_Constants.ACS_PROMOTION_RT).getRecordTypeId()) {
                query += ' AND LMS_ACS_ValidFrom__c <=: today AND LMS_ACS_ValidTo__c >=: today';
            }
            if (isUsedVehicle) {
                query += ' AND LMS_ACS_IsAvailableForUsedVehicles__c = true';
            }
            if (isNewVehicle) {
                query += ' AND LMS_ACS_IsAvailableForNewVehicles__c = true';
            }
            if (recTypeName == LMS_Constants.ACS_ADD_ONS_RT && quotes != null && !quotes.isEmpty()) {
                Id confServicePlanCat = quotes[0].LMS_QUO_ConfigurationVehicle__r.LMS_CVH_VehicleDerivative__r.LMS_VDT_ServicePlanCat__c;
                Id stockServicePlanCat = quotes[0].LMS_QUO_StockVehicle__r.LMS_VHC_VehicleDerivative__r.LMS_VDT_ServicePlanCat__c;
                String servicePlanCategory = LMS_Constants.QLI_ADD_ONS_SERVICE_PLAN_CATEGORY;
                if (category == servicePlanCategory) {
                    if (confServicePlanCat != null) {
                        query += ' AND LMS_ACS_ServicePlanCat__c = \'' + confServicePlanCat  + '\'';
                    } else if (stockServicePlanCat != null) {
                        query += ' AND LMS_ACS_ServicePlanCat__c = \'' + stockServicePlanCat  + '\'';
                    }
                }
                if (confServicePlanCat == null && stockServicePlanCat == null) {
                    query += ' AND LMS_ACS_Category__c !=\'' + servicePlanCategory + '\'';
                }
            }
            List<LMS_QuoteLineItem__c> vehicledata = getVehicleInformationFromQuote(quoteId);
            if (vehicledata != null && vehicledata.size() > 0) {
                Decimal configEnginePower = vehicledata[0].LMS_QLI_ConfigurationVehicle__r.LMS_CVH_EnginePower__c;
                Decimal stockEnginePower = vehicledata[0].LMS_QLI_StockVehicle__r.LMS_VHC_EnginePower__c;
                String stockBrand = vehicledata[0].LMS_QLI_StockVehicle__r.LMS_VHC_Brand__c;
                String configBrand = vehicledata[0].LMS_QLI_ConfigurationVehicle__r.LMS_CVH_Brand__c;
                String SalesCountry = vehicledata[0].LMS_QLI_SalesCountryCode__c;
                String Vehicletype = vehicledata[0].LMS_QLI_Quote__r.LMS_QUO_VehicleType__c;
                Decimal vehicleEnginePower;
                String vehicleBrand;
                if (quotes != null && !quotes.isEmpty() && quotes[0].LMS_QUO_ConfigurationVehicle__c != null) {
                    vehicleEnginePower = configEnginePower;
                    vehicleBrand = configBrand;
                } else if (quotes != null && !quotes.isEmpty() && quotes[0].LMS_QUO_StockVehicle__c != null) {
                    vehicleEnginePower = stockEnginePower;
                    vehicleBrand = stockBrand;
                }
                if (vehicleEnginePower != null) {
                    query += ' AND ( LMS_ACS_MinEnginePower__c <= ' + vehicleEnginePower + ' OR LMS_ACS_MinEnginePower__c = null)';
                    query += ' AND ( LMS_ACS_MaxEnginePower__c >= ' + vehicleEnginePower + ' OR LMS_ACS_MaxEnginePower__c = null)';
                }
                query += ' AND (LMS_ACS_Brand__c = \'' + vehicleBrand  + '\' OR LMS_ACS_Brand__c = null)';
                if (Vehicletype == 'APO') {
                    query += ' AND LMS_ACS_IsAvailableForAPOVehicles__c = true';
                }
            }
            query += ' AND LMS_ACS_Active__c = true ORDER BY Id'; // GOL-1297
            System.debug('query***** : ' + query );
            List<LMS_Accessory__c> suppList = LMS_QOT_AddQliViewControllerWithSharing.getSupplementsRespectingSharing(
                query,
                recTypeId,
                category,
                subcategory,
                today,
                recordId,
                filteredSupplementIds
            );
			
			Map<ID, LMS_QuoteLineItem__c> qliAccMap = new Map<ID, LMS_QuoteLineItem__c>();
            List<LMS_Accessory__c> uniqueSuppList = new List<LMS_Accessory__c>();
        	for(LMS_QuoteLineItem__c qli : [SELECT Id,Name,Record_Type_Name__c,LMS_QLI_Supplement__c FROM LMS_QuoteLineItem__c where LMS_QLI_Quote__c=: quoteId and LMS_QLI_Supplement__c!=null])
            {
                qliAccMap.put(qli.LMS_QLI_Supplement__c, qli);
            }
            system.debug('--- qliAccMap :'+qliAccMap);
            system.debug('---- suppList --'+suppList);
			if(!suppList.isEmpty()) 
            {
                for(LMS_Accessory__c tempAcc : suppList)
                {
                    system.debug('---- tempAcc --'+tempAcc);
                    system.debug('---- qliAccMap.containsKey(tempAcc.id) --'+qliAccMap.containsKey(tempAcc.id));
                    if(qliAccMap.containsKey(tempAcc.id))
                    {
                        continue;
                    }
                    else 
                        uniqueSuppList.add(tempAcc);
                }
            }
            if (uniqueSuppList.isEmpty() && !isMore) {
                throw new AuraHandledException(Label.LMS_NoRecordsFound);
            }
            return uniqueSuppList;
        } 
    }
    
    /**
     * LMS-6939
     * Filter the list of supplements for a given Quote based on its Vehicle Model Code
     */
    Private static Set<String> getFilteredSupplements(String recordId) {
        Set<String> filteredSupplementIds = new Set<String>();
        Set<String> modelCodes = new Set<String>();
        Id tempId = (Id) recordId;
        String objName = tempId.getSObjectType().getDescribe().getName();
        if (objName.equalsIgnoreCase(LMS_Constants.QUOTE)) {
            List<LMS_QuoteLineItem__c> qlis = [
                SELECT Id, LMS_QLI_VehicleModelCode__c
                FROM LMS_QuoteLineItem__c
                WHERE LMS_QLI_Quote__c =: recordId AND RecordType.DeveloperName IN ('LMS_QLI_NewVehicle','LMS_QLI_UsedVehicle','LMS_QLI_ConfigurationVehicle')
            ];
            for (LMS_QuoteLineItem__c qli : qlis) {
                if (String.isNotBlank(qli.LMS_QLI_VehicleModelCode__c)){
                    modelCodes.add(qli.LMS_QLI_VehicleModelCode__c);
                }
            }
        } else if (objName.equalsIgnoreCase(LMS_Constants.SALESMAN)) {
            List<LMS_SilentSalesman__c> ss = [
                SELECT Id, LMS_SIL_StockVehicleId__r.LMS_VHC_VehicleModel__r.LMS_VMO_Code__c
                FROM LMS_SilentSalesman__c
                WHERE Id =: recordId
            ];
            if (ss != null && !ss.isEmpty()) {
                modelCodes.add(ss[0].LMS_SIL_StockVehicleId__r.LMS_VHC_VehicleModel__r.LMS_VMO_Code__c);
            }
        }
        if (modelCodes != null && !modelCodes.isEmpty()) {
            List<LMS_Accessory__c> accessories = [
                SELECT Id, Name
                FROM LMS_Accessory__c
                WHERE Id IN (SELECT LMS_VHS_Supplement__c FROM LMS_VehicleSupplement__c WHERE LMS_VHS_VehicleModel__r.LMS_VMO_Code__c IN: modelCodes)
            ];
            for (LMS_Accessory__c accessory : accessories) {
                filteredSupplementIds.add(accessory.Id);
            }
        } else{
            filteredSupplementIds.add('None');  
        }
        return filteredSupplementIds;      
    }

    public static List<LMS_QuoteLineItem__c> getVehicleInformationFromQuote(Id recordId){
        return [
            SELECT Id, LMS_QLI_StockVehicle__r.LMS_VHC_EnginePower__c, LMS_QLI_ConfigurationVehicle__r.LMS_CVH_EnginePower__c,
                LMS_QLI_StockVehicle__r.LMS_VHC_Brand__c, LMS_QLI_ConfigurationVehicle__r.LMS_CVH_Brand__c,
                LMS_QLI_Quote__r.LMS_QUO_APOCar__c, LMS_QLI_Quote__r.LMS_QUO_VehicleType__c, LMS_QLI_SalesCountryCode__c
            FROM LMS_QuoteLineItem__c 
            WHERE LMS_QLI_Quote__c =: recordId 
            AND (LMS_QLI_StockVehicle__c != null OR LMS_QLI_ConfigurationVehicle__c != null) 
            LIMIT 1
        ];
    }

	@AuraEnabled
	public static String fetchTypes(String sObjectName, String fieldName){
		List<Picklist> types = new List<Picklist>();
		Schema.DescribeSObjectResult objectMeta = Schema.describeSObjects(new String[]{sObjectName})[0];
		List<Schema.PicklistEntry> picklistEntries = objectMeta.fields.getMap().get(fieldName).getDescribe().getPicklistValues();
		for( Schema.PicklistEntry entry : picklistEntries)
			{
				Picklist pl = new Picklist();
				pl.Label = entry.getLabel();
				pl.Value = entry.getValue();
				types.add(pl);
			}
			return JSON.serialize(types);
	}

    @AuraEnabled(cacheable=true)
    public static String getShowroomDealerCode() {
        User u = [SELECT LMS_USR_ShowroomId__c FROM User WHERE Id =: UserInfo.getUserId()];
        return [
            SELECT LMS_SWR_RetailerCode__c
            FROM LMS_Showroom__c
            WHERE Id =: u.LMS_USR_ShowroomId__c
        ]?.LMS_SWR_RetailerCode__c;
    }

    
    @AuraEnabled(Cacheable=true)
    public static List<CampaignWrapper> getAllPromotions(
        String recordId,
        String globalSalesChannel,
        String commonTypeOfSale
    ) {
        LMS_Quote__c quote = getQuote(recordId);
        if (quote != null) {
            String vehicleCode = getVehicleCode(quote);
            if (vehicleCode != null) {
                List<VME_5000_Codes__c> codes = [
                    SELECT Id, Name, VME_5000_code__c, VME_Brand__c, VME_Car_Line__c, VME_Derivative__c, VME_Description__c, VME_Engine_Code__c, VME_Engine__c, VME_Fuel_Type__c, VME_LE_Code__c, VME_MY_Code__c, VME_Market__c, VME_Model_Code__c, VME_Model_Name__c, VME_Pack_Code__c, VME_Transmission__c, VME_Trim__c, VME_Wheels__c, VME_Car_Line_Abbreviation__c
                    FROM VME_5000_Codes__c
                    WHERE VME_5000_code__c = :vehicleCode
                ];
                System.debug('codes===============:'+codes);
                if (!codes.isEmpty()) {
                    // VME_5000_Codes__c code = codes.get(0); // Commented by Koku VME Promotions data setup
                    // System.debug('code===============:'+code);// Commented by Koku VME Promotions data setup
                    List<VME_Campaign_Specifications__c> result = new List<VME_Campaign_Specifications__c>();
                    // set<string> vmeValue = new  set<string>();  // Commented by Koku VME Promotions data setup
                    // if (quote.LMS_QUO_ConfigurationVehicle__c != null) {
                    //     vmeValue.add(vehicleCode);
                    //     result = getCampaignSMART(vmeValue,code.VME_Car_Line_Abbreviation__c);
                    // } else if (quote.LMS_QUO_StockVehicle__c != null) {
                    //     vmeValue.add(quote.LMS_QUO_StockVehicle__r.LMS_VHC_VehicleVIN__c);
                    //     vmeValue.add(quote.LMS_QUO_StockVehicle__r.LMS_VHC_MasterVehicle__r.LMS_VHC_OrderNumber__c );
                    //     result = getCampaignSMART(vmeValue,code.VME_Car_Line_Abbreviation__c);
                    // } // Commented by Koku VME Promotions data setup
                    User currentUser = [
                                    SELECT VME_Country_Code__c 
                                        FROM User 
                                        WHERE Id = :UserInfo.getUserId()
                                        LIMIT 1
                                    ];
                    String userCountryCode = currentUser.VME_Country_Code__c;
                    result = [SELECT Id,toLabel(VME_Channel__c),VME_Type__c,toLabel(VME_Sales_Channel__c),VME_Percentage__c,VME_Invoice_segment__c,VME_Campaign__r.VME_WBS__r.VME_WBS_Key__c,VME_Amount__c,Name,VME_Quarter__c,VME_Retailer_Upload_Required__c,toLabel(VME_Document_Evidence__c),VME_Calculation_Basis__c,VME_Start_Date__c,VME_End_Date__c FROM VME_Campaign_Specifications__c WHERE VME_Campaign__r.VME_Market_Code__c = :userCountryCode];//Added by Koku (Please remove)
                    System.debug('Result===============' + result);
                    if (result != null && !result.isEmpty()) {
                        String query = 'SELECT Id, Name,VME_Start_Date__c, VME_End_Date__c,VME_Audience__c, VME_Calculation_Trigger__c, VME_Document_Type__c, '
                            + 'VME_Calculation_Basis__c, VME_Invoice_segment__c, VME_Percentage__c, VME_Amount__c, VME_Sales_Channel__c, CurrencyIsoCode, toLabel(VME_Document_Evidence__c),VME_Channel__c '
                            + 'FROM VME_Campaign_Specifications__c '
                            + 'WHERE VME_End_Date__c >= TODAY AND Id IN :result';
                        if (globalSalesChannel != null || commonTypeOfSale != null) {
                            if (globalSalesChannel != null && commonTypeOfSale != null) {
                                String commonValues = getApiNamesForSelectedValues(commonTypeOfSale);
                                query += ' AND (toLabel(VME_Channel__c) = :globalSalesChannel AND toLabel(VME_Sales_Channel__c) INCLUDES (:commonValues))';
                            } else {
                                query += ' AND toLabel(VME_Channel__c) = :globalSalesChannel';
                            }
                        }
                        result = Database.query(String.escapeSingleQuotes(query));
                        System.debug('Result before=======' + result);
                        if (result.size() > 0) {
                            LMS_QuoteLineItem__c vehicleOption = getVehicleOptions(quote.Quote_Line_Items__r);
                            List<VMEWrapper> wrapperList = new List<VMEWrapper>();
                            List<Id> allCampaignIds = new List<Id>();
                            List<Id> selectedCampaign = getVMEIds(recordId);
                            List<VME_Campaign_Specifications__c> selectedCampaignRecords = [SELECT Id, Name, VME_Start_Date__c, VME_End_Date__c, VME_Audience__c, 
                                VME_Calculation_Trigger__c, VME_Document_Type__c, VME_Calculation_Basis__c, 
                                VME_Invoice_segment__c, VME_Percentage__c, VME_Amount__c, VME_Sales_Channel__c, 
                                CurrencyIsoCode, toLabel(VME_Document_Evidence__c),VME_Channel__c
                                FROM VME_Campaign_Specifications__c WHERE Id IN :selectedCampaign];
                            
                            Set<Id> resultIds = new Set<Id>();
                            for (VME_Campaign_Specifications__c vme : result) {
                                resultIds.add(vme.Id);
                            }
                            /*if ((globalSalesChannel != null || commonTypeOfSale != null) && selectedCampaign.size() > 0) {
                                for (VME_Campaign_Specifications__c selectedRecord : selectedCampaignRecords) {
                                    if (!resultIds.contains(selectedRecord.Id)) {
                                        result.add(selectedRecord);
                                        resultIds.add(selectedRecord.Id);
                                    }
                                }
                            }*/
                            
                            for (VME_Campaign_Specifications__c vme : result) {
                                wrapperList.add(new VMEWrapper(vme, vehicleOption, vme.Id));
                                allCampaignIds.add(vme.Id);
                            }

                            for (Integer i = 0; i < wrapperList.size() - 1; i++) {
                                for (Integer j = 0; j < wrapperList.size() - i - 1; j++) {
                                    if (wrapperList[j].vme.VME_Amount__c < wrapperList[j + 1].vme.VME_Amount__c) {
                                        VMEWrapper temp = wrapperList[j];
                                        wrapperList[j] = wrapperList[j + 1];
                                        wrapperList[j + 1] = temp;
                                    }
                                }
                            }

                            List<VME_Campaign_Specifications__c> sortedResult = new List<VME_Campaign_Specifications__c>();
                            for (VMEWrapper wrapper : wrapperList) {
                                sortedResult.add(wrapper.vme);
                            }
                            System.debug('Result sorting ======='+sortedResult);
                            List<CampaignWrapper> incompatibleCampaigns = getNewIncompatibleCampaigns(allCampaignIds, sortedResult,selectedCampaign);
                            return incompatibleCampaigns;
                        } else {
                            throw new AuraHandledException(Label.LMS_NoRecordsFound);
                        }

                    } else {
                        throw new AuraHandledException(Label.LMS_NoRecordsFound);
                    }
                }
            }
        }
    
        throw new AuraHandledException(Label.LMS_NoRecordsFound);
    }
    
    public class CampaignWrapper {
        @AuraEnabled
        public Id campaignId;
        @AuraEnabled
        public List<Id> incompatibleCampaignIds;
        @AuraEnabled
        public List<VME_Campaign_Specifications__c> sortedResult;
        @AuraEnabled
        public List<Id> existingVMEIds;
    
        public CampaignWrapper(Id campaignId, List<Id> incompatibleCampaignIds, List<VME_Campaign_Specifications__c> sortedResult,List<Id> existingVMEIds) {
            this.campaignId = campaignId;
            this.incompatibleCampaignIds = incompatibleCampaignIds;
            this.sortedResult = sortedResult;
            this.existingVMEIds = existingVMEIds;
        }
    }
    
    
    
    
    public class VMEWrapper {
        public VME_Campaign_Specifications__c vme;
        public Decimal amount;
        public Id campaignId;
    
        public VMEWrapper(VME_Campaign_Specifications__c vme, LMS_QuoteLineItem__c vehicleOption, Id campaignId) {
            this.vme = vme;
            this.amount = calculateAmount(vme, vehicleOption);
            vme.VME_Amount__c = this.amount;
            this.campaignId = campaignId;
        }
    
        private Decimal calculateAmount(VME_Campaign_Specifications__c vme, LMS_QuoteLineItem__c vehicleOption) {
            Decimal amount = vme.VME_Amount__c;
            if (vme != null && vehicleOption != null) {
                if (vme.VME_Calculation_Basis__c == 'Percentage') {
                    if (vme.VME_Invoice_segment__c == VME_Utils.bprice) {
                        if (vehicleOption.LMS_QLI_VehicleBaseGrossPrice__c != null) {
                            amount = vehicleOption.LMS_QLI_VehicleBaseGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }
                    } else if (vme.VME_Invoice_segment__c == VME_Utils.bpriceNOptn) {
                        if (vehicleOption.LMS_QLI_TotalGrossPrice__c != null) {
                            amount = vehicleOption.LMS_QLI_TotalGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }
                    } else if (vme.VME_Invoice_segment__c == VME_Utils.optns) {
                        if (vehicleOption.LMS_QLI_VehicleOptionsGrossPrice__c != null) {
                            amount = vehicleOption.LMS_QLI_VehicleOptionsGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }
                    }
                }
            } else {
                System.debug('vme or vehicleOption is null');
            }
            System.debug('Amount after ======='+amount);
    
            return amount;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<CampaignWrapper> getNewIncompatibleCampaigns(List<Id> campaignIds, List<VME_Campaign_Specifications__c> sortedResult, List<Id> selectedCampaigns) {
        Map<Id, List<Id>> campaignIdToIncompatibleIdsMap = new Map<Id, List<Id>>();
        List<Id> campaignIdSet = new List<Id>();
        for (Id campaignId : campaignIds) {
            campaignIdSet.add(campaignId);
        }
    
        List<VME_Compatibility__c> relatedCampaign = [SELECT  VME_Campaign_Specification__c, VME_Compatibility_Matrix__r.VME_Campaign_Specification__c FROM VME_Compatibility__c where VME_Campaign_Specification__c in :campaignIdSet];
           
          
        for (Id campaignId : campaignIdSet) {
            List<Id> incompatibleCampaignIds = new List<Id>();    
            for (VME_Compatibility__c  rlc : relatedCampaign) {
                if (rlc.VME_Campaign_Specification__c == campaignId) {                    
                        incompatibleCampaignIds.add(rlc.VME_Compatibility_Matrix__r.VME_Campaign_Specification__c);                    
                }
            }
            campaignIdToIncompatibleIdsMap.put(campaignId, incompatibleCampaignIds);
        }
        System.debug('campaignIdToIncompatibleIdsMap=========================================: ' + campaignIdToIncompatibleIdsMap);
    
        List<VME_Compatibility_Matrix__c> compatibilityMatrices = [
            SELECT Id, VME_Campaign_Specification__c,
                (SELECT Id, VME_Campaign_Specification__c FROM VME_Compatibility_Related_Campaigns__r)
            FROM VME_Compatibility_Matrix__c
            WHERE VME_Campaign_Specification__c IN :campaignIdSet
        ];
        System.debug('Compatibility Matrices==============================: ' + compatibilityMatrices);
    
        for (Id campaignId : campaignIdSet) {
  
    
            for (VME_Compatibility_Matrix__c matrix : compatibilityMatrices) {
                if (matrix.VME_Campaign_Specification__c == campaignId) {
                    for (VME_Compatibility__c relCampaign : matrix.VME_Compatibility_Related_Campaigns__r) {
                        campaignIdToIncompatibleIdsMap.get(campaignId).add(relCampaign.VME_Campaign_Specification__c);                        
                    }
                }
            }
            //campaignIdToIncompatibleIdsMap.put(campaignId, incompatibleCampaignIds);
        }

        List<CampaignWrapper> wrappers = new List<CampaignWrapper>();
        for (Id campaignId : campaignIdSet) {
            wrappers.add(new CampaignWrapper(campaignId, campaignIdToIncompatibleIdsMap.get(campaignId), sortedResult,selectedCampaigns));
        }
        System.debug('Campaign Wrappers:==================== ' + wrappers);
    
        return wrappers;
    }
    public static String getApiNamesForSelectedValues(String selectedValue) {
        Schema.DescribeFieldResult fieldResult = VME_Campaign_Specifications__c.VME_Sales_Channel__c.getDescribe();
        List<String> selectedApiNames = new List<String>();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry picklistEntry : picklistValues) {
            if (selectedValue.contains(picklistEntry.getLabel())) {
                return picklistEntry.getValue();
            }
        }
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static LMS_Quote__c getQuote(String quoteId) {
        LMS_Quote__c quote;
        try {
            quote = [
                SELECT Id, 
                    LMS_QUO_ConfigurationVehicle__c, 
                    LMS_QUO_ConfigurationVehicle__r.LMS_CVH_5000Code__c,
                    LMS_QUO_StockVehicle__c, 
                    LMS_QUO_StockVehicle__r.LMS_VHC_DerivativeCode__c,
                    LMS_QUO_StockVehicle__r.LMS_VHC_VehicleVIN__c,LMS_QUO_StockVehicle__r.LMS_VHC_MasterVehicle__r.LMS_VHC_OrderNumber__c,LMS_QUO_ShowroomId__r.LMS_SWR_Retailer__r.LMS_ACC_NSCImporter__r.LMS_ACC_VMECampaign__c,
                    (SELECT Id, Record_Type_Name__c, RecordTypeId, 
                        LMS_QLI_VehicleBaseGrossPrice__c, LMS_QLI_TotalGrossPrice__c, LMS_QLI_VehicleOptionsGrossPrice__c,LMS_QLI_TaxPercent__c,LMS_QLI_BPMSubtraction__c
                        FROM Quote_Line_Items__r
                    )
                FROM LMS_Quote__c
                WHERE Id = :quoteId
            ];
        } catch (QueryException e) {
            System.debug('Error: ' + e.getMessage());
            quote = null;
        }

        return quote;
    }

    private static String getVehicleCode(LMS_Quote__c quote) {
        String code = '';
        if (quote.LMS_QUO_ConfigurationVehicle__c != null) {
            code = quote.LMS_QUO_ConfigurationVehicle__r.LMS_CVH_5000Code__c;
        } else if (quote.LMS_QUO_StockVehicle__c != null) {
            code = quote.LMS_QUO_StockVehicle__r.LMS_VHC_DerivativeCode__c;
        }
        return code;
    }
    /**
     * Saves selected VME campaigns as LMS_QuoteLineItem__c for selected recordId (as quoteId - LMS_Quote__c)
     *
     * @param recordId String
     * @param vmeIds List<String>
     * @return list of VME_Campaign_Specifications__c
     */
    @AuraEnabled
    public static String saveVMEQLI(Id quoteId, String changedRecords, String recType, String dateValue) {
        System.debug('recordId: '+quoteId);
        System.debug('vmeIds: '+changedRecords);
        Map<Id, String> chosenAccessoriesId2Quantity = getChosenAccessoriesId2Quantity(changedRecords);
        List<LMS_QuoteLineItem__c> qliToSave = new List<LMS_QuoteLineItem__c>();
        List<Id> vmeIds = new List<Id>();
        Map<Id, VME_Campaign_Specifications__c> vmeCampaignSpecificationsMap = new Map<Id, VME_Campaign_Specifications__c>([
            SELECT Id, Name, VME_End_Date__c, VME_Calculation_Trigger__c, VME_Document_Type__c,
                VME_Calculation_Basis__c, VME_Invoice_segment__c, VME_Percentage__c, VME_Amount__c
            FROM VME_Campaign_Specifications__c
            WHERE Id IN :chosenAccessoriesId2Quantity.keySet()
        ]);

        List<LMS_QuoteLineItem__c> quotePromotions = getQuotePromotions(quoteId);
        Set<Id> existingVMEIds = new Set<Id>();
        for (LMS_QuoteLineItem__c qli : quotePromotions) {
            existingVMEIds.add(qli.LMS_QLI_VME__c);
        }
        LMS_Quote__c quote = getQuote(quoteId);
        LMS_QuoteLineItem__c vehicleOption = getVehicleOptions(quote.Quote_Line_Items__r);
        List<LMS_QuoteLineItem__c> quoteLineItemsToInsert = new List<LMS_QuoteLineItem__c>();
        for (String vmeId : chosenAccessoriesId2Quantity.keySet()) {
            if (!existingVMEIds.contains(vmeId)) {
                VME_Campaign_Specifications__c vme = vmeCampaignSpecificationsMap.get(vmeId);
                Decimal amount;
                if (vme.VME_Calculation_Basis__c == 'Percentage' && vehicleOption != null) {
                    if (vme.VME_Invoice_segment__c == VME_Utils.bprice) {
                        if(vehicleOption.LMS_QLI_VehicleBaseGrossPrice__c != null){
                            amount = vehicleOption.LMS_QLI_VehicleBaseGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }else{
                            return Label.LMS_UpdateVehicleOptions;
                        }
                    } else if (vme.VME_Invoice_segment__c == VME_Utils.bpriceNOptn) {
                        if(vehicleOption.LMS_QLI_TotalGrossPrice__c != null){
                            amount = vehicleOption.LMS_QLI_TotalGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }else{
                            return Label.LMS_UpdateVehicleTotal;
                        }
                    } else if (vme.VME_Invoice_segment__c == VME_Utils.optns) {
                        if(vehicleOption.LMS_QLI_VehicleOptionsGrossPrice__c != null){
                            amount = vehicleOption.LMS_QLI_VehicleOptionsGrossPrice__c * (vme.VME_Percentage__c / 100);
                        }else{
                            return Label.LMS_UpdateVehicleBase;
                        }
                    }
                quoteLineItemsToInsert.add(
                    new LMS_QuoteLineItem__c(
                        LMS_QLI_Quote__c = quoteId,
                        LMS_QLI_VME__c = vmeId,
                        RecordTypeId = QLI_RT_PROMOTION_ID,
                        LMS_QLI_AccessoryName__c = vme.Name,
                        LMS_QLI_SalesPrice__c = amount,
                        LMS_QLI_Quantity__c = 1
                    )
                );
                }else{
                    amount = vme.VME_Amount__c;
                    quoteLineItemsToInsert.add(
                        new LMS_QuoteLineItem__c(
                            LMS_QLI_Quote__c = quoteId,
                            LMS_QLI_VME__c = vmeId,
                            RecordTypeId = QLI_RT_PROMOTION_ID,
                            LMS_QLI_AccessoryName__c = vme.Name,
                             LMS_QLI_SalesPrice__c = ((amount + vehicleOption.LMS_QLI_BPMSubtraction__c)* (1+ (vehicleOption.LMS_QLI_TaxPercent__c)/100 )) - vehicleOption.LMS_QLI_BPMSubtraction__c,
                            LMS_QLI_Quantity__c = 1
                        )
                    );
                }
            }
        }
        try {
            insert quoteLineItemsToInsert;

        } catch (DmlException ex) {
            return ex.getMessage() + ' ' + ex.getStackTraceString();
        }
        return 'Ok';
    
    }

    /**
     * Gets all VME promotions from LMS_QuoteLineItem__c for selected quoteId
     *
     * @param recordId String
     * @return list of LMS_QuoteLineItem__c
     */
    @AuraEnabled(cacheable=false)
    public static List<LMS_QuoteLineItem__c> getQuotePromotions(String recordId) {
        List<LMS_QuoteLineItem__c> quoteLineItems = [
            SELECT Id, LMS_QLI_VME__c,
                LMS_QLI_VME__r.Name,
                LMS_QLI_VME__r.VME_End_Date__c,
                LMS_QLI_VME__r.VME_Calculation_Trigger__c,
                LMS_QLI_VME__r.VME_Document_Type__c,
                LMS_QLI_VME__r.VME_Calculation_Basis__c,
                LMS_QLI_VME__r.VME_Invoice_segment__c,
                LMS_QLI_VME__r.VME_Percentage__c,
                LMS_QLI_VME__r.VME_Amount__c
            FROM LMS_QuoteLineItem__c
            WHERE LMS_QLI_Quote__c = :recordId AND RecordTypeId = :QLI_RT_PROMOTION_ID AND LMS_QLI_VME__c != NULL
        ];
        return quoteLineItems;
    }


    
    public static List<Id> getVMEIds(String recordId) {
        Set<Id> vmeIds = new Set<Id>();
        List<LMS_QuoteLineItem__c> quoteLineItems = [
            SELECT Id, LMS_QLI_VME__c
                
            FROM LMS_QuoteLineItem__c
            WHERE LMS_QLI_Quote__c = :recordId AND RecordTypeId = :QLI_RT_PROMOTION_ID AND LMS_QLI_VME__c != NULL
        ];
        for (LMS_QuoteLineItem__c  qli:quoteLineItems){
            vmeIds.add(qli.LMS_QLI_VME__c);
        }
        List<Id> listOfvmeIds = new List<Id>(vmeIds);
        return listOfvmeIds;
    }
    /**
     * Searches LMS_QuoteLineItem__c record for Configuration Vehicle or New Vehicle Record Type
     *
     * @param quoteLineItems List<LMS_QuoteLineItem__c>
     * @return quoteLineItem LMS_QuoteLineItem__c
     */
    private static LMS_QuoteLineItem__c getVehicleOptions(List<LMS_QuoteLineItem__c> quoteLineItems) {
        System.debug('quoteLineItems: ' + quoteLineItems);
        Id QLI_RT_CONFIGURATION_VEHICLE_ID = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(LMS_Constants.QLI_CONFIGURATION_VEH_RT).getRecordTypeId();
        Id QLI_RT_NEW_VEHICLE_ID = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(LMS_Constants.QLI_NEW_VEHICLE_RT).getRecordTypeId();
        Id QLI_USED_VEHICLE_RT = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(LMS_Constants.QLI_USED_VEHICLE_RT).getRecordTypeId();
        Id QLI_TRADEIN_VEHICLE_RT = Schema.SObjectType.LMS_QuoteLineItem__c.getRecordTypeInfosByDeveloperName().get(LMS_Constants.QLI_TRADEIN_VEHICLE_RT).getRecordTypeId();

        for (LMS_QuoteLineItem__c qli : quoteLineItems) {
            if (qli.RecordTypeId == QLI_RT_CONFIGURATION_VEHICLE_ID || qli.RecordTypeId == QLI_RT_NEW_VEHICLE_ID || 
                qli.RecordTypeId == QLI_USED_VEHICLE_RT || qli.RecordTypeId == QLI_TRADEIN_VEHICLE_RT) {
                return qli;
            }
        }
        return null;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getDependentMap(sObject objDetail, string contrfieldApiName,string depfieldApiName) {
        Map<String,List<String>> objResults = VME_5KSearchScreen_Dealer.getDependentMap(objDetail, contrfieldApiName,depfieldApiName);
        System.debug('==============='+objResults);
        return objResults;
    }
	
	public class Picklist{
		public String Label{get;set;}
		public String Value{get;set;}
	}

    public static List<VME_Campaign_Specifications__c> getCampaignSMART(set<string> vehicledDrivative, string carLine) 
    {
       
        //List</*5k custom setting to 5k object VME_5kCodes__c */VME_5000_Codes__c> codes = new List</*5k custom setting to 5k object VME_5kCodes__c */VME_5000_Codes__c>();
        List<VME_Campaign_Specifications__c> campSpecList=new List<VME_Campaign_Specifications__c>();               
        Set<Id> csSet=new Set<Id>();
        List<VME_Country__c> countryList=new List<VME_Country__c>();
        List<VME_Campaign_Uploads__c> campUploadList=new List<VME_Campaign_Uploads__c>();
        Id userCountry;
        String market='';
        User usr;
        Account acc;
        
        usr=[SELECT Id, Contact.Name,Contact.AccountId, Contact.Account.Name FROM User where Id=:UserInfo.getUserId()];
        if(usr.Contact.AccountId!=NULL){            
            acc=[select Id,VME_Country_hidden__c from Account where Id=:usr.Contact.AccountId];            
            userCountry=acc.VME_Country_hidden__c;
            countryList=[select VME_Market__c from VME_Country__c where Id=:userCountry];
            if(countryList.size()>0){
                VME_Country__c countryRec=countryList[0];
                market=countryRec.VME_Market__c;
                system.debug('==market=='+market);
            }
        }
        campUploadList=[SELECT Id, VME_Value__c,VME_Type__c,VME_Campaign_Specification__c FROM VME_Campaign_Uploads__c WHERE VME_Value__c in :vehicledDrivative];
        system.debug('-------------campUploadList-->'+campUploadList.size());
        if(campUploadList.size()>0){
            for(VME_Campaign_Uploads__c campSpecId :campUploadList)
            {
                csSet.add(campSpecId.VME_Campaign_Specification__c);  
            }
        }
        campSpecList=[SELECT Id,toLabel(VME_Channel__c),VME_Type__c,toLabel(VME_Sales_Channel__c),VME_Percentage__c,VME_Invoice_segment__c,VME_Campaign__r.VME_WBS__r.VME_WBS_Key__c,VME_Amount__c,Name,VME_Quarter__c,VME_Retailer_Upload_Required__c,toLabel(VME_Document_Evidence__c),VME_Calculation_Basis__c,VME_Start_Date__c,VME_End_Date__c FROM VME_Campaign_Specifications__c WHERE 
                      Id IN :csSet and (VME_Status__c=:VME_Utils.approved OR VME_Status__c=:VME_Utils.active) and (VME_Campaign__r.VME_Country__c=:market) AND RecordType.Name!='Discretionary' AND VME_Document_Type__c!=:VME_Utils.wholsaleInvoice
                      AND VME_Document_Type__c!=:VME_Utils.VME3rdPartyInvoice AND VME_End_Date__c>=TODAY];        
        system.debug('==campSpecList.size()=='+campSpecList.size());
        List<VME_Campaign_Specifications__c> campspecListAudAll=[SELECT Id,toLabel(VME_Channel__c),VME_Type__c,toLabel(VME_Sales_Channel__c),VME_Percentage__c,VME_Invoice_segment__c,VME_Campaign__r.VME_WBS__r.VME_WBS_Key__c,VME_Amount__c,Name,VME_Quarter__c,VME_Retailer_Upload_Required__c,toLabel(VME_Document_Evidence__c),VME_Calculation_Basis__c,VME_Start_Date__c,VME_End_Date__c FROM VME_Campaign_Specifications__c WHERE
                      VME_Audience__c=:VME_Utils.noneSpecific and VME_Campaign__r.VME_Country__c=:market  and (VME_Status__c=:VME_Utils.approved OR VME_Status__c=:VME_Utils.active) and 
                                    RecordType.Name!='Discretionary' ANd VME_Campaign__r.VME_Model_Code__c =:carLine AND (VME_Document_Type__c!=:VME_Utils.wholsaleInvoice) AND VME_Document_Type__c!=:VME_Utils.VME3rdPartyInvoice AND VME_End_Date__c>=TODAY];  
        
        if(campspecListAudAll.size()>0){
            campSpecList.addAll(campspecListAudAll);
        }
        return campSpecList;          
    }
}