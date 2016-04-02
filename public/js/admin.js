(function() {
    "use strict";
    let $networkError = $(".network-error"),
        $newQuizModal = $("#new-quiz-modal");

    $(document).ready(function(){
        $(".create-quiz").click(function() {
            $newQuizModal.modal("show");
        });

        $("body").on('hidden.bs.collapse', '[id^="collapse"]', function () {
            var $toggleButton = $(this).parent().find(".toggle-questions");
            $toggleButton.html('<span class="fa fa-chevron-down"></span> Open');
        });

        $(".save").click(function() {
            console.log("save");
        });

        $(".discard").click(function() {
            console.log("discard");
        });

        $(".plus-one-question").click(function() {
            var question_index = getQuestionIndex();
            $.post( "/plus_one_question", { question_index: question_index} )
            .done(function(data) {
                $("#new-quiz-modal").find(".panel-primary").last().after(data);
            })
            .fail( function() {
                showNetworkError();
            });

            console.log("plus-one-question");
        });
    });

    function getQuestionIndex() {
        return $("#new-quiz-modal").find(".panel-collapse").length;
    }

    function showNetworkError() {
        $networkError.removeClass("hidden");
        setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
    }
})();


