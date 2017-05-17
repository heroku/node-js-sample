(function (Quizzes) {
    "use strict";
    $(document).ready(function () {
        let highScoreData;

        $("body").on("click", "#highscoreModal .modal-header a", function (event) {
            event.preventDefault();
            $("#highscoreModal").modal('hide');

            Quizzes.showLoadingInterstitial();
            $.post( "/show-high-score", {'data': $(this).data("request")} )
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
        });

        google.charts.load('current', {'packages': ['table']});

        Quizzes.drawTables = function () {
            Quizzes.scores = Quizzes.scores || {};
            Quizzes.scores.quizNames = Quizzes.scores.quizNames || {};
            Quizzes.scores = sortScoresBy("quizNames");
            var table,
                data = new google.visualization.DataTable(),
                rowLength = Quizzes.scores.users.length,
                quizCaptionIndex = 0,
                previousQuizName = Quizzes.scores.quizNames[0],
                index,
                $highscoreBody = $("#hsBody"),
                shouldDrawTable = false;

            data.addColumn('string', 'Player');
            data.addColumn('string', 'Date');
            data.addColumn('number', 'Score');

            for (index = 0; index < rowLength; index++) {
                if (previousQuizName === Quizzes.scores.quizNames[index]) {
                    data.addRows([
                        [Quizzes.scores.users[index],
                            Quizzes.scores.dates[index],
                            Quizzes.scores.scores[index]
                        ]
                    ]);
                    if(index+1 === rowLength) {
                        shouldDrawTable = true;
                    }
                }
                if (shouldDrawTable || previousQuizName !== Quizzes.scores.quizNames[index]) {
                    $highscoreBody.append("<div id=hsBody" + index + "></div>");
                    table = new google.visualization.Table(document.getElementById('hsBody'+index));
                    table.draw(data, {showRowNumber: true, width: '100%', height: '100%', sortAscending: false, sortColumn: 2});
                    data = new google.visualization.DataTable();
                    data.addColumn('string', 'Player');
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Score');
                    data.addRows([
                        [Quizzes.scores.users[index],
                            Quizzes.scores.dates[index],
                            Quizzes.scores.scores[index]
                        ]
                    ]);
                    showCaptionForTheTable(quizCaptionIndex++, previousQuizName);
                    previousQuizName = Quizzes.scores.quizNames[index];
                    shouldDrawTable = false;
                }
            }

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

        function showCaptionForTheTable(index, previousQuizName) {
            var actualTable = $("table").get(index);
            if($(actualTable).find("caption").length > 0) {
                return;
            }
            if(actualTable) {
                $(actualTable).prepend("<caption><h2>" + previousQuizName + "</h2></caption>");
            }
            setTimeout(function(){ showCaptionForTheTable(index, previousQuizName); }, 600);
        }
    });
})(window.Quizzes = window.Quizzes || {});
