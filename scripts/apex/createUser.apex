User newUser = new User();
newUser.LastName = 'Joe';
newUser.Email = 'johndoe@example.com';
newUser.Username = 'johndoe@example.com';
newUser.Alias = 'jdoe';
newUser.CommunityNickname = 'johndoe';
newUser.TimeZoneSidKey = 'America/Los_Angeles';
newUser.LocaleSidKey = 'en_US';
newUser.EmailEncodingKey = 'UTF-8';
newUser.ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1].Id;
newUser.LanguageLocaleKey = 'en_US';

try {
    insert newUser;
    System.debug('User created successfully: ' + newUser.Id);
} catch (DmlException e) {
    System.debug('Error creating user: ' + e.getMessage());
}