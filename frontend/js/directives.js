app.directive("upvoteButton", function () {
        return {
            restrict: 'E',
            template: '<div class="upvote"></div>',
            replace: true
        };
    });
