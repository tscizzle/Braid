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

    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }])

    // constants
    .constant('DEFAULT_NUM_MESSAGES', 50);
