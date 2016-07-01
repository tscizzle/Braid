angular.module('authService', [])

    .factory('auth', ['$http', function($http) {

        return {
            register: function(username, password) {
                console.log('about to post');
                return $http.post('/register', {username: username, password: password});
            },
            login: function(username, password) {
                return $http.post('/login', {username: username, password: password});
            },
            logout: function() {
                return $http.get('/logout' + '?' + Math.random()); // the random number avoids the caching of the response
            },
            getLoggedInUser: function() {
                return $http.get('/loggedInUser' + '?' + Math.random()); // the random number avoids the caching of the response
            }
        };

    }]);
