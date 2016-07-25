angular.module('helperService', [])

    .factory('helpers', [function() {

        return {
            partnerIdFromSelectedConvo: function(vm) {
                if (vm.selected_convo && vm.selected_user) {
                    if (vm.selected_convo.user_id_0 == vm.selected_user._id) {
                        return vm.selected_convo.user_id_1;
                    } else if (vm.selected_convo.user_id_1 == vm.selected_user._id) {
                        return vm.selected_convo.user_id_0;
                    };
                };
            }
        };

    }]);
