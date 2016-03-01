angular.module('convoController', [])

    .controller('mainController', function($scope, $http, Convos, Messages, Users) {

        $scope.convos = [];
        $scope.messages = [];
        $scope.users = [];
        $scope.selected_convo = undefined;
        $scope.selected_user = undefined;
        $scope.newConvoFormData = {};
        $scope.newMessageFormData = {};

        Users.get()
            .success(function (data) {
                $scope.users = data;

                if ($scope.users.length > 0) {
                    $scope.selected_user = $scope.users[0];

                    Convos.get($scope.selected_user._id)
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

                };
            });

        $scope.selectConvo = function(convo) {
            $scope.selected_convo = convo;

            Messages.get($scope.selected_convo._id)
                .success(function(data) {
                    $scope.messages = data;
                });

        };

        $scope.createConvo = function() {
            $scope.newConvoFormData.user_id_0 = $scope.selected_user._id;

            if ($scope.newConvoFormData.user_id_1) {

                Convos.create($scope.newConvoFormData)
                    .success(function(data) {
                        $scope.newConvoFormData = {};
                        $scope.convos = data;

                        if ($scope.convos.length == 1) {
                            $scope.selected_convo = $scope.convos[0];

                            Messages.get($scope.selected_convo._id)
                                .success(function(data) {
                                    $scope.messages = data;
                                });

                        };
                    });

            };
        };

        $scope.deleteConvo = function(convo_id, user_id) {

            Convos.delete(convo_id)
                .success(function(data) {
                    $scope.convos = data;

                    if (convo_id == $scope.selected_convo._id && $scope.convos.length > 0) {
                        $scope.selected_convo = $scope.convos[0];

                        Messages.get($scope.selected_convo._id)
                            .success(function(data) {
                                $scope.messages = data;
                            });

                    };
                });

        };

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

        $scope.selectUser = function(user) {
            $scope.selected_user = user;

            Convos.get($scope.selected_user._id)
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

                        Convos.get($scope.selected_user._id)
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
                        };

                });

        };

    });
