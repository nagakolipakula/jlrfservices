WorkOrder newWorkOrder = new WorkOrder();
newWorkOrder.Status = 'New';
newWorkOrder.AccountId = '0018E00002ChDG7QAN';
newWorkOrder.CurrencyIsoCode = 'GBP';
insert newWorkOrder;
System.debug('New Work Order created with ID: ' + newWorkOrder.WorkOrderNumber);

ServiceAppointment newServiceAppointment = new ServiceAppointment();
newServiceAppointment.ParentRecordId = '0WOVe000002epVhOAI';
newServiceAppointment.ActualEndTime = DateTime.newInstanceGMT(2028, 10, 20, 12, 0, 0);
newServiceAppointment.ActualStartTime = DateTime.newInstanceGMT(2028, 9, 20, 12, 0, 0);
newServiceAppointment.SchedEndTime = DateTime.newInstanceGMT(2028, 10, 20, 12, 0, 0);
newServiceAppointment.SchedStartTime = DateTime.newInstanceGMT(2028, 9, 20, 12, 0, 0);
newServiceAppointment.Status = 'Scheduled';
insert newServiceAppointment;
System.debug('New Service Appointment created with ID: ' + newServiceAppointment.Id);


WorkOrderLineItem newWorkOrderLineItem = new WorkOrderLineItem();
newWorkOrderLineItem.Status = 'New';
newWorkOrderLineItem.WorkOrderId = '0WOVe000002epVhOAI';
newWorkOrderLineItem.Subject = 'Paint';
insert newWorkOrderLineItem;
System.debug('New newWorkOrderLineItem created with ID: ' + newWorkOrderLineItem.Id);