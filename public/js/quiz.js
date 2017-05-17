(function() {
    "use strict";
    $(document).ready(function(){
        var $quizSelection = $("#quizSelection"),
            $quizBox = $("#quizBox"),
            $networkError = $(".network-error"),
            $modalTemplate = $("#modal-template"),
            chosenAnswer,
            quizData,
            highScoreData,
            shoudUseFastAnswers = $(".user-name").data("shouldUseFastAnswers"),
            undefined = [][0];

        $( "a.quiz-select" ).click( function( event ) {
            var data = $(this).data('quiz');
            event.preventDefault();
            $.post( "/quiz-select", {'data': data} )
                .done( function( data ) {
                    if(data.error || !data.questionsAndAnswers || !data.questionsAndAnswers.length) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        invalidRequest(data.message, data.subMessage);
                        return;
                    }
                    quizData = data;
                    wipeQuizData();
                    showQuizBox(data);
                })
                .fail( function() {
                    showNetworkError();
                });
        });

        $("body").on("click", "#highscoreModal .modal-header a", function (event) {
            event.preventDefault();
            $("#highscoreModal .modal-header a").parent().removeClass("active");
            $(this).parent().addClass("active");
        });

        $("body").keypress( function (event) {
            if (shoudUseFastAnswers) {
                switch(event.which) {
                    case 49: $( ".answer-a" ).click(); $( ".submit" ).click(); break;
                    case 50: $( ".answer-b" ).click(); $( ".submit" ).click(); break;
                    case 51: $( ".answer-c" ).click(); $( ".submit" ).click(); break;
                    case 52: $( ".answer-d" ).click(); $( ".submit" ).click(); break;
                    default: break;
                }
            } else {
                switch(event.which) {
                    case 13: $( ".submit" ).click(); break;
                    case 49: $( ".answer-a" ).click(); break;
                    case 50: $( ".answer-b" ).click(); break;
                    case 51: $( ".answer-c" ).click(); break;
                    case 52: $( ".answer-d" ).click(); break;
                    default: break;
                }
            }
        });

        $( ".show-high-score" ).click( function( event ) {
            event.preventDefault();
            showHighScore();
        });

        $( ".update-quizzes" ).click( function( event ) {
            $.post( "/updateQuizzes" )
                .done( function( data ) {
                    console.log(data);
                })
                .fail( function() {
                    showNetworkError();
                });
        });

        $quizBox.find(".well").click( function( event ) {
            $quizBox.find(".well").removeClass("selected");
            $(this).addClass("selected");
            chosenAnswer = $(this).data("answer-index")+"";
            if (shoudUseFastAnswers) {
                $( ".submit" ).click();
            }
        });

        $( ".submit" ).click( function() {
            if(!chosenAnswer) {
                $quizBox.find(".well").addClass("hovered");
                setTimeout(function(){ $quizBox.find(".well").removeClass("hovered"); }, 2500);
                return;
            }

            $.post( "/submit", {'data': chosenAnswer} )
                .done( function( data ) {
                    showVolatileScoreUp(data);
                    updateScore(data);
                    handleNextRound(data);
                })
                .fail( function() {
                    showNetworkError();
                })
                .always( function() {
                    chosenAnswer = undefined;
                });
        });

        $( ".give-up" ).click( function() {
            $.post( "/submit", {'data': ""} )
                .done( function( data ) {
                    handleNextRound(data);
                })
                .fail( function() {
                    showNetworkError()
                });
        });

        $( ".exit-anyway" ).click( function() {
            exitToQuizzes();
        });

        function invalidRequest(message, subMessage) {
            $modalTemplate.find(".modal-title").text(message);
            if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
            $modalTemplate.modal('show');
        }

        function showQuizBox(data, questionIndex) {
            questionIndex = questionIndex || "0";
            if (!data.questionsAndAnswers[questionIndex]) {
                showHighScore(data.name);
                exitToQuizzes();
                return;
            }
            $quizBox.find(".well").removeClass("hidden");
            $quizBox.find(".well").removeClass("selected");
            $quizBox.find(".question").text(data.questionsAndAnswers[questionIndex].question);
            if (data.questionsAndAnswers[questionIndex].answers[0].answerText)  {
                $quizBox.find(".answer-a").text(data.questionsAndAnswers[questionIndex].answers[0].answerText);
            } else {
                $quizBox.find(".answer-a").parents(".well").addClass("hidden");
            }
            if (data.questionsAndAnswers[questionIndex].answers[1].answerText)  {
                $quizBox.find(".answer-b").text(data.questionsAndAnswers[questionIndex].answers[1].answerText);
            } else {
                $quizBox.find(".answer-b").parents(".well").addClass("hidden");
            }
            if (data.questionsAndAnswers[questionIndex].answers[2].answerText)  {
                $quizBox.find(".answer-c").text(data.questionsAndAnswers[questionIndex].answers[2].answerText);
            } else {
                $quizBox.find(".answer-c").parents(".well").addClass("hidden");
            }
            if (data.questionsAndAnswers[questionIndex].answers[3].answerText)  {
                $quizBox.find(".answer-d").text(data.questionsAndAnswers[questionIndex].answers[3].answerText);
            } else {
                $quizBox.find(".answer-d").parents(".well").addClass("hidden");
            }
            $quizSelection.addClass("hidden");
            $quizBox.removeClass("hidden");
        }
        function handleNextRound(data) {
            if (data.gameFinished) {
                showHighScore(data.name || "all");
                exitToQuizzes();
            } else {
                updateQuizBox(data);
            }
        }

        function updateQuizBox(data) {
            showQuizBox(quizData, data.questionIndex);
        }

        function updateScore(data) {
            let $userScore = $(".user-score");
            $userScore.text(Number($userScore.text()) + Number(data.scoreUp));
        }

        function showVolatileScoreUp(data) {
            let $volatileScore = $(".volatile-score");
            $volatileScore
                .text(Number(data.scoreUp))
                .removeClass("hidden")
                .stop()
                .css({"opacity": "1", "top": "50%", "right": "30%"})
                .animate( {
                    opacity: 0.0,
                    top: "40%",
                    right: "20%"
                }, 1500);
        }

        function showHighScore(higscoreTable) {
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

        }

        function showLoadingInterstitial() {
            $('.interstitial-mask').removeClass("hidden")
            $(".loader").removeClass("hidden");
        }

        function hideLoadingInterstitial() {
            $('.interstitial-mask').addClass("hidden")
            $(".loader").addClass("hidden");
        }

        function formatDate(scoreDate) {
            return (scoreDate.slice(0, 10) + " " + scoreDate.slice(11, 16));
        }

        function showNetworkError() {
            $networkError.removeClass("hidden");
            setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
        }

        function exitToQuizzes() {
            $quizSelection.removeClass("hidden");
            $quizBox.addClass("hidden");
        }

        function wipeQuizData() {
            let $userScore = $(".user-score");
            $userScore.text(0);
        }

    });
})();
