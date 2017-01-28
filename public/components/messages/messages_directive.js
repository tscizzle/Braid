angular.module('messagesDirective', [])

    .controller('messageController',
                ['$scope', '$window', 'focus', 'socket', 'helpers', 'Messages',
                 'Strands', 'Friendships', 'AccountSettings',
                 'DEFAULT_NUM_MESSAGES', 'DEFAULT_PROFILE_PIC',
                 function($scope, $window, focus, socket, helpers, Messages,
                          Strands, Friendships, AccountSettings,
                          DEFAULT_NUM_MESSAGES, DEFAULT_PROFILE_PIC) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createMessage = function() {
            if (vm.send_button_disabled) {
                return;
            };

            disableSendButton();

            markMessagesAsRead();

            if (vm.newMessageFormData.text && vm.selected_convo && vm.selected_user) {

                var strand_that_had_draft = (vm.selected_strand || {})._id;

                vm.newMessageFormData.convo_id = vm.selected_convo._id;
                vm.newMessageFormData.sender_id = vm.selected_user._id;
                vm.newMessageFormData.receiver_id = helpers.partnerIdFromSelectedConvo(vm);
                vm.newMessageFormData.time_sent = new Date();

                // if no strand is selected
                if (!vm.selected_strand) {
                    vm.newStrandFormData.convo_id = vm.selected_convo._id;
                    vm.newStrandFormData.color_number = vm.thisColorNumber();
                    vm.newStrandFormData.time_created = new Date();
                    vm.newStrandFormData.user_id_0 = vm.selected_convo.user_id_0;
                    vm.newStrandFormData.user_id_1 = vm.selected_convo.user_id_1;

                    var primed_message_ids = _.map(vm.primed_messages, function(primed_message) {return primed_message._id});
                    Messages.createOnNewStrand(vm.newMessageFormData, vm.newStrandFormData, primed_message_ids, vm.num_messages)
                        .success(function(data) {
                            vm.newMessageFormData = {};
                            vm.newStrandFormData = {};
                            clearPrimedMessages();
                            vm.selected_strand = data.new_strand;
                            delete vm.drafts[strand_that_had_draft];
                            vm.strands = data.strands;
                            vm.messages = data.messages;
                        })
                        .finally(afterMessageCreation);

                // if a strand is selected
                } else {
                    vm.newMessageFormData.strand_id = vm.selected_strand._id;

                    Messages.create(vm.newMessageFormData, vm.num_messages)
                        .success(function(create_messages_data) {
                            vm.newMessageFormData = {};
                            var selected_strand_id = (vm.selected_strand || {})._id;
                            delete vm.drafts[selected_strand_id];
                            vm.messages = create_messages_data;
                        })
                        .finally(afterMessageCreation);

                };
            } else {
                afterMessageCreation();
            };
        };

        vm.deleteMessage = function(message_id) {
            if (vm.selected_convo) {

                Messages.delete(message_id, vm.selected_convo._id, vm.num_messages)
                    .success(function(data) {
                        vm.messages = data;
                        vm.primed_messages = _.filter(vm.primed_messages, function(primed_message) {
                            return message_id !== primed_message._id;
                        });

                        if (vm.selected_strand) {
                            var strand_messages = _.filter(vm.messages, function(message) {
                                return message.strand_id === vm.selected_strand._id;
                            });

                            if (strand_messages.length === 0) {
                                deselectStrand();
                            };
                        };
                    });

            };
        };

        vm.deleteSelectedFriendship = function() {
            if (vm.selected_user && vm.selected_convo) {
                var friendship = friendshipFromConvo(vm.selected_convo);
                if (friendship) {

                    Friendships.delete(friendship._id, vm.selected_user._id)
                        .success(function(data) {
                            vm.friendships = data;
                            vm.selected_convo = undefined;
                        });

                }
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
            var primed_message_ids = _.map(vm.primed_messages, function(primed_message) {
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
                        var primed_message_ids = _.map(vm.primed_messages, function(primed_message) {
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
                // if the clicked message does not already have a strand, add it and any primed messages to a new strand
                } else {
                    vm.newStrandFormData.convo_id = vm.selected_convo._id;
                    vm.newStrandFormData.color_number = vm.thisColorNumber();
                    vm.newStrandFormData.time_created = new Date();
                    vm.newStrandFormData.user_id_0 = vm.selected_convo.user_id_0;
                    vm.newStrandFormData.user_id_1 = vm.selected_convo.user_id_1;

                    Strands.create(vm.newStrandFormData)
                        .success(function(strand_data) {
                            vm.newStrandFormData = {};
                            vm.strands = strand_data.strands;
                            // the new strand messages will be the primed messages plus the clicked message
                            var new_strand_message_ids = _.map(vm.primed_messages, function(primed_message) {
                                return primed_message._id;
                            });
                            new_strand_message_ids.push(message._id);

                            Messages.assignMessagesToStrand(new_strand_message_ids, strand_data.new_strand._id, vm.selected_convo._id, vm.num_messages)
                                .success(function(assign_messages_data) {
                                    vm.messages = assign_messages_data;
                                    clearPrimedMessages();
                                });

                        });
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
                    var primed_message_ids = _.map(vm.primed_messages, function(primed_message) {
                        return primed_message._id;
                    });
                    if ($.inArray(message._id, primed_message_ids) === -1) {
                        vm.primed_messages.push(message);
                    } else {
                        vm.primed_messages = _.filter(vm.primed_messages, function(primed_message) {
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

        vm.isHoveredMessage = function(message) {
            return vm.hovered_message === message._id;
        }

        vm.thisColorNumber = function() {
            /* returns the least recently used color_number */
            var messageColorNumbers = _.map(vm.messages, function(message) {
                if (message.strand_id && vm.strand_map[message.strand_id]) {
                    return vm.strand_map[message.strand_id].color_number;
                };
            });
            var thisColorIndex = _.min(_.range(STRAND_COLOR_ORDER.length), function(color_number) {
                return _.lastIndexOf(messageColorNumbers, color_number);
            });
            return thisColorIndex;
        };

        vm.userIsTyping = function() {
            if (vm.selected_user) {
                var typist = vm.selected_user._id;
                var recipient = helpers.partnerIdFromSelectedConvo(vm);
                var color_number = vm.selected_strand ? vm.selected_strand.color_number : vm.thisColorNumber();
                var typing_color = STRAND_COLOR_ORDER[color_number];
                var typing_data = {
                    typist: typist,
                    recipient: recipient,
                    typing_color: typing_color
                };
                socket.emit('this_user_typing', typing_data);
            };

            var selected_strand_id = (vm.selected_strand || {})._id;
            vm.drafts[selected_strand_id] = vm.newMessageFormData.text;
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
            // if no strand is selected, color it the faded version of what color it would be next
            } else {
                textarea_color = COLOR_TO_FADED_MAP[STRAND_COLOR_ORDER[vm.thisColorNumber()]];
            };
            return textarea_color;
        };

        vm.handleFocusTextarea = function() {
            vm.sendable_text_focus = true;
            markMessagesAsRead();
        };


        // register listeners

        var refreshPartnerProfilePic = function() {
            var partnerId = helpers.partnerIdFromSelectedConvo(vm);
            if (partnerId) {

                AccountSettings.friendProfilePic(partnerId)
                    .success(function(friend_account_settings) {
                        vm.partner_profile_pic = friend_account_settings.profile_pic_url;
                    });

            };
        };

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

        var setTextFromDrafts = function() {
            var selected_strand_id = (vm.selected_strand || {})._id;
            var strandDraft = vm.drafts[selected_strand_id];
            vm.newMessageFormData.text = !vm.selected_strand || strandDraft ? strandDraft : '';
        };

        var num_messages_watcher = function() {return vm.num_messages;};
        var messages_watcher = function() {return vm.messages;};
        var strands_watcher = function() {return vm.strands;};
        var selected_strand_watcher = function() {return vm.selected_strand;};
        var selected_convo_watcher = function() {return vm.selected_convo;};
        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watchGroup([selected_convo_watcher, selected_user_watcher], refreshPartnerProfilePic);
        $scope.$watch(selected_strand_watcher, focusSendableTextarea);
        $scope.$watchGroup([num_messages_watcher, selected_strand_watcher, selected_convo_watcher], refreshMessages);
        $scope.$watchGroup([selected_strand_watcher, selected_convo_watcher, selected_user_watcher], clearPrimedMessages);
        $scope.$watchGroup([selected_convo_watcher, selected_user_watcher], deselectStrand);
        $scope.$watch(strands_watcher, refreshStrandMap);
        $scope.$watch(selected_convo_watcher, resetNumMessages);
        $scope.$watchGroup([messages_watcher, selected_strand_watcher], resetMostRecentTimeRead);
        $scope.$watch(selected_strand_watcher, markStrandMessagesAsAddressed);
        $scope.$watch(selected_strand_watcher, setTextFromDrafts);


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

        socket.on('reconnect', function() {
            refreshMessages();
        });


        // helpers

        var disableSendButton = function() {
            vm.send_button_disabled = true;
        };

        var afterMessageCreation = function() {
            vm.send_button_disabled = false;
            focusSendableTextarea();
        };

        var friendshipFromConvo = function(convo) {
            if (convo) {
                var matching_friendship = _.find(vm.friendships, function(friendship) {
                    var friendship_pair = [friendship.requester_id, friendship.target_id].sort();
                    var convo_pair = [convo.user_id_0, convo.user_id_1].sort();
                    return _.isEqual(friendship_pair, convo_pair);
                });
                return matching_friendship;
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

        var markMessagesAsRead = function() {
            var current_time = new Date();
            var unread_visible_messages = _.filter(vm.messages, function(message) {
                return !vm.messageIsHidden(message) && message.receiver_id === vm.selected_user._id && !message.time_read;
            });
            var unread_visible_message_ids = _.map(unread_visible_messages, '_id');
            if (unread_visible_message_ids.length > 0) {

                Messages.markMessagesAsRead(unread_visible_message_ids,
                                            vm.selected_user._id,
                                            vm.selected_convo._id,
                                            current_time,
                                            vm.num_messages)
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

        vm.drafts = {};
        vm.primed_messages = [];
        vm.hovered_message = undefined;
        vm.hovered_strand = undefined;
        vm.send_button_disabled = false;
        vm.sendable_text_focus = false;
        vm.last_time_read = undefined;
        vm.partner_profile_pic = undefined;
        vm.default_pic = DEFAULT_PROFILE_PIC;
        vm.newMessageFormData = {};
        vm.newStrandFormData = {};

    }])

    .directive('braidMessages', function() {
        return {
            restrict: 'E',
            scope: {
                messages: '=',
                strands: '=',
                friendships: "=",
                num_messages: '=numMessages',
                selected_strand: '=selectedStrand',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                strand_map: '=strandMap',
                friend_user_map: '=friendUserMap',
            },
            templateUrl: 'components/messages/messages.html',
            controller: 'messageController',
            controllerAs: 'messageCtrl',
            bindToController: true
        };
    });
