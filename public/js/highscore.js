(function () {
    "use strict";
    $(document).ready(function () {
        $("body").on("click", "#highscoreModal .modal-header a", function (event) {
            event.preventDefault();
            $("#highscoreModal .modal-header a").parent().removeClass("active");
            $(this).parent().addClass("active");
        });
    });

})();
