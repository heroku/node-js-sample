(function (Quizzes) {
    "use strict";
    $(document).ready(function () {
        $("body").on("click", "#highscoreModal .modal-header a", function (event) {
            event.preventDefault();
            $("#highscoreModal .modal-header a").parent().removeClass("active");
            $(this).parent().addClass("active");
        });

        google.charts.load('current', {'packages': ['table']});
        Quizzes.drawTable = function() {
            var table = new google.visualization.Table(document.getElementById('hsBody'));
            Quizzes.scores = Quizzes.scores || {};

            var data = new google.visualization.DataTable(),
                rowLength = Quizzes.scores.user.length,
                index;

            data.addColumn('string', 'Player');
            data.addColumn('string', 'Quiz');
            data.addColumn('string', 'Date');
            data.addColumn('number', 'Score');
            for (index = 0; index < rowLength; index++) {
                data.addRows([
                    [Quizzes.scores.user[index],
                        Quizzes.scores.quizName[index],
                        Quizzes.scores.date[index],
                        Quizzes.scores.score[index]
                    ]
                ]);
            }
            table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
        };

    });

})(window.Quizzes = window.Quizzes || {});
