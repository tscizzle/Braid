angular.module('profileDirective', [])

    // .controller('profileController', ['UserSettings', function(UserSettings) {
    .controller('profileController', [function() {

        var vm = this;

        // initialization

        // TODO: use UserSettings to initialize all the settings
        vm.sound_on = false;

    }]);
