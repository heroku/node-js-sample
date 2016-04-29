(function(Quizzes) {
    "use strict";
    $(document).ready(function(){
        let highScoreData;

        $( ".show-high-score" ).click( function( event ) {
            showHighScore();
        });

        function showHighScore(higscoreTable) {
            if ($('.interstitial-mask').is(":visible")) return;

            higscoreTable = higscoreTable || "all";
            Quizzes.showLoadingInterstitial();
            $.post( "/show-high-score", {'data': higscoreTable} )
                .done( function( data ) {
                    if(data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        Quizzes.invalidRequest(data.message, data.subMessage);
                        return;
                    }
                    highScoreData = data;
                    $(".highscore-container").html(data);
                    setTimeout(function() {$("#highscoreModal").modal('show'); }, 150);
                })
                .fail( function() {
                    Quizzes.showNetworkError();
                })
                .always( function() {
                    Quizzes.hideLoadingInterstitial();
                });

        }

    });
})(window.Quizzes = window.Quizzes || {});

