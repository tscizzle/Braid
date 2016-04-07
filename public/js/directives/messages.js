angular.module('messagesDirective', [])

    .controller('messageController', ['$scope', 'socket', 'Messages', 'Strands', function($scope, socket, Messages, Strands) {

        var vm = this;
        window.SCOPE = vm;


        // define CRUD functions used in the template

        vm.createMessage = function() {
            if (vm.newMessageFormData.text && vm.selected_convo && vm.selected_user) {
                vm.newMessageFormData.convo_id = vm.selected_convo._id;
                vm.newMessageFormData.sender_id = vm.selected_user._id;
                vm.newMessageFormData.receiver_id = partnerIdFromSelectedConvo();
                vm.newMessageFormData.time_sent = new Date();

                // if responding to a new strand
                if (vm.primed_messages.length > 0) {
                    vm.newStrandFormData.convo_id = vm.selected_convo._id;
                    //call a function here that decides the color
                    vm.newStrandFormData.color = vm.thisColor();
                    //use the time of the PREVIOUS strand to figure out what color this one should be
                    vm.newStrandFormData.time_created = new Date();
                    // create a new strand
                    Strands.create(vm.newStrandFormData)
                        .success(function(strand_data) {
                            vm.strands = strand_data.strands;
                            vm.newMessageFormData.strand_id = strand_data.new_strand._id;
                            var message_ids = vm.primed_messages.map(function(message) {return message._id});
                            var user_ids = [vm.newMessageFormData.sender_id, vm.newMessageFormData.receiver_id];

                            //This is ONLY if creating a new strand. Seems like this is the only spot where strand color should be set.


                            //create an array of times created
                            var strand_times_created = vm.strands.map(function(strand) {
                                return vm.strands.time_created;
                            });
                            // Strands.paintStrand(vm.strand_id, vm.time_created, vm.color)
                            //     .success(function(assign_messages_data) {
                            //     vm.messages = assign_messages_data;
                            // });


                            // update the primed messages to be part of the new strand
                            Messages.assignMessagesToStrand(message_ids, strand_data.new_strand._id, vm.selected_convo._id, user_ids)
                                .success(function(assign_messages_data) {
                                    vm.messages = assign_messages_data;

                                    // create the new message as part of the new strand
                                    Messages.create(vm.newMessageFormData)
                                        .success(function(create_messages_data) {
                                            vm.newMessageFormData = {};
                                            vm.messages = create_messages_data;
                                            vm.selected_strand = strand_data.new_strand;
                                            vm.primed_messages = [];
                                        });

                                });

                        });

                // if not responding to a new strand
                } else {
                    if (vm.selected_strand) {
                        vm.newMessageFormData.strand_id = vm.selected_strand._id;
                    };

                    Messages.create(vm.newMessageFormData)
                        .success(function(data) {
                            vm.newMessageFormData = {};
                            vm.messages = data.messages;
                        });

                };
            };
        };

        vm.deleteMessage = function(message_id, convo_id) {

            Messages.delete(message_id, convo_id)
                .success(function(data) {
                    vm.messages = data;
                    vm.primed_messages = vm.primed_messages.filter(function(primed_message) {
                        return message_id !== primed_message._id;
                    });

                    if (vm.selected_strand) {
                        var strand_messages = vm.messages.filter(function(message) {
                            return message.strand_id === vm.selected_strand._id;
                        });

                        if (strand_messages.length === 0) {
                            vm.selected_strand = undefined;
                        };
                    };
                });

        };


        // define page control functions used in the template

        vm.messageIsPrimed = function(message) {
            var primed_message_ids = vm.primed_messages.map(function(primed_message) {
                return primed_message._id;
            });
            return $.inArray(message._id, primed_message_ids) !== -1;
        };

        vm.messageIsHidden = function(message) {
            if (vm.selected_strand) {
                return message.strand_id !== vm.selected_strand._id;
            } else {
                return vm.message_text_focus && vm.primed_messages.length > 0 && !vm.messageIsPrimed(message);
            };
        };

        vm.toggleMessage = function(message) {
            // if no strand is selected
            if (!vm.selected_strand) {
                // if the clicked message is already in a strand then we should select that strand
                if (message.strand_id) {
                    vm.selected_strand = vm.strand_map[message.strand_id];
                // if the clicked message does not already have a strand we should add or subtract it from the primed messages
                } else {
                    var primed_message_ids = vm.primed_messages.map(function(primed_message) {
                        return primed_message._id;
                    });
                    if ($.inArray(message._id, primed_message_ids) === -1) {
                        vm.primed_messages.push(message);
                    } else {
                        vm.primed_messages = vm.primed_messages.filter(function(primed_message) {
                            return message._id !== primed_message._id;
                        });
                    };
                };
            // if a strand is selected
            } else {
                // deselect the strand
                vm.selected_strand = undefined;
            };
        };

        vm.removeMessageFromStrand = function(message_id) {
            var user_ids = [vm.selected_convo.user_id_0, vm.selected_convo.user_id_1];

            Messages.unassignMessageFromStrand(message_id, vm.selected_convo._id, user_ids)
                .success(function(assign_message_data) {
                    vm.messages = assign_message_data;

                    if (vm.selected_strand) {
                        var strand_messages = vm.messages.filter(function(message) {
                            return message.strand_id === vm.selected_strand._id;
                        });

                        if (strand_messages.length === 0) {
                            vm.selected_strand = undefined;
                        };
                    };
            });
        };

        vm.addMessagesToStrand = function(strand_message) {
            var primed_message_ids = vm.primed_messages.map(function(primed_message) {
                return primed_message._id;
            });
            var user_ids = [vm.selected_convo.user_id_0, vm.selected_convo.user_id_1];

            Messages.assignMessagesToStrand(primed_message_ids, strand_message.strand_id, vm.selected_convo._id, user_ids)
                .success(function(assign_messages_data) {
                    vm.messages = assign_messages_data;
                    vm.primed_messages = [];
            });
        };

        vm.removeButtonIsHidden = function(message) {
            return !message.strand_id;
        };

        vm.addButtonIsHidden = function(message) {
            if (vm.primed_messages.length != 0) {
                return !message.strand_id;
            } else {
                return true;
            };
        };

        vm.thisColor = function() {
            //should look at the previous strands color, and assign the next one in the queue.
            strandColors = ["red", "orange", "yellow", "green", "blue", "purple"];

            //make a list of all the strands that have an associated message, don't include repeats
            var allStrand_ids = new Array();
            _.each(vm.messages, function(message) {
                if (!_.contains(allStrand_ids, message.strand_id)){
                    allStrand_ids.push(message.strand_id)
                }
            })

            if(allStrand_ids.length < 2){
                thisColorIndex = 0;
            } else {
            //remove the last entry, which is undefined, because the newly made strand doesn't have a strand ID yet)
            allStrand_ids.splice(allStrand_ids.length-1,1)

            //add the strands with those strand ids to an array
            var allStrands = new Array();
            _.each(allStrand_ids, function(all_strand_id){
                _.each(vm.strands, function(strand){

                    if (strand._id == all_strand_id) {
                        strand_to_add = strand
                        allStrands.push(strand_to_add)
                    }
                })
            })

            //order strands by time
            var strandsByTime = _.sortBy(allStrands, _.map(allStrands, function(strand){
                Date.parse(strand.time_created)
            }));

            //loop through assign the color based on the previous color.
            
            prevStrand = strandsByTime[strandsByTime.length - 1];
            prevStrandColor = prevStrand.color;
            _.each(strandColors, function(color){
                if (color == prevStrandColor){
                    prevColorIndex = strandColors.indexOf(color)
                    if (prevColorIndex == strandColors.length-1){
                        thisColorIndex = 0
                    }
                        else {
                            thisColorIndex = prevColorIndex + 1;
                        }
                }
            })
            }
            return strandColors[thisColorIndex]
        }


        //this should only be called once: right when a strand is created
        vm.paintStrand = function(message) { 
                if(message.strand_id){
                    _.each(vm.strands, function(strand) {
                        if (strand._id == message.strand_id) {
                            message_color = strand.color
                        }            
                    });
                }
                console.log(message_color)
        return message_color
        }


        // register listeners

        var refreshMessages = function() {
            if (vm.selected_convo) {

                Messages.get(vm.selected_convo._id)
                    .success(function(data) {
                        vm.messages = data;
                    });

            } else {
                vm.messages = [];
            };
        };

        var clearPrimedMessages = function() {
            vm.primed_messages = [];
        };

        var refreshStrands = function() {
            if (vm.selected_convo) {

                Strands.get(vm.selected_convo._id)
                    .success(function(data) {
                        vm.strands = data;
                    });

            } else {
                vm.strands = [];
            };
        };

        var deselectStrand = function() {
            vm.selected_strand = undefined;
        };

        var refreshStrandMap = function() {
            var temp_strand_map = {};
            _.each(vm.strands, function(strand) {
                temp_strand_map[strand._id] = strand;
            });
            vm.strand_map = temp_strand_map;
        };

        var strands_watcher = function(scope) {return vm.strands;};
        var selected_strand_watcher = function(scope) {return vm.strands;};
        var selected_convo_watcher = function(scope) {return vm.selected_convo;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watchGroup([selected_strand_watcher, selected_convo_watcher], refreshMessages);
        $scope.$watchGroup([selected_strand_watcher, selected_convo_watcher, selected_user_watcher], clearPrimedMessages);
        $scope.$watch(selected_convo_watcher, refreshStrands);
        $scope.$watchGroup([selected_convo_watcher, selected_user_watcher], deselectStrand);
        $scope.$watch(strands_watcher, refreshStrandMap);


        // register socket listeners

        socket.on('messages:receive_update', function(convo_id) {
            if (vm.selected_convo) {
                if (convo_id == vm.selected_convo._id) {
                    refreshMessages();
                    refreshStrands();
                };
            };
        });


        // helpers

        var partnerIdFromSelectedConvo = function() {
            if (vm.selected_convo && vm.selected_user) {
                if (vm.selected_convo.user_id_0 == vm.selected_user._id) {
                    return vm.selected_convo.user_id_1;
                } else if (vm.selected_convo.user_id_1 == vm.selected_user._id) {
                    return vm.selected_convo.user_id_0;
                };
            };
        };


        // initialization

        vm.messages = [];
        vm.strands = [];
        vm.selected_strand = undefined;
        vm.strand_map = {};
        vm.primed_messages = [];
        vm.message_text_focus = false;
        vm.newMessageFormData = {};
        vm.newStrandFormData = {};

    }])

    .directive('braidMessages', function() {
        return {
            restrict: 'E',
            scope: {
                selected_strand: '=selectedStrand',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                user_map: '=userMap'
            },
            templateUrl: 'views/messages.html',
            controller: 'messageController',
            controllerAs: 'messageCtrl',
            bindToController: true
        };
    });
