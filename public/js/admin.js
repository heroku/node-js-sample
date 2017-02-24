(function () {
    "use strict";
    $(document).ready(function () {
        const $body = $("body"),
            $networkError = $(".network-error"),
            $successfullQuizSave = $(".successfull-quiz-save"),
            $modalTemplate = $("#modal-template"),
            $quizErrorTemplate = $(".quiz-error-template"),
            $newQuizModal = $("#new-quiz-modal"),
            $createQuiz = $(".create-quiz"),
            $manageQuiz = $(".manage-quiz"),
            USERS_UL = "<ul class='users'>",
            PER_UL = "</ul>",
            HORIZONTAL_LINE = "<hr/>",
            QUICK_BUTTONS = "<h3>Quick buttons:</h3>";


        $createQuiz.click(function () {
            $newQuizModal.modal("show");
        });


        $manageQuiz.click(function () {
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
                    const $manageSavedQuizModal = $("#manageSavedQuizModal");
                    $manageSavedQuizModal.find(".manage-saved-quiz").val(JSON.stringify(data));
                    $manageSavedQuizModal.modal("show");
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

        $body.on('hidden.bs.collapse', '[id^="collapse"]', function () {
            let $toggleButton = $(this).parent().find(".toggle-questions");
            $toggleButton.html('<span class="fa fa-chevron-down"></span> Open');
        });

        $(".save").click(function () {
            let data = {},
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

            $(".discard").click(function () {
                $newQuizModal.find("input[type='text']").val('');
                $newQuizModal.find("textarea").val('');
                $newQuizModal.find("input[type='tel']").val('');
                $newQuizModal.find("input[type='file']").val('');
                $newQuizModal.find("input[type='checkbox']").prop('checked', false);
            });

            $(".plus-one-question").click(function () {
                let question_index = getQuestionIndex();
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

        $(".manage-users").click(function () {
            $.get("/admin/users")
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(message, subMessage);
                        return;
                    }
                    let managingEnabled = true;
                    showUsers(data, managingEnabled);
                })
                .fail(function () {
                    showNetworkError();
                });
        });

        $body.on("click", ".users-select-all", function () {
            $('.select-user').each(function (index) {
                if (!$(this).is(":checked")) {
                    $(this).prop('checked', true);
                }
            });
        });

        $body.on("click", ".users-select-none", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    $(this).prop('checked', false);
                }
            });
        });

        $body.on("click", ".users-team-deadpool", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    // TODO change team to Deadpool
                }
            });
        });

        $body.on("click", ".users-add-admin", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    // TODO are you sure and add admin rights
                }
            });
        });

        $body.on("click", ".users-delete", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    // TODO are you sure and delete
                }
            });
        });

        $body.on("click", ".users-apply", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    // TODO are you sure and delete
                }
            });
        });

        function renderUserRoleListElem(user, managingEnabled) {
            const colorToApply = user.role === "admin" ? "color:red" : "";
            return managingEnabled ?
                "<li style='" + colorToApply + "'>Role: <input type='text' value='" + user.role + "' data-value='" + user.role + "'></li>" :
                "<li style='" + colorToApply + "'>Role: " + user.role + "</li>";
        }

        function renderTeamListElem(user, managingEnabled) {
            if (managingEnabled) {
                return "<li>Team: <input type='text' value='" + (user.team || '') + "' data-value='" + (user.team || '') + "'></li>";
            }
            return user.team ?
                "<li>Team: " + user.team + "</li>" :
                "";
        }

        function renderUserNameListElem(user, managingEnabled) {
            return managingEnabled ?
                "<li>Name: <input type='text' value='" + user.displayName + "' data-value='" + user.displayName + "'></li>" :
                "<li>Name: <b>" + user.displayName + "</b></li>";
        }

        function renderUserIdListElem(user, managingEnabled) {
            return managingEnabled ?
                "<input type='checkbox' name='" + user.displayName + "' class='select-user' />" +
                "<li>Id: <span>" + user.id + "</span></li>" :

                "<li>Id: " + user.id + "</li>";
        }

        function renderManagerButtons(managingEnabled) {
            return managingEnabled ?
                '<button type="button" class="users-select-all btn btn-info">select: all</button>' +
                '<button type="button" class="users-select-none btn btn-info">select: none</button>' +
                '<button type="button" class="users-apply btn btn-success float-right">Apply</button>' +
                HORIZONTAL_LINE +
                QUICK_BUTTONS +
                '<button type="button" class="users-delete btn btn-danger">Delete</button>' +
                '<button type="button" class="users-add-admin btn btn-danger ">+Admin</button>' +
                '<button type="button" class="users-team-deadpool btn btn-danger ">DeAdPoOl</button>' :
                '';
        }

        function showUsers(users, managingEnabled) {
            scrollToTop();
            $modalTemplate.find(".modal-title").text("Users");
            let modalBody = "";
            modalBody += renderManagerButtons(managingEnabled);
            for (let user of users) {
                modalBody += HORIZONTAL_LINE;
                modalBody += USERS_UL;
                modalBody += renderUserIdListElem(user, managingEnabled);
                modalBody += renderUserNameListElem(user, managingEnabled);
                modalBody += renderUserRoleListElem(user, managingEnabled);
                modalBody += renderTeamListElem(user, managingEnabled);
                modalBody += PER_UL;
                modalBody += HORIZONTAL_LINE;
            }
            $modalTemplate.find(".modal-body").html(modalBody);
            $modalTemplate.modal('show');
        }
    });
})();
