angular.module('logoutDirective', [])

    .directive('braidLogout', ['$location', 'auth', function($location, auth) {
        return {
            restrict: 'A',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications'
            },
            link: function(scope, element) {
                element.on('click', function() {

                    vm = scope;

                    auth.logout()
                        .then(function() {
                            vm.login_object = true;
                            vm.selected_user = undefined;
                            vm.title_notifications = 0;

                            $location.path('/auth');
                        });

                });
            }
        };
    }]);
