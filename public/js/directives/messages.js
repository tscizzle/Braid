angular.module('messagesDirective', [])

    .controller('messageController', ['$scope', 'focus', 'socket', 'Messages', 'Strands', function($scope, focus, socket, Messages, Strands) {

        var vm = this;
        window.VM = vm;


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
                    vm.newStrandFormData.color_number = vm.thisColorNumber();
                    vm.newStrandFormData.time_created = new Date();
                    vm.newStrandFormData.user_id_0 = vm.selected_convo.user_id_0;
                    vm.newStrandFormData.user_id_1 = vm.selected_convo.user_id_1;

                    // create a new strand
                    Strands.create(vm.newStrandFormData)
                        .success(function(strand_data) {
                            vm.strands = strand_data.strands;
                            vm.newMessageFormData.strand_id = strand_data.new_strand._id;
                            var message_ids = vm.primed_messages.map(function(message) {return message._id});


                            // update the primed messages to be part of the new strand
                            Messages.assignMessagesToStrand(message_ids, strand_data.new_strand._id, vm.selected_convo._id, vm.num_messages)
                                .success(function(assign_messages_data) {
                                    vm.messages = assign_messages_data;

                                    // create the new message as part of the new strand
                                    vm.num_messages += 1;
                                    Messages.create(vm.newMessageFormData, vm.num_messages)
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

                    Messages.create(vm.newMessageFormData, vm.num_messages)
                        .success(function(create_messages_data) {
                            vm.newMessageFormData = {};
                            vm.messages = create_messages_data;
                        });

                };
            };
        };

        vm.deleteMessage = function(message_id) {
            if (vm.selected_convo) {

                Messages.delete(message_id, vm.selected_convo._id, vm.num_messages)
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
        };


        // define page control functions used in the template

        vm.clickMessageListWrapper = function() {
            if (vm.selected_strand) {
                vm.selected_strand = undefined;
            }
        }

        vm.showLoadMoreMessagesLink = function() {
            if (vm.messages) {
                var visible_messages = _.filter(vm.messages, function(message) {
                    return !vm.messageIsHidden(message);
                });
                return visible_messages.length >= vm.num_messages;
            };
        };

        vm.increaseNumMessages = function() {
            vm.num_messages += DEFAULT_NUM_MESSAGES;
        };

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
                return vm.sendable_text_focus && vm.primed_messages.length > 0 && !vm.messageIsPrimed(message);
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

        vm.hoverMessage = function(message) {
            vm.hovered_message = message._id;
            vm.hovered_strand = message.strand_id;
        };

        vm.unhoverMessage = function(message) {
            vm.hovered_message = undefined;
            vm.hovered_strand = undefined;
        };

        vm.isOneOfHoveredMessages = function(message) {
            if (!message.strand_id) {
                return vm.hovered_message === message._id;
            } else {
                return vm.hovered_strand === message.strand_id;
            };
        };

        vm.thisColorNumber = function() {
            /* looks at the previous strand's color_number, and returns the next one in the queue. */

            var thisColorIndex;

            // make a list of all the ID's of strands that have an associated message
            var messageStrands = _.map(vm.messages, function(message) {
                if (message.strand_id) {
                    return vm.strand_map[message.strand_id];
                };
            });
            // remove any undefined's (from messages with no strand)
            messageStrands = _.filter(messageStrands, function(strand) {
                return strand;
            });

            // if there are no existing strands, start at the beginning of the order
            if (messageStrands.length === 0) {
                thisColorIndex = 0;
            } else {
                // order strands by time
                var strandsByTime = _.sortBy(messageStrands, function(strand) {
                    return Date.parse(strand.time_created);
                });
                // take the next color in the order after the most recent existing strand's color
                var prevStrandColorNumber = strandsByTime[strandsByTime.length - 1].color_number;
                thisColorIndex = (prevStrandColorNumber + 1) % STRAND_COLOR_ORDER.length;
            };

            return thisColorIndex;
        };

        vm.paintStrand = function(message) {
            var message_color_number;
            var faded = false;
            // if a message is in a strand, color it that strand's color
            if (message.strand_id && vm.strand_map[message.strand_id]) {
                message_color_number = vm.strand_map[message.strand_id].color_number;
            // if a message is primed, color it the faded version of what color it would be next
            } else if (vm.messageIsPrimed(message)) {
                message_color_number = vm.thisColorNumber();
                faded = true;
            // if a message is neither in a strand nor primed, make it no color
            } else {
                message_color_number = -1;
            };
            var color = STRAND_COLOR_ORDER[message_color_number];
            // return either the color or the faded version of the color
            return faded ? COLOR_TO_FADED_MAP[color] : color;
        };

        vm.messageUserClass = function(message) {
            if (vm.selected_user) {
                return message.sender_id === vm.selected_user._id ? 'sender-message' : 'receiver-message';
            };
        };

        vm.paintTextarea = function() {
            var textarea_color;
            // if a strand is selected, color it the faded version of that color
            if (vm.selected_strand) {
                textarea_color = COLOR_TO_FADED_MAP[STRAND_COLOR_ORDER[vm.selected_strand.color_number]];
            // if there are any primed messages, color it the faded version of what color it would be next
            } else if (vm.primed_messages.length > 0) {
                textarea_color = COLOR_TO_FADED_MAP[STRAND_COLOR_ORDER[vm.thisColorNumber()]];
            // if there is no selected strand and no primed messages, make it no color
            } else {
                textarea_color = '#F0F0F0';
            };
            return textarea_color;
        };

        vm.userIsTyping = function() {
            var recipient = partnerIdFromSelectedConvo();
            socket.emit('this_user_typing', recipient);
        };


        vm.otherUserIsTyping = function() {
            var now = new Date();
            var just_typed = now - vm.last_typed < 1000;
            var just_sent;
            if (vm.messages && vm.messages.length > 0) {
                just_sent = now - vm.messages[vm.messages.length - 1].time_sent < 100;
            } else {
                just_sent = false;
            };
            return just_typed && !just_sent;
        };

        // ng-hide shows "Read" based on this function
        vm.showReadTag = function() {
            // visible_messages: the visible messages sent to the other user
            if (vm.messages){
                var visible_messages = _.filter(vm.messages, function(message) {
                        return !vm.messageIsHidden(message)&&message.sender_id==vm.selected_user._id ;
                    });
            }
            if (visible_messages.length > 0){
                var most_recent_message = visible_messages[visible_messages.length-1];
                if(most_recent_message && most_recent_message.time_read){
                    vm.most_recent_time_read = most_recent_message.time_read;
                    return false;
                } else {
                    return true; 
                };
            };
        };
        

        vm.markMessagesAsRead = function() {
            vm.sendable_text_focus = true;
            // message_data should just be messages that are in the view
            // visible_messages are the messages_to_mark
            if (vm.messages){
                var visible_messages = _.filter(vm.messages, function(message) {
                        return !vm.messageIsHidden(message)&&message.receiver_id==vm.selected_user._id ;
                    });
                if (visible_messages){
                    unread_visible_message_ids = visible_messages.map(function(message) {
                        if (!message.time_read) {
                        return message._id
                        };
                    });
                    current_time = new Date();

                    Messages.markAsRead(vm.selected_convo._id, unread_visible_message_ids, current_time)
                        .success(function(data) {
                            vm.messages = data;
                    });
                };
            };
        };

        vm.userIsTyping = function() {
            var recipient = partnerIdFromSelectedConvo();
            socket.emit('this_user_typing', recipient);
        }

        // register listeners

        var focusSendableTextarea = function() {
            focus.focus('sendable-textarea');
        };

        var refreshMessages = function() {
            if (vm.selected_convo) {

                Messages.get(vm.selected_convo._id, vm.num_messages)
                    .success(function(data) {
                        vm.messages = data;
                    });

            } else {
                vm.messages = [];
            };

            refreshStrands();
        };

        var clearPrimedMessages = function() {
            vm.primed_messages = [];
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

        var resetNumMessages = function() {
            vm.num_messages = DEFAULT_NUM_MESSAGES;
        };

        var resetPageTitle = function() {
            if (vm.selected_user) {
                var received_messages = _.filter(vm.messages, function(message) {
                    return message.receiver_id === vm.selected_user._id;
                });
                var num_received_messages = received_messages.length;
                var unread_received_messages = _.filter(received_messages, function(message) {
                    return !message.time_read;
                });
                var num_unread_received_messages = unread_received_messages.length;

                if (num_unread_received_messages > 0) {
                    var num_notifications = num_unread_received_messages;
                    if (num_received_messages === num_unread_received_messages) {
                        num_notifications += '+';
                    };

                    vm.page_title = 'Braid (' + num_notifications + ')';
                };
            };
        };

        var num_messages_watcher = function(scope) {return vm.num_messages;};
        var messages_watcher = function(scope) {return vm.messages;};
        var strands_watcher = function(scope) {return vm.strands;};
        var selected_strand_watcher = function(scope) {return vm.selected_strand;};
        var selected_convo_watcher = function(scope) {return vm.selected_convo;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watch(selected_strand_watcher, focusSendableTextarea);
        $scope.$watchGroup([num_messages_watcher, selected_strand_watcher, selected_convo_watcher], refreshMessages);
        $scope.$watchGroup([selected_strand_watcher, selected_convo_watcher, selected_user_watcher], clearPrimedMessages);
        $scope.$watchGroup([selected_convo_watcher, selected_user_watcher], deselectStrand);
        $scope.$watch(strands_watcher, refreshStrandMap);
        $scope.$watch(selected_convo_watcher, resetNumMessages);
        $scope.$watch(messages_watcher, resetPageTitle);


        // register socket listeners

        socket.on('messages:receive_update', function(data) {
            if (vm.selected_convo) {
                if (data.convo_id == vm.selected_convo._id) {
                    refreshMessages();
                };
            };

            if (vm.sound_on && data.play_message_sound) {
                var ooooh = new Audio('audio/ooooh.wav');
                ooooh.play();
            };
        });

        socket.on('other_user_typing', function(recipient) {
            if (vm.selected_user) {
                if (vm.selected_user._id === recipient) {
                    vm.last_typed = new Date();
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


        // constants

        var STRAND_COLOR_ORDER = [
            '#EFBFFF',
            '#9EEFD0',
            '#FFFAAD',
            '#FFC99E',
            '#F2969F'
        ];
        STRAND_COLOR_ORDER[-1] = '#DDD';

        var COLOR_TO_FADED_MAP = {
            '#EFBFFF': '#F2DBFF',
            '#9EEFD0': '#CEF2ED',
            '#FFFAAD': '#EDFFD9',
            '#FFC99E': '#FFE6C2',
            '#F2969F': '#F2C2AE'
        };

        var DEFAULT_NUM_MESSAGES = 30;


        // initialization

        vm.messages = [];
        vm.strands = [];
        vm.num_messages = DEFAULT_NUM_MESSAGES;
        vm.selected_strand = undefined;
        vm.strand_map = {};
        vm.primed_messages = [];
        vm.hovered_message = undefined;
        vm.hovered_strand = undefined;
        vm.sendable_text_focus = false;
        vm.last_typed = undefined;
        vm.newMessageFormData = {};
        vm.newStrandFormData = {};
        vm.most_recent_time_read = undefined;

    }])

    .directive('braidMessages', function() {
        return {
            restrict: 'E',
            scope: {
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                friend_user_map: '=friendUserMap',
                page_title: '=pageTitle',
                sound_on: '=soundOn'
            },
            templateUrl: 'views/messages.html',
            controller: 'messageController',
            controllerAs: 'messageCtrl',
            bindToController: true
        };
    });
