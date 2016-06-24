var Braid = angular.module('Braid', [

    // standard dependencies
    'ngRoute',
    'ngSanitize',
    'ngAnimate',

    // custom dependencies
    'braidController',
    'enterSubmitDirective',
    'navbarDirective',
    'registerDirective',
    'loginDirective',
    'logoutDirective',
    'typingIndicatorDirective',
    'friendshipsDirective',
    'messagesDirective',
    'queueDirective',
    'braidFilters',
    'focusService',
    'socketService',
    'authService',
    'messageService',
    'strandService',
    'convoService',
    'userService',
    'friendshipService',
    'helperService',

    // 3rd-party dependencies
    'btford.socket-io',
    'luegg.directives'

])

    // routes
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/chat.html'
            })
            .when('/auth', {
                templateUrl: 'views/auth.html'
            });
    }])

    // route to auth page when no used is logged in
    .run(['$rootScope', '$location', 'auth', function($rootScope, $location, auth) {
        auth.getLoggedInUser()
            .success(function(data) {
                if (!data.user) {
                    $location.path('/auth');
                };
            });
    }])

    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }])

    // constants
    .constant('DEFAULT_NUM_MESSAGES', 50);
