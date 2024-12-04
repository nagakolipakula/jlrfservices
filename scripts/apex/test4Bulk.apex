try {
    List<WorkOrder> workOrders = new List<WorkOrder>();
    List<ServiceAppointment> serviceAppointments = new List<ServiceAppointment>();
    List<WorkOrderLineItem> workOrderLineItems = new List<WorkOrderLineItem>();

    DateTime startTime = DateTime.newInstance(2025, 10, 1, 9, 0, 0);
    DateTime endTime = startTime.addDays(2);

    for (Integer i = 0; i < 5; i++) {
        // Create a new Work Order
        WorkOrder newWorkOrder = new WorkOrder();
        newWorkOrder.Status = 'New';
        newWorkOrder.AccountId = '0018E00002ChDG7QAN'; // Account ID
        newWorkOrder.CurrencyIsoCode = 'GBP';
        workOrders.add(newWorkOrder);
    }

    // Insert Work Orders in bulk
    insert workOrders;
    System.debug('5 Work Orders created with IDs: ' + workOrders);

    for (WorkOrder workOrder : workOrders) {
        ServiceAppointment newServiceAppointment = new ServiceAppointment();
        newServiceAppointment.ParentRecordId = workOrder.Id;
        newServiceAppointment.ActualStartTime = startTime;
        newServiceAppointment.ActualEndTime = endTime;
        newServiceAppointment.ArrivalWindowStartTime = startTime;
        newServiceAppointment.ArrivalWindowEndTime = endTime;
        newServiceAppointment.SchedStartTime = startTime;
        newServiceAppointment.SchedEndTime = endTime;
        newServiceAppointment.Status = 'Scheduled';
        newServiceAppointment.ServiceTerritoryId = '0Hh8E000000ANG2SAO';
        newServiceAppointment.OSB_GS2_Vehicle__c = '0vL8E0000008OU1UAM';
        serviceAppointments.add(newServiceAppointment);

        WorkOrderLineItem newWorkOrderLineItem = new WorkOrderLineItem();
        newWorkOrderLineItem.Status = 'New';
        newWorkOrderLineItem.WorkOrderId = workOrder.Id;
        newWorkOrderLineItem.Subject = 'Paint';
        workOrderLineItems.add(newWorkOrderLineItem);
    }

    insert serviceAppointments;
    insert workOrderLineItems;

    System.debug('5 Service Appointments created with IDs: ' + serviceAppointments);
    System.debug('5 Work Order Line Items created with IDs: ' + workOrderLineItems);

} catch (Exception e) {
    System.debug('Error occurred: ' + e.getMessage());
}
