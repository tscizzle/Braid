angular.module('braidChat', [])

    .controller('chatController', ['$scope', 'chat', function($scope, chat) {

        // initialization

        chat.showing = true;

        $scope.$on('$destroy', function() {
            chat.showing = false;
        });

    }]);
