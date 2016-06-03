angular.module('enterSubmitDirective', [])

    .directive('enterSubmit', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind('keydown', function(event) {
                    var code = event.keyCode || event.which;
                    if (code === 13 && !event.shiftKey) {
                            event.preventDefault();
                            scope.$apply(attrs.enterSubmit);
                    };
                });
            }
        };
    });

