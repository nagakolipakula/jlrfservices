try {
    // Create a new Work Order
    WorkOrder newWorkOrder = new WorkOrder();
    newWorkOrder.Status = 'New';
    newWorkOrder.AccountId = '0018E00002ChDG7QAN'; // Account ID
    newWorkOrder.CurrencyIsoCode = 'GBP';
    insert newWorkOrder;
    System.debug('New Work Order created with ID: ' + newWorkOrder.Id);

    DateTime startTime = DateTime.newInstance(2025, 10, 1, 9, 0, 0);
    DateTime endTime = startTime.addDays(2);

    // Create a new Service Appointment and associate it with the new Work Order
    ServiceAppointment newServiceAppointment = new ServiceAppointment();
    newServiceAppointment.ParentRecordId = newWorkOrder.Id;
    newServiceAppointment.ActualStartTime = startTime;
    newServiceAppointment.ActualEndTime = endTime;
    newServiceAppointment.ArrivalWindowStartTime = startTime;
    newServiceAppointment.ArrivalWindowEndTime = endTime;
    newServiceAppointment.SchedStartTime = startTime;
    newServiceAppointment.SchedEndTime = endTime;
    newServiceAppointment.Status = 'Scheduled';
    newServiceAppointment.ServiceTerritoryId = '0Hh8E000000ANG2SAO';
    newServiceAppointment.OSB_GS2_Vehicle__c = '0vL8E0000008OU1UAM';
    insert newServiceAppointment;
    System.debug('New Service Appointment created with ID: ' + newServiceAppointment.Id);

    // Create a new Work Order Line Item and associate it with the new Work Order
    WorkOrderLineItem newWorkOrderLineItem = new WorkOrderLineItem();
    newWorkOrderLineItem.Status = 'New';
    newWorkOrderLineItem.WorkOrderId = newWorkOrder.Id;
    newWorkOrderLineItem.Subject = 'Paint';
    insert newWorkOrderLineItem;
    System.debug('New Work Order Line Item created with ID: ' + newWorkOrderLineItem.Id);

} catch (Exception e) {
    System.debug('Error occurred: ' + e.getMessage());
}
