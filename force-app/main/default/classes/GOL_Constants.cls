/************************************************************
 * @description  : This class is used to declare constant for Glodstar Retailer
 * @author       : NTT DATA UK&I
 * Modifications History 
 * Ver   Date         Author          Modification
 * 1.0   10-01-2024   NTT DATA UK&I   Initial Version
*************************************************************/

public with sharing class GOL_Constants {
    
    public static final String ACC_HybridProspect ='GOL_ACC_Hybrid_Prospect_for_Retailer__c';
    public static final String ACC_NSCImporter = 'LMS_ACC_NSCImporter__c'; 
    public static final String ACC_CreateWithoutLead = 'LMS_ACC_CreateWithoutLead__c'; 
    public static final String LEAD_ACCOUNT = 'AccountId'; 
    public static final String OPP_ENQUIRYTYPE_REQUEST_RETAILERCONTACT = 'Request for Retailer Contact';
    public static final String OPP_LEADSOURCE_WALKIN = 'Walk-in';
    public static final String ACC_EMPLOYEE_TOBEASSIGNED = 'LMS_ACC_EmployeeToBeAssigned__c';
    public static final Integer ACC_IntegerTest = 100;
    public static final String ACC_ORIGIN = 'LMS_ACC_AccountOrigin__c';                                     //GOL-1034 fix
    public static final String QUO_RT_NAME_LOCKED = 'Locked';                                              //GOL-1070 fix
    public static final String ACC_SVCRMID = 'LMS_ACC_SvCrmId__c';   // GOL-1375
    public static final String QLI_TRADEIN_VEHICLE_RT = 'Trade-In Vehicle';                  // GOL-1333
    public static final String MULE_API_NAME = 'Mule API - External Id';      
    public static final String ACC_SLOVAKIA_NSC_REF ='SK'; //GOL-1970
    public static final String ACC_ANDORRA_NSC_REF ='AD'; //GOL-1970  

    public static final String LMS_FIN_CENTRAL_FINANCING_RT = 'LMS_FIN_CentralFinancing';
    public static final String LMS_FIN_FINANCE_PROVIDER = 'Jaguar Land Rover Financial Services';
    public static final String ERPT_FII_FIXEDCOST_RT = 'ERPT_FII_FixedCost';


}