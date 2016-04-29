(function (Quizzes) {
    "use strict";
    $(document).ready(function () {
        $("body").on("click", "#highscoreModal .modal-header a", function (event) {
            event.preventDefault();
            $("#highscoreModal .modal-header a").parent().removeClass("active");
            $(this).parent().addClass("active");
        });

        google.charts.load('current', {'packages': ['table']});
        Quizzes.drawTable = function () {
            Quizzes.scores = Quizzes.scores || {};
            Quizzes.scores = sortScoresBy("quizName");
            var table = new google.visualization.Table(document.getElementById('hsBody')),
                data = new google.visualization.DataTable(),
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
            showActualUserHighlighted();
        };

        function showActualUserHighlighted() {
            var userName = $(".user-name").text().trim(),
                $tableTDs = $(".google-visualization-table-td");

            for (var td of $tableTDs) {
                var $td = $(td);
                if ($td.text() === userName) {
                    $td.parent().addClass("highlight-gold");
                }
            }
        }

        function sortScoresBy(property) {
            return quickSort(Quizzes.scores, property);
        }

        function partition(items, property, left, right) {
            var pivot   = items[property][Math.floor((right + left) / 2)],
                i       = left,
                j       = right;

            while (i <= j) {
                while (items[property][i] < pivot) {
                    i++;
                }
                while (items[property][j] > pivot) {
                    j--;
                }
                if (i <= j) {
                    swap(items, i, j);
                    i++;
                    j--;
                }
            }

            return i;
        }

        function swap(items, firstIndex, secondIndex){
            for (var prop in items) {
                if (hasOwnProperty.call(items, prop)) {
                    var temp = items[prop][firstIndex];
                    items[prop][firstIndex] = items[prop][secondIndex];
                    items[prop][secondIndex] = temp;
                }
            }
        }

        function quickSort(items, property, left, right) {
            var index;
            if (items[property].length > 1) {
                left = left || 0;
                right = right || items[property].length - 1;

                index = partition(items, property, left, right);

                if (left < index - 1) {
                    quickSort(items, property, left, index - 1);
                }

                if (index < right) {
                    quickSort(items, property, index, right);
                }

            }

            return items;
        }
    });
})(window.Quizzes = window.Quizzes || {});
