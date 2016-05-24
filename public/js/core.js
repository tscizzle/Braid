var Braid = angular.module('Braid', [

    // standard dependencies
    'ngRoute',

    // custom dependencies
    'braidController',
    'enterSubmitDirective',
    'navbarDirective',
    'registerDirective',
    'loginDirective',
    'logoutDirective',
    'friendshipsDirective',
    'messagesDirective',
    'braidFilters',
    'focusService',
    'socketService',
    'authService',
    'messageService',
    'strandService',
    'convoService',
    'userService',
    'friendshipService',

    // 3rd-party dependencies
    'btford.socket-io',
    'luegg.directives'

])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
