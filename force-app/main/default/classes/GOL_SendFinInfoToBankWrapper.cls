public with sharing class GOL_SendFinInfoToBankWrapper {

    public String typeOfUse;
    public String channel;
    public String personType;
    public String quoteId;

    public static GOL_SendFinInfoToBankWrapper parse(String json) {
        return (GOL_SendFinInfoToBankWrapper) System.JSON.deserialize(json, GOL_SendFinInfoToBankWrapper.class);
    }
}