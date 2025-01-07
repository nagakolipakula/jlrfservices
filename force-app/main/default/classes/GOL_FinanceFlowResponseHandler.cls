public with sharing class GOL_FinanceFlowResponseHandler {
    @InvocableMethod(label='Process JSON')
    public static List<String> processJson(List<String> jsonInputs) {
        List<String> results = new List<String>();

        for (String jsonInput : jsonInputs) {
            if (String.isEmpty(jsonInput)) {
                throw new AuraHandledException('JSON input cannot be null or empty.');
            }

            try {
                List<Object> jsonData = (List<Object>) JSON.deserializeUntyped(jsonInput);
                results.add(JSON.serialize(jsonData));
            } catch (Exception e) {
                throw new AuraHandledException('Invalid JSON format: ' + e.getMessage());
            }
        }
        return results;
    }
}