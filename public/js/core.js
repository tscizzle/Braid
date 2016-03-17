var Braid = angular.module('Braid', [

    // custom dependencies
    'braidController',
    'enterSubmitDirective',
    'navbarDirective',
    'messagesDirective',
    'convosDirective',
    'usersDirective',
    'braidFilters',
    'socketService',
    'messageService',
    'strandService',
    'convoService',
    'userService',

    // 3rd-party dependencies
    'btford.socket-io',
    'luegg.directives'

]);
