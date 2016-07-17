angular.module('accountSettingsService', [])

    .factory('AccountSettings', ['$http', function($http) {

        var account_settings = {};

        return {
            // core
            account_settings: account_settings,
            set: function(user_id, field, value) {
                return $http.post('/api/account_settings/' + user_id, {field: field, value: value});
            },
            refresh: function(user_id) {
                $http.get('/api/account_settings/' + user_id)
                    .success(function(data) {
                        angular.copy(data, account_settings);
                    });
            },
            // extras
            friendProfilePic: function(friend_id) {
                return $http.get('/api/account_settings/friendProfilePic/' + friend_id);
            }
        };

    }]);
