(function() {
    "use strict";
    let $newQuizModal = $("#new-quiz-modal");

    $(document).ready(function(){
        $(".create-quiz").click(function() {
            $newQuizModal.modal("show");
        });

        $('[id^="collapse"]').on('hidden.bs.collapse', function () {
            var $toggleButton = $(this).parent().find(".toggle-questions");
            $toggleButton.html('<span class="fa fa-chevron-down"></span> Open');
        });

        $('[id^="collapse"]').on('shown.bs.collapse', function () {
            var $toggleButton = $(this).parent().find(".toggle-questions");
            $toggleButton.html('<span class="fa fa-chevron-up"></span> Close');
        });

        $(".save").click(function() {
            console.log("save");
        });

        $(".discard").click(function() {
            console.log("discard");
        });

        $(".plus-one-question").click(function() {
            console.log("plus-one-question");
        });
    });

})();


