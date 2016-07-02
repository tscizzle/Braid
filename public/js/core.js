var Braid = angular.module('Braid', [

    // standard dependencies
    'ngRoute',
    'ngSanitize',
    'ngAnimate',

    // custom dependencies
    'braidMain',
    'braidChat',
    'enterSubmitDirective',
    'navbarDirective',
    'registerDirective',
    'loginDirective',
    'logoutDirective',
    'accountSettingsDirective',
    'typingIndicatorDirective',
    'friendshipsDirective',
    'messagesDirective',
    'queueDirective',
    'braidFilters',
    'focusService',
    'socketService',
    'helperService',
    'authService',
    'chatService',
    'messageService',
    'strandService',
    'convoService',
    'userService',
    'friendshipService',
    'accountSettingsService',

    // 3rd-party dependencies
    'btford.socket-io',
    'luegg.directives',
    'flow'

])

    // routes
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/chat.html'
            })
            .when('/auth', {
                templateUrl: 'views/auth.html'
            })
            .when('/profile', {
                templateUrl: 'views/profile.html'
            });
    }])

    // route to auth page when no user is logged in
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
