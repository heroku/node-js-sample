$(document).ready(function(){
    var $quizSelection = $("#quizSelection"),
        $quizBox = $("#quizBox"),
        $networkError = $(".network-error"),
        $modalTemplate = $("#modal-template"),
        chosenAnswer;

    $( "a.quiz-select" ).click( function( event ) {
        var data = $(this).data('quiz');
        event.preventDefault();
        $.post( "/quiz-select", { data } )
        .done( function( data ) {
            if(data.error || !data.questions || !data.questions["1"] || !data.questions["1"].question) {
                data.message = data.message || "invalid response";
                data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                invalidRequest(data.message, data.subMessage);
                return;
            }
            showQuizBox(data);
        })
        .fail( function() {
            $networkError.removeClass("hidden");
            setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
        });
    });

    $quizBox.find(".well").click( function( event ) {
        $quizBox.find(".well").removeClass("selected");
        $(this).addClass("selected");
        chosenAnswer = $(this).data("answer-letter");
    });

    $( ".submit" ).click( function() {
        if(!chosenAnswer) {
            $quizBox.find(".well").addClass("hovered");
            setTimeout(function(){ $quizBox.find(".well").removeClass("hovered"); }, 2500);
            return;
        }
        $.post( "/submit", chosenAnswer)
        .done( function( data ) {
            console.log("data" + JSON.stringify(data));
        })
        .fail( function() {
            $networkError.removeClass("hidden");
            setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
        });
    });

    $( ".give-up" ).click( function() {

    });

    $( ".exit-anyway" ).click( function() {
        $quizSelection.removeClass("hidden");
        $quizBox.addClass("hidden");
    });

    function invalidRequest(message, subMessage) {
        $modalTemplate.find(".modal-title").text(message);
        if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
        $modalTemplate.modal('show');
    }

    function showQuizBox(data) {
        $quizBox.find(".well").removeClass("hidden");
        $quizBox.find(".question").text(data.questions["1"].question);
        if (data.questions["1"].a)  {
            $quizBox.find(".answer-a").text(data.questions["1"].a);
        } else {
            $quizBox.find(".answer-a").parents(".well").addClass("hidden");
        }
        if (data.questions["1"].b)  {
            $quizBox.find(".answer-b").text(data.questions["1"].b);
        } else {
            $quizBox.find(".answer-b").parents(".well").addClass("hidden");
        }
        if (data.questions["1"].c)  {
            $quizBox.find(".answer-c").text(data.questions["1"].b);
        } else {
            $quizBox.find(".answer-c").parents(".well").addClass("hidden");
        }
        if (data.questions["1"].d)  {
            $quizBox.find(".answer-d").text(data.questions["1"].b);
        } else {
            $quizBox.find(".answer-d").parents(".well").addClass("hidden");
        }
        $quizSelection.addClass("hidden");
        $quizBox.removeClass("hidden");
    }
});