angular.module('navbarDirective', [])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser',
                page_title: '=pageTitle',
                sound_on: '=soundOn'
            },
            templateUrl: 'views/navbar.html'
        };
    });
