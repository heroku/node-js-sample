(function() {
    "use strict";
    let $newQuizModal = $("#new-quiz-modal");

    $(document).ready(function(){
        $(".create-quiz").click(function() {
            $newQuizModal.modal("show");
        });
    });

})();


