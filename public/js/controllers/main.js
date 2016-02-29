angular.module('convoController', [])

    .controller('mainController', function($scope, $http, Convos, Messages, Users) {

        $scope.convos = [];
        $scope.messages = [];
        $scope.users = [];
        $scope.selected_convo = undefined;
        $scope.selected_user = undefined;
        $scope.newConvoFormData = {};
        $scope.newMessageFormData = {};

        Convos.get()
            .success(function(data) {
                $scope.convos = data;

                if ($scope.convos.length > 0) {
                    $scope.selected_convo = $scope.convos[0];

                    Messages.get($scope.selected_convo._id)
                        .success(function(data) {
                            $scope.messages = data;
                        });
                };
            });

        Users.get()
            .success(function (data) {
                $scope.users = data;

                if ($scope.users.length > 0) {
                    $scope.selected_user = $scope.users[0];
                };
            });

        $scope.selectConvo = function(convo) {
            $scope.selected_convo = convo;

            Messages.get($scope.selected_convo._id)
                .success(function(data) {
                    $scope.messages = data;
                });
        }

        $scope.createConvo = function() {

            // TODO: make the creation of a convo include the users

            $scope.newConvoFormData.user_id_0 = $scope.selected_user._id;

            // TODO: have a way of selecting the other user

            if ($scope.newConvoFormData.name) {
                Convos.create($scope.newConvoFormData)
                    .success(function(data) {
                        $scope.newConvoFormData = {};
                        $scope.convos = data;
                    });
            };
        };

        $scope.deleteConvo = function(id) {
            Convos.delete(id)
                .success(function(data) {
                    $scope.convos = data;

                    if (id == $scope.selected_convo._id && $scope.convos.length > 0) {
                        $scope.selected_convo = $scope.convos[0];
                    }
                });
        };

        $scope.createMessage = function() {

            // TODO: make the creation of a message include the right sender and receiver

            $scope.newMessageFormData.convo_id = $scope.selected_convo._id;
            $scope.newMessageFormData.sender_id = $scope.selected_convo.user_id_0;
            $scope.newMessageFormData.receiver_id = $scope.selected_convo.user_id_1;
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

        $scope.selectUser = function(user) {
            $scope.selected_user = user;

            // TODO: populate $scope.convos with the selected user's convos

            // TODO: populate $scope.messages with the new convo's messages
        }

        $scope.createUser = function() {
            if ($scope.newUserFormData.username) {
                Users.create($scope.newUserFormData)
                    .success(function(data) {
                        $scope.newUserFormData = {};
                        $scope.users = data;
                    });
            };
        };

        $scope.deleteUser = function(id) {
            Users.delete(id)
                .success(function(data) {
                    $scope.users = data;

                    if (id == $scope.selected_user._id && $scope.users.length > 0) {
                        $scope.selected_user = $scope.users[0];
                    }
                });
        };

    });
