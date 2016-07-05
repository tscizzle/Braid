angular.module('messagesDirective', [])

    .controller('messageController',
                ['$scope', '$window', 'focus', 'socket', 'helpers', 'Messages',
                 'Strands', 'DEFAULT_NUM_MESSAGES',
                 function($scope, $window, focus, socket, helpers, Messages,
                          Strands, DEFAULT_NUM_MESSAGES) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createMessage = function() {
            if (vm.send_button_disabled) {
                return;
            };

            disableSendButton();

            if (vm.newMessageFormData.text && vm.selected_convo && vm.selected_user) {

                vm.newMessageFormData.convo_id = vm.selected_convo._id;
                vm.newMessageFormData.sender_id = vm.selected_user._id;
                vm.newMessageFormData.receiver_id = helpers.partnerIdFromSelectedConvo(vm);
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
                                    vm.selected_strand = strand_data.new_strand;

                                    // create the new message as part of the new strand
                                    vm.num_messages += 1;
                                    Messages.create(vm.newMessageFormData, vm.num_messages)
                                        .success(function(create_messages_data) {
                                            vm.newMessageFormData = {};
                                            vm.messages = create_messages_data;
                                            clearPrimedMessages();
                                        })
                                        .finally(reenableSendButton);

                                })
                                .catch(reenableSendButton);

                        })
                        .catch(reenableSendButton);

                // if not responding to a new strand
                } else {
                    if (vm.selected_strand) {
                        vm.newMessageFormData.strand_id = vm.selected_strand._id;
                    };

                    Messages.create(vm.newMessageFormData, vm.num_messages)
                        .success(function(create_messages_data) {
                            vm.newMessageFormData = {};
                            vm.messages = create_messages_data;
                        })
                        .finally(reenableSendButton);

                };
            } else {
                reenableSendButton();
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
                                deselectStrand();
                            };
                        };
                    });

            };
        };


        // define page control functions used in the template

        vm.clickMessageListWrapper = function() {
            if (vm.selected_strand) {
                deselectStrand();
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

        vm.toggleMessage = function(message, event) {
            // mark the message as addressed
            if (vm.selected_convo) {

                Messages.markMessageAsAddressed(message._id, vm.selected_convo._id, vm.num_messages)
                    .success(function(data) {
                        vm.messages = data;
                    });

            };

            // if the click was on a link, don't continue
            var target = event.target || event.srcElement;
            if (target.tagName === 'A') {
                return;
            };
            // if there is highlighted text, don't continue
            if ($window.getSelection().toString()) {
                return;
            };

            // if the alt button was held down during the click
            if (event.altKey) {
                // if the clicked message is in a strand
                if (message.strand_id) {
                    // if there are any primed messages, add them to the clicked strand
                    if (vm.primed_messages.length > 0) {
                        var primed_message_ids = vm.primed_messages.map(function(primed_message) {
                            return primed_message._id;
                        });

                        Messages.assignMessagesToStrand(primed_message_ids, message.strand_id, vm.selected_convo._id, vm.num_messages)
                            .success(function(assign_messages_data) {
                                vm.messages = assign_messages_data;
                                clearPrimedMessages();
                            });

                    // if there are no primed messages, remove the clicked message from its strand
                    } else {

                        Messages.unassignMessageFromStrand(message._id, vm.selected_convo._id, vm.num_messages)
                            .success(function(unassign_messages_data) {
                                vm.messages = unassign_messages_data;
                            });

                    };
                };
                // don't continue
                return;
            };

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
                deselectStrand();
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

        vm.userIsTyping = function() {
            if (vm.selected_user) {
                var typist = vm.selected_user._id;
                var recipient = helpers.partnerIdFromSelectedConvo(vm);
                var color_number = vm.selected_strand ? vm.selected_strand.color_number : -1;
                var typing_color = STRAND_COLOR_ORDER[color_number];
                var typing_data = {
                    typist: typist,
                    recipient: recipient,
                    typing_color: typing_color
                };
                socket.emit('this_user_typing', typing_data);
            };
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

        vm.focusTextarea = function() {
            vm.sendable_text_focus = true;
            markMessagesAsRead();
        };


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

        var resetMostRecentTimeRead = function() {
            var visible_messages = _.filter(vm.messages, function(message) {
                return !vm.messageIsHidden(message) && message.sender_id === vm.selected_user._id;
            });
            if (visible_messages.length > 0) {
                vm.last_time_read = visible_messages[visible_messages.length - 1].time_read;
            } else {
                vm.last_time_read = undefined;
            };
        };

        var markStrandMessagesAsAddressed = function() {
            if (vm.selected_strand && vm.selected_convo) {
                var timestamp = new Date();

                Messages.markStrandMessagesAsAddressed(vm.selected_strand._id, vm.selected_convo._id, timestamp, vm.num_messages)
                    .success(function(data) {
                        vm.messages = data;
                    });

            };
        };

        var num_messages_watcher = function() {return vm.num_messages;};
        var messages_watcher = function() {return vm.messages;};
        var strands_watcher = function() {return vm.strands;};
        var selected_strand_watcher = function() {return vm.selected_strand;};
        var selected_convo_watcher = function() {return vm.selected_convo;};
        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watch(selected_strand_watcher, focusSendableTextarea);
        $scope.$watchGroup([num_messages_watcher, selected_strand_watcher, selected_convo_watcher], refreshMessages);
        $scope.$watchGroup([selected_strand_watcher, selected_convo_watcher, selected_user_watcher], clearPrimedMessages);
        $scope.$watchGroup([selected_convo_watcher, selected_user_watcher], deselectStrand);
        $scope.$watch(strands_watcher, refreshStrandMap);
        $scope.$watch(selected_convo_watcher, resetNumMessages);
        $scope.$watchGroup([messages_watcher, selected_strand_watcher], resetMostRecentTimeRead);
        $scope.$watch(selected_strand_watcher, markStrandMessagesAsAddressed);


        // register socket listeners

        socket.on('messages:receive_update', function(data) {
            // refresh messages
            if (vm.selected_convo && data.convo_id == vm.selected_convo._id) {
                refreshMessages();
            };

            // if the new message is on the current strand, mark the current strand as addressed
            if (vm.selected_strand && vm.selected_user && vm.selected_strand._id === data.strand_id && vm.selected_user._id === data.receiver_id) {
                markStrandMessagesAsAddressed();
            };
        });


        // helpers

        var disableSendButton = function() {
            vm.send_button_disabled = true;
        };

        var reenableSendButton = function() {
            vm.send_button_disabled = false;
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

        var markMessagesAsRead = function() {
            var current_time = new Date();
            var unread_visible_messages = _.filter(vm.messages, function(message) {
                return !vm.messageIsHidden(message) && message.receiver_id === vm.selected_user._id && !message.time_read;
            });
            var unread_visible_message_ids = unread_visible_messages.map(function(message) {
                return message._id
            });

            if (unread_visible_message_ids.length > 0) {

                Messages.markMessagesAsRead(unread_visible_message_ids, vm.selected_convo._id, current_time, vm.num_messages)
                    .success(function(data) {
                        vm.messages = data;
                    });

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


        // initialization

        vm.primed_messages = [];
        vm.hovered_message = undefined;
        vm.hovered_strand = undefined;
        vm.send_button_disabled = false;
        vm.sendable_text_focus = false;
        vm.last_time_read = undefined;
        vm.newMessageFormData = {};
        vm.newStrandFormData = {};

    }])

    .directive('braidMessages', function() {
        return {
            restrict: 'E',
            scope: {
                messages: '=',
                strands: '=',
                num_messages: '=numMessages',
                selected_strand: '=selectedStrand',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                strand_map: '=strandMap',
                friend_user_map: '=friendUserMap',
            },
            templateUrl: 'views/messages.html',
            controller: 'messageController',
            controllerAs: 'messageCtrl',
            bindToController: true
        };
    });
