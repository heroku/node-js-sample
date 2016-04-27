(function() {
    "use strict";
    $(document).ready(function(){
        let $networkError = $(".network-error"),
            $modalTemplate = $("#modal-template"),
            highScoreData;

        $( ".show-high-score" ).click( function( event ) {
            showHighScore();
        });

        function showHighScore(higscoreTable) {
            if ($('.interstitial-mask').is(":visible")) return;

            higscoreTable = higscoreTable || "all";
            showLoadingInterstitial();
            $.post( "/show-high-score", {'data': higscoreTable} )
                .done( function( data ) {
                    if(data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        invalidRequest(data.message, data.subMessage);
                        return;
                    }
                    highScoreData = data;
                    $(".highscore-container").html(data);
                    $("#highscoreModal").modal('show');
                })
                .fail( function() {
                    showNetworkError();
                })
                .always( function() {
                    hideLoadingInterstitial();
                });

            function showLoadingInterstitial() {
                $('.interstitial-mask').removeClass("hidden")
                $(".loader").removeClass("hidden");
            }

            function hideLoadingInterstitial() {
                $('.interstitial-mask').addClass("hidden")
                $(".loader").addClass("hidden");
            }

            function showNetworkError() {
                $networkError.removeClass("hidden");
                setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
            }

            function invalidRequest(message, subMessage) {
                $modalTemplate.find(".modal-title").text(message);
                if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
                $modalTemplate.modal('show');
            }

        }

    });
})();

