(function () {
    "use strict";
    const   $networkError = $(".network-error"),
            $successfullQuizSave = $(".successfull-quiz-save"),
            $modalTemplate = $("#modal-template"),
            $quizErrorTemplate = $(".quiz-error-template"),
            $newQuizModal = $("#new-quiz-modal"),
            UL = "<ul>",
            PER_UL = "</ul>",
            HORIZONTAL_LINE = "<hr/>";

    $(document).ready(function () {
        $(".create-quiz").click(function () {
            $newQuizModal.modal("show");
        });

        $(".manage-quiz").click(function () {
            let selectedQuiz = $(".manage-quiz-select").val();
            if (!selectedQuiz && selectedQuiz == '') {
                return;
            }
            $.post("/admin/loadQuiz", {"selectedQuiz": selectedQuiz})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(data.message, data.subMessage);
                        return;
                    }
                    $("#manageSavedQuizModal").find(".manage-saved-quiz").val(JSON.stringify(data));
                    $("#manageSavedQuizModal").modal("show");
                })
                .fail(function () {
                    showNetworkError();
                });
        });

        $(".update-saved-quiz").click(function () {
            let selectedQuiz = $(".manage-quiz-select").val(),
                updatedQuiz = $("#manageSavedQuizModal").find(".manage-saved-quiz").val();//JSON.parse($("#manageSavedQuizModal").find(".manage-saved-quiz").val());
            if (!selectedQuiz && selectedQuiz == '') {
                return;
            }

            $.post("/admin/updateQuiz", {"selectedQuiz": selectedQuiz, "quiz": updatedQuiz})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(message, subMessage);
                        return;
                    }
                    $("#manageSavedQuizModal").modal("hide");
                    showSuccessfullQuizSave();
                })
                .fail(function () {
                    showNetworkError();
                });


        });

        $("body").on('hidden.bs.collapse', '[id^="collapse"]', function () {
            var $toggleButton = $(this).parent().find(".toggle-questions");
            $toggleButton.html('<span class="fa fa-chevron-down"></span> Open');
        });

        $(".save").click(function () {
            var data = {},
                name, val;
            $newQuizModal.find("input[type='text'], textarea, input[type='tel'], select").each(function (index, element) {
                name = $(element).attr("name");
                val = $(element).val();
                data[name] = val
            });
            $newQuizModal.find("input[type='checkbox']").each(function () {
                name = $(this).attr("name");
                val = $(this).is(':checked');
                data[name] = val;
            });

            $.post("/admin/save_one_quiz", data)
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        invalidRequest(data.message, data.subMessage);
                        return;
                    }
                    showSuccessfullQuizSave();
                })
                .fail(function () {
                    showNetworkError();
                });
        });

        $(".discard").click(function () {
            $newQuizModal.find("input[type='text']").val('');
            $newQuizModal.find("textarea").val('');
            $newQuizModal.find("input[type='tel']").val('');
            $newQuizModal.find("input[type='file']").val('');
            $newQuizModal.find("input[type='checkbox']").prop('checked', false);
        });

        $(".plus-one-question").click(function () {
            var question_index = getQuestionIndex();
            $.post("/admin/plus_one_question", {question_index: question_index})
                .done(function (data) {
                    $newQuizModal.find(".panel-primary").last().after(data);
                })
                .fail(function () {
                    showNetworkError();
                });

            console.log("plus-one-question");
        });
    });

    function getQuestionIndex() {
        return $newQuizModal.find(".panel-collapse").length;
    }

    function showNetworkError() {
        scrollToTop();
        $networkError.removeClass("hidden");
        setTimeout(function () {
            $networkError.addClass("hidden");
        }, 2500);
    }

    function invalidRequest(message, subMessage) {
        scrollToTop();
        $quizErrorTemplate.find("h3").text(message);
        if (subMessage) {
            $quizErrorTemplate.find("div").html(subMessage);
        }
        $quizErrorTemplate.removeClass('hidden');
    }

    function showCommonError(message, subMessage) {
        scrollToTop();
        $(".common-error-template").find("h3").text(message);
        if (subMessage) {
            $(".common-error-template").find("div").html(subMessage);
        }
        $(".common-error-template").removeClass('hidden');
    }

    function scrollToTop(speed) {
        $("html, body").animate({scrollTop: 0}, speed || "fast");
        $('.modal').animate({scrollTop: 0}, speed || 'fast');
    }

    function showSuccessfullQuizSave() {
        scrollToTop();
        $successfullQuizSave.removeClass("hidden");
        setTimeout(function () {
            $successfullQuizSave.addClass("hidden");
        }, 2500);
    }

    $(".list-users").click(function () {
        $.get("/admin/users")
            .done(function (data) {
                if (data.error) {
                    data.message = data.message || "invalid response";
                    data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                    showCommonError(message, subMessage);
                    return;
                }
                showUsers(data);
            })
            .fail(function () {
                showNetworkError();
            });
    });

    function renderUserRoleListElem(user) {
        return user.role === "admin" ?
            "<li style='color:red'>Role: " + user.role + "</li>" :
            "<li>Role: " + user.role + "</li>";
    }

    function renderTeamListElem(user) {
        return user.team ?
            "<li>Team: " + user.team + "</li>" :
            "";
    }

    function renderUserNameListElem(user) {
        return "<li>Name: <b>" + user.displayName + "</b></li>";
    }

    function renderUserIdListElem(user) {
        return "<li>Id: " + user.id + "</li>";
    }

    function showUsers(users) {
        scrollToTop();
        $modalTemplate.find(".modal-title").text("Users");
        let modalBody = "";
        for (let user of users) {
            modalBody += UL;
            modalBody += renderUserNameListElem(user);
            modalBody += renderUserIdListElem(user);
            modalBody += renderUserRoleListElem(user);
            modalBody += renderTeamListElem(user);
            modalBody += PER_UL;
            modalBody += HORIZONTAL_LINE;
        }
        $modalTemplate.find(".modal-body").html(modalBody);
        $modalTemplate.modal('show');
    }

})();
