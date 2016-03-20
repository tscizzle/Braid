angular.module('authService', [])

    .factory('Auth', ['$http', function($http) {

        var userIsLoggedIn;

        return {
            login: function(username, password) {
                return $http.post('/login', {username: username, password: password})
                    .success(function(data, status) {
                        if (status === 200 && data.message) {
                            userIsLoggedIn = true;
                        } else {
                            userIsLoggedIn = false;
                        };
                        return data;
                    })
                    .error(function(data) {
                        userIsLoggedIn = false;
                    });
            },
            logout: function() {
                return $http.get('/logout')
                    .success(function() {
                        userIsLoggedIn = false;
                    })
                    .error(function() {
                        userIsLoggedIn = false;
                    });
            },
            register: function(username, password) {
                return $http.post('/register', {username: username, password: password});
            }
        };

}]);
