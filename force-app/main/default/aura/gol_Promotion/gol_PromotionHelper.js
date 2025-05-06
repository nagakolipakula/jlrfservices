({
    helperMethod : function() {

    },
    gsFsIntegrationVMEPromotionRefresh : function(component, event, helper) { //Added by MS
		//$A.get('e.force:refreshView').fire();//Added by MS  
    	component.set("v.gsFsIntegrationVisible" , false);//Added by MS 
     	window.setTimeout(//Added by MS 
     	$A.getCallback(function() {//Added by MS 
          component.set("v.gsFsIntegrationVisible" , true);//Added by MS 
     	}), 100);//Added by MS 
    }
    
})