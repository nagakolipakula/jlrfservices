// To Reset Password

String userId = '005KM000000lE19YAE';
String newPassword = 'Rainbow1234@';
System.setPassword(userId, newPassword);



// To Freeze

String userId = '005KM000000lE19YAE';

User userToDeactivate = [SELECT Id, IsActive FROM User WHERE Id = :userId LIMIT 1];

if (userToDeactivate.IsActive) {
    userToDeactivate.IsActive = false;
    update userToDeactivate;
    System.debug('User has been deactivated successfully.');
} else {
    System.debug('User is already inactive.');
}