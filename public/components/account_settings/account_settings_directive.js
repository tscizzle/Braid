angular.module('accountSettingsDirective', [])

    .controller('accountSettingsController',
                ['$scope', '$window', '$location', 'Users', 'AccountSettings',
                 'DEFAULT_PROFILE_PIC',
                 function($scope, $window, $location, Users, AccountSettings,
                          DEFAULT_PROFILE_PIC) {

        var vm = this;


        // define CRUD functions used in the template

        vm.updateProfilePic = function() {
            if (vm.selected_user && vm.unsavedProfilePic() && !vm.showProfilePicErrorMsg()) {

                AccountSettings.set(vm.selected_user._id, 'profile_pic_url', vm.candidate_pic_url)
                    .success(function(data) {
                        AccountSettings.refresh(vm.selected_user._id);
                    });

            };
        };

        vm.updateSoundOn = function() {
            if (vm.selected_user) {

                AccountSettings.set(vm.selected_user._id, 'sound_on', vm.account_settings.sound_on)
                    .success(function(data) {
                        AccountSettings.refresh(vm.selected_user._id);
                    });

            };
        };

        vm.deleteUser = function() {
            if (vm.selected_user) {

                Users.delete(vm.selected_user._id)
                    .success(function(data) {
                        vm.selected_user = undefined;

                        $location.path('/auth');
                    });

            };
        };


        // define page control functions used in the template

        vm.showProfilePicExample = function() {
            return !vm.account_settings.profile_pic_url && !vm.candidate_pic_url;
        };

        vm.unsavedProfilePic = function() {
            return vm.candidate_pic_url !== vm.account_settings.profile_pic_url;
        };

        vm.clickProfilePic = function(event) {
            var profile_pic_location = event.target.attributes.src.value;
            if (profile_pic_location !== DEFAULT_PROFILE_PIC) {
                var new_window = $window.open(profile_pic_location, '_blank');
                new_window.opener = null;
            };
        };

        vm.showProfilePicErrorMsg = function() {
            var prof_src = $('.profile-pic-preview').attr('src');
            return vm.candidate_pic_url && prof_src === DEFAULT_PROFILE_PIC;
        };


        // register listeners

        var refreshCandidatePicURL = function() {
            vm.candidate_pic_url = vm.account_settings.profile_pic_url;
        };

        var profile_pic_url_watcher = function() {return vm.account_settings.profile_pic_url;};
        $scope.$watch(profile_pic_url_watcher, refreshCandidatePicURL);


        // initialization

        vm.account_settings = AccountSettings.account_settings;
        vm.candidate_pic_url = vm.account_settings.profile_pic_url;
        vm.default_pic = DEFAULT_PROFILE_PIC;

    }])

    .directive('braidAccountSettings', function() {
        return {
            restrict: 'EA',
            scope: {
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications'
            },
            templateUrl: 'components/account_settings/account_settings.html',
            controller: 'accountSettingsController',
            controllerAs: 'actSetCtrl',
            bindToController: true
        };
    });
