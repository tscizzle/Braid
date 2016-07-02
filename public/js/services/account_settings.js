angular.module('accountSettingsService', [])

    .factory('AccountSettings', ['$http', function($http) {

        return {
            get: function(user_id) {
                return $http.get('/api/account_settings/' + user_id);
            },
            set: function(user_id, field, value) {
                return $http.post('/api/account_settings/' + user_id, {field: field, value: value});
            }
        };

    }]);
