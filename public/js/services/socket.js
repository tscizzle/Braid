angular.module('socketService', [])

    .factory('socket', ['socketFactory', function(socketFactory) {

        return socketFactory();

    }]);
