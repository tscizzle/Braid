angular.module('braidController', [])

    .controller('mainController', ['$scope', '$http', 'Messages', 'Strands', 'Convos', 'Users', function($scope, $http, Messages, Strands, Convos, Users) {


        // initialize variables

        $scope.messages = [];
        $scope.strands = [];
        $scope.convos = [];
        $scope.users = [];
        $scope.selected_strand = undefined;
        $scope.selected_convo = undefined;
        $scope.selected_user = undefined;
        $scope.potential_partners = [];
        $scope.strand_map = {};
        $scope.user_map = {};
        $scope.primed_messages = [];
        $scope.responding_to_new_strand = false; // TODO: in a listener on .focus of the message text box, set responding_to_new_strand to true if primed_messages.length > 0
        $scope.forms = {
            newMessageFormData: {},
            newStrandFormData: {},
            newConvoFormData: {},
            newUserFormData: {}
        };

        Users.get()
            .success(function (data) {
                $scope.users = data;
                $scope.selected_user = $scope.users[0];
            });


        // define CRUD functions used in the template

        $scope.createMessage = function() {
            $scope.forms.newMessageFormData.convo_id = $scope.selected_convo._id;
            $scope.forms.newMessageFormData.sender_id = $scope.selected_user._id;
            if ($scope.selected_convo.user_id_0 = $scope.selected_user._id) {
                $scope.forms.newMessageFormData.receiver_id = $scope.selected_convo.user_id_1;
            } else {
                $scope.forms.newMessageFormData.receiver_id = $scope.selected_convo.user_id_0;
            };
            $scope.forms.newMessageFormData.time_sent = new Date();
            $scope.forms.newMessageFormData.strand_id = $scope.selected_strand._id;

            if ($scope.forms.newMessageFormData.text) {

                Messages.create($scope.forms.newMessageFormData)
                    .success(function(data) {
                        $scope.forms.newMessageFormData = {};
                        $scope.messages = data;
                    });

            };
        };

        $scope.deleteMessage = function(message_id, convo_id) {

            Messages.delete(message_id, convo_id)
                .success(function(data) {
                    $scope.messages = data;
                });

            $scope.primed_messages = $scope.primed_messages.filter(function(primed_message) {
                return message_id != primed_message._id;
            });
        };

        $scope.createStrand = function() {
            $scope.forms.newStrandFormData.convo_id = $scope.selected_convo._id;

            Strands.create($scope.forms.newStrandFormData)
                .success(function(data) {
                    $scope.strands = data;
                });

        };

        $scope.createConvo = function() {
            $scope.forms.newConvoFormData.user_id_0 = $scope.selected_user._id;

            if ($scope.forms.newConvoFormData.user_id_1) {

                Convos.create($scope.forms.newConvoFormData)
                    .success(function(data) {
                        $scope.forms.newConvoFormData = {};
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

        $scope.createUser = function() {
            if ($scope.forms.newUserFormData.username) {

                Users.create($scope.forms.newUserFormData)
                    .success(function(data) {
                        $scope.forms.newUserFormData = {};
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


        // define page control functions used in the template and register listeners

        $scope.messageIsPrimed = function(message) {
            console.log('checking if message is primed');
            var primed_message_ids = $scope.primed_messages.map(function(primed_message) {
                return primed_message._id;
            });
            console.log(primed_message_ids, message._id);
            console.log($.inArray(message._id, primed_message_ids) != -1);
            return $.inArray(message._id, primed_message_ids) != -1;
        };

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

        $scope.toggleMessage = function(message) {
            // if no strand is selected
            if (!$scope.selected_strand) {
                console.log('selected_strand aint much');
                // if the clicked message is already in a strand then we should select that strand
                if (message.strand_id) {
                    console.log("why's message got a strand_id");
                    $scope.selected_strand = $scope.strand_map[message.strand_id];
                // if the clicked message does not already have a strand we should add or subtract if from the primed messages
                } else {
                    console.log('no strand_id');
                    var primed_message_ids = $scope.primed_messages.map(function(primed_message) {
                        return primed_message._id;
                    });
                    if ($.inArray(message._id, primed_message_ids) == -1) {
                        console.log('pushing message to primed_messages');
                        $scope.primed_messages.push(message);
                        console.log($scope.primed_messages);
                    } else {
                        console.log('removing from primed messages');
                        $scope.primed_messages = $scope.primed_messages.filter(function(primed_message) {
                            return message._id != primed_message._id;
                        });
                        console.log($scope.primed_messages);
                    };
                };
            // if a strand is selected
            } else {
                // deselect the strand
                $scope.selected_strand = undefined;
            };
        };

        var clearPrimedMessages = function() {
            $scope.primed_messages = [];
        };

        var deselectStrand = function() {
            $scope.selected_strand = undefined;
        };

        var refreshStrands = function() {
            if ($scope.selected_convo) {

                Strands.get($scope.selected_convo._id)
                    .success(function(data) {
                        $scope.strands = data;
                    });

            } else {
                $scope.strands = [];
            };
        };

        $scope.selectConvo = function(convo) {
            $scope.selected_convo = convo;
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

        $scope.selectUser = function(user) {
            $scope.selected_user = user;
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

        var refreshStrandMap = function() {
            var temp_strand_map = {};
            _.each($scope.strands, function(strand) {
                temp_strand_map[strand._id] = strand;
            });
            $scope.strand_map = temp_strand_map;
        };

        var refreshUserMap = function() {
            var temp_user_map = {};
            _.each($scope.users, function(user) {
                temp_user_map[user._id] = user;
            });
            $scope.user_map = temp_user_map;
        };

        $scope.$watch('selected_convo', refreshMessages);
        $scope.$watchGroup(['selected_convo', 'selected_user'], clearPrimedMessages);
        $scope.$watch('selected_convo', refreshStrands);
        $scope.$watchGroup(['selected_convo', 'selected_user'], deselectStrand);
        $scope.$watchGroup(['users', 'selected_user'], refreshConvos);
        $scope.$watchGroup(['convos', 'users', 'selected_convo'], refreshPotentialPartners);
        $scope.$watch('strands', refreshStrandMap);
        $scope.$watch('users', refreshUserMap);

    }]);
