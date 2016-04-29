(function(Quizzes) {
    "use strict";
    $(document).ready(function(){
        let $networkError = $(".network-error"),
            $modalTemplate = $("#modal-template");

        Quizzes.showLoadingInterstitial = function() {
            $('.interstitial-mask').removeClass("hidden")
            $(".loader").removeClass("hidden");
        };

        Quizzes.hideLoadingInterstitial = function() {
            $('.interstitial-mask').addClass("hidden")
            $(".loader").addClass("hidden");
        };

        Quizzes.showNetworkError = function() {
            $networkError.removeClass("hidden");
            setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
        };

        Quizzes.invalidRequest = function(message, subMessage) {
            $modalTemplate.find(".modal-title").text(message);
            if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
            $modalTemplate.modal('show');
        };

    });
})(window.Quizzes = window.Quizzes || {});
