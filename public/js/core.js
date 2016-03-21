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
    'messagesDirective',
    'convosDirective',
    'usersDirective',
    'braidFilters',
    'socketService',
    'authService',
    'messageService',
    'strandService',
    'convoService',
    'userService',

    // 3rd-party dependencies
    'btford.socket-io',
    'luegg.directives'

])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
