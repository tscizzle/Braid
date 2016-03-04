angular.module('braidController', [])

    .controller('mainController', ['$scope', '$http', 'Convos', 'Messages', 'Users', function($scope, $http, Convos, Messages, Users) {


        // initialize variables

        $scope.messages = [];
        $scope.convos = [];
        $scope.users = [];
        $scope.selected_convo = undefined;
        $scope.selected_user = undefined;
        $scope.potential_partners = [];
        $scope.username_map = {};
        $scope.newMessageFormData = {};
        $scope.newConvoFormData = {};
        $scope.newUserFormData = {};

        Users.get()
            .success(function (data) {
                $scope.users = data;
                $scope.selected_user = $scope.users[0];
            });


        // define functions used in the template

        $scope.createMessage = function() {
            $scope.newMessageFormData.convo_id = $scope.selected_convo._id;
            $scope.newMessageFormData.sender_id = $scope.selected_user._id;
            if ($scope.selected_convo.user_id_0 = $scope.selected_user._id) {
                $scope.newMessageFormData.receiver_id = $scope.selected_convo.user_id_1;
            } else {
                $scope.newMessageFormData.receiver_id = $scope.selected_convo.user_id_0;
            };
            $scope.newMessageFormData.time_sent = new Date();

            if ($scope.newMessageFormData.text) {

                Messages.create($scope.newMessageFormData)
                    .success(function(data) {
                        $scope.newMessageFormData = {};
                        $scope.messages = data;
                    });

            };
        };

        $scope.deleteMessage = function(message_id, convo_id) {

            Messages.delete(message_id, convo_id)
                .success(function(data) {
                    $scope.messages = data;
                });

        };

        $scope.selectConvo = function(convo) {
            $scope.selected_convo = convo;
        };

        $scope.createConvo = function() {
            $scope.newConvoFormData.user_id_0 = $scope.selected_user._id;

            if ($scope.newConvoFormData.user_id_1) {

                Convos.create($scope.newConvoFormData)
                    .success(function(data) {
                        $scope.newConvoFormData = {};
                        $scope.convos = data;

                        if (!$scope.selected_convo) {
                            $scope.selected_convo = $scope.convos[0];
                        };
                    });

            };
        };

        $scope.deleteConvo = function(convo_id, user_id) {

            Convos.delete(convo_id, user_id)
                .success(function(data) {
                    $scope.convos = data;

                    if (convo_id == $scope.selected_convo._id) {
                        $scope.selected_convo = $scope.convos[0];
                    };
                });

        };

        $scope.selectUser = function(user) {
            $scope.selected_user = user;
        }

        $scope.createUser = function() {
            if ($scope.newUserFormData.username) {

                Users.create($scope.newUserFormData)
                    .success(function(data) {
                        $scope.newUserFormData = {};
                        $scope.users = data;

                        if (!$scope.selected_user) {
                            $scope.selected_user = $scope.users[0];
                        };
                    });

            };
        };

        $scope.deleteUser = function(user_id) {

            Users.delete(user_id)
                .success(function(data) {
                    $scope.users = data;

                    if (user_id == $scope.selected_user._id) {
                        $scope.selected_user = $scope.users[0];
                    };
                });

        };


        // register listeners

        var refreshMessages = function() {
            if ($scope.selected_convo) {

                Messages.get($scope.selected_convo._id)
                    .success(function(data) {
                        $scope.messages = data;
                    });

            } else {
                $scope.messages = [];
            };
        };

        var refreshConvos = function() {
            if ($scope.selected_user) {

                Convos.get($scope.selected_user._id)
                    .success(function(data) {
                        $scope.convos = data;
                        $scope.selected_convo = $scope.convos[0];
                    });

            } else {
                $scope.convos = [];
                $scope.selected_convo = undefined;
            };
        };

        var refreshPotentialPartners = function() {
            var already_convod = [];
            _.each($scope.convos, function(convo) {
                already_convod.push(convo.user_id_0, convo.user_id_1);
            });
            $scope.potential_partners = $scope.users.filter(function(user) {
                return (($.inArray(user._id, already_convod) == -1) && (user._id != $scope.selected_user._id));
            });
        };

        var refreshUserIdToUsernameMap = function() {
            var temp_user_map = {};
            _.each($scope.users, function(user) {
                temp_user_map[user._id] = user.username;
            });
            $scope.username_map = temp_user_map;
        };

        $scope.$watch('selected_convo', refreshMessages);
        $scope.$watch('selected_user', refreshConvos);
        $scope.$watchGroup(['convos', 'users', 'selected_convo'], refreshPotentialPartners);
        $scope.$watch('users', refreshUserIdToUsernameMap);

    }]);
