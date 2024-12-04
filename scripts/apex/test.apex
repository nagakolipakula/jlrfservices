List<ServiceAppointment> appointments = [SELECT Id,
                                                Status,
                                                AccountId 
                                        FROM ServiceAppointment 
                                        WHERE AccountId = '0018E00002ChDG7QAN' 
                                        AND Status = 'Canceled'];

for(ServiceAppointment sa : appointments) {
    sa.Status = 'Scheduled';
}

if (!appointments.isEmpty()) {
    update appointments;
    System.debug('Updated ' + appointments.size() + ' ServiceAppointments to Scheduled.');
} else {
    System.debug('No ServiceAppointments found with Status Canceled.');
}