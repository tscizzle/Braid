angular.module('userSettingsService', [])

    .factory('UserSettings', ['$http', function($http) {

        return {
            get: function(user_id) {
                return $http.get('/api/user_settings/' + user_id);
            },
            set: function(user_id, field, value) {
                return $http.post('/api/user_settings/' + user_id, {field: field, value: value});
            }
        };

    }]);
