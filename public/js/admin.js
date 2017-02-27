(function () {
    "use strict";
    $(document).ready(function () {
        const $body = $("body"),
            $networkError = $(".network-error"),
            $successfulQuizSave = $(".successful-quiz-save"),
            $modalTemplate = $("#modal-template"),
            $quizErrorTemplate = $(".quiz-error-template"),
            $newQuizModal = $("#new-quiz-modal"),
            $createQuiz = $(".create-quiz"),
            $manageQuiz = $(".manage-quiz"),
            USERS_UL = "<ul class='users'>",
            PER_UL = "</ul>",
            HORIZONTAL_LINE = "<hr/>",
            QUICK_BUTTONS = "<h4>Quick buttons (for the users selected by the checkbox):</h4>";


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
                    showSuccessfulQuizSave();
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
                    showSuccessfulQuizSave();
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
            }, 5000);
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

        function showSuccessfulQuizSave() {
            scrollToTop();
            $successfulQuizSave.removeClass("hidden");
            setTimeout(function () {
                $successfulQuizSave.addClass("hidden");
            }, 5000);
        }

        function showSuccessfulUserUpdate() {
            scrollToTop();
            $(".successful-user-update").removeClass("hidden");
            setTimeout(function () {
                $(".successful-user-update").addClass("hidden");
            }, 5000);
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

        $body.on("click", ".deadpool-confirmation", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    let $this = $(this),
                        $userAttributeList = $this.parent("ul").find("li");
                    $($userAttributeList.get(3)).find("input").val("Deadpool");
                }
            });
            let onlyChecked = true;
            let checkForChange = true;
            let userToUpdate = getUsersToUpdate(onlyChecked, checkForChange);
            $.post("/admin/update/users", {data: userToUpdate})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(data.message, data.subMessage);
                        return;
                    }
                    updateOriginalData();
                    showSuccessfulUserUpdate();
                })
                .fail(function () {
                    showNetworkError();
                });

        });

        $body.on("click", ".admin-confirm", function () {
            $('.select-user').each(function (index) {
                if ($(this).is(":checked")) {
                    let $this = $(this),
                        $userAttributeList = $this.parent("ul").find("li");
                    $($userAttributeList.get(2)).find("input").val("admin");
                }
            });
            let onlyChecked = true;
            let checkForChange = true;
            let userToUpdate = getUsersToUpdate(onlyChecked, checkForChange);
            $.post("/admin/update/users", {data: userToUpdate})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(data.message, data.subMessage);
                        return;
                    }
                    updateOriginalData();
                    showSuccessfulUserUpdate();
                })
                .fail(function () {
                    showNetworkError();
                });
        });

        $body.on("click", ".delete-confirm", function () {
            let onlyChecked = true;
            let checkForChange = false;
            let userToDelete = getUsersToUpdate(onlyChecked, checkForChange);
            $.post("/admin/delete/users", {data: userToDelete})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(data.message, data.subMessage);
                        return;
                    }
                    updateOriginalData();
                    showSuccessfulUserUpdate();
                })
                .fail(function () {
                    showNetworkError();
                });
        });

        function changeDetected(name, originalName, role, originalRole, team, originalTeam) {
            return name !== originalName+"" || role !== originalRole+"" || team !== originalTeam+"";
        }

        function getUsersToUpdate(onlyChecked, checkForChange) {
            let userToUpdate = [];
            $('.users').each(function (index) {
                if (!onlyChecked || $(this).find(".select-user").is(":checked")) {
                    let $this = $(this),
                        $userAttributeList = $this.find("li"),
                        userId = $($userAttributeList.get(0)).find("span").text(),
                        name = $($userAttributeList.get(1)).find("input").val(),
                        originalName = $($userAttributeList.get(1)).find("input").data("value"),
                        role = $($userAttributeList.get(2)).find("input").val(),
                        originalRole = $($userAttributeList.get(2)).find("input").data("value"),
                        team = $($userAttributeList.get(3)).find("input").val(),
                        originalTeam = $($userAttributeList.get(3)).find("input").data("value");
                    if (!checkForChange || changeDetected(name, originalName, role, originalRole, team, originalTeam)) {
                        userToUpdate.push({
                            userId: userId,
                            name: name,
                            role: role,
                            team: team
                        });
                    }
                }
            });
            return JSON.stringify(userToUpdate);
        }

        function updateOriginalData() {
            $(".manage-users").click();
        }

        $body.on("click", ".apply-confirm", function () {
            let onlyChecked = false;
            let checkForChange = true;
            let userToUpdate = getUsersToUpdate(onlyChecked, checkForChange);
            $.post("/admin/update/users", {data: userToUpdate})
                .done(function (data) {
                    if (data.error) {
                        data.message = data.message || "invalid response";
                        data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                        showCommonError(data.message, data.subMessage);
                        return;
                    }
                    updateOriginalData();
                    showSuccessfulUserUpdate();
                })
                .fail(function () {
                    showNetworkError();
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
                '<a href="#confirmChanges" class="users-apply btn btn-success float-right" data-toggle="modal">Apply</a>' +
                HORIZONTAL_LINE +
                QUICK_BUTTONS +
                '<a href="#confirmDelete" class="users-delete btn btn-primary" data-toggle="modal">Delete</a>' +
                '<a href="#confirmAdmin" class="users-add-admin btn btn-primary" data-toggle="modal">+Admin</a>' +
                '<a href="#confirmDeadpool" class="users-team-deadpool btn btn-primary" data-toggle="modal">DeAdPoOl</a>' :
                '';
        }

        function showUsers(users, managingEnabled) {
            scrollToTop();
            $modalTemplate.find(".modal-title").html(
                "Users" + "<div class='successful-user-update alert alert-success hidden'> Successful user db update </div>"
            );
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

        // fix overflow issue for cases when more than one modal is open
        $('.modal').on('hidden.bs.modal', function () {
            if ($(".modal").is(":visible")) {
                $body.addClass("modal-open");
            }
        });
    });
})();
