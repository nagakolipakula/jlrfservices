({
    onInit : function(component, event, helper) {
    console.log('Quote id '+ component.get("v.quoteId"));
    },

    showSucessMessage : function(component, event, helper) {
    console.log('Quote id '+event.getParam('value'));
    if(event.getParam('value') == 'SUCCESS'){
    component.set("v.isVisible" , true);
    window.setTimeout(
    $A.getCallback(function() {
    component.set("v.isVisible", false);
    }), 5000
    );
    }
    },
})