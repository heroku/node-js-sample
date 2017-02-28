$(document).ready(function () {
    "use strict";
    const   $sprint = $('.sprint'),
            $codeChallenge = $('.code-challenges'),
            $personal = $('.personal'),
            $history = $('.history'),
            $body = $( "body" ),
            menuElements = [$sprint.find('div'), $codeChallenge.find('div'), $personal.find('div'), $history.find('div')],
            LEFT = 37,
            UP = 38,
            RIGHT = 39,
            DOWN = 40,
            ENTER = 13,
            TEAM = $body.data("team");
        let actualMenu = $sprint,
            prohibitTooOftenMenuSelection = false;

    selectMenu($sprint);

    function getOriginalWidth($menuElement) {
        let $parent = $menuElement.parent();
        if ($parent.hasClass('sprint')) {
            return "820px";
        } else if ($parent.hasClass('code-challenges')) {
            return "940px";
        } else if ($parent.hasClass('personal') || $parent.hasClass('history')) {
            return "580px";
        }
        return "0px";
    }

    function selectMenu() {
        let $selected = actualMenu.find('div');
        for (let $menuElement of menuElements) {
            $menuElement.stop(true, true);
            if ($menuElement.hasClass('selected')) {
                $menuElement.removeClass('selected');
                $menuElement.css({
                    "top": "0",
                    "left": "0",
                    "width": getOriginalWidth($menuElement),
                    "height": "100px",
                    "z-index": "100",
                    "border": "1px solid rgba(200,205,205,.1)",
                    "box-shadow": "0 1px 90px rgba(255,0,0,.3)"
                });
            }
        }

        $selected.animate({
            "top": "-50px",
            "left": "-50px",
            "width": "+=100",
            "height": "+=100",
        }, 200, function() {
            $selected.addClass('selected');
            // Animation complete.
        }).css({
            "z-index": "200",
            "border": "1px solid rgba(255,255,255,.1)",
            "box-shadow": "0 1px 90px rgba(0,200,255,.3)"
        });
    }

    function playAudio(audio) {
        switch (audio) {
            case DOWN:
                $(".menu-step-up")[0].pause();
                $(".menu-step-up")[0].currentTime = 0;
                $(".menu-step-down").trigger("play");
                break;
            case UP:
            default:
                $(".menu-step-down")[0].pause();
                $(".menu-step-down")[0].currentTime = 0;
                $(".menu-step-up").trigger("play");
                break;
        }

    }

    function handleProhibitMenuSelection() {
        prohibitTooOftenMenuSelection = true;
        setTimeout(function () {
            prohibitTooOftenMenuSelection = false;
        }, 200);
    }

    $body.on( "keydown", function(event) {
        if (prohibitTooOftenMenuSelection) {
            return;
        }
        handleProhibitMenuSelection();
        switch ( event.which ) {
            case DOWN:
            case RIGHT:
                event.stopPropagation();
                event.preventDefault();
                playAudio(DOWN);
                nextMenu();
                selectMenu();
                break;
            case UP:
            case LEFT:
                event.stopPropagation();
                event.preventDefault();
                playAudio(UP);
                previousMenu();
                selectMenu();
                break;
            case ENTER:
                redirectUserBasedOnMenuSelection();
                break;
            default:
                break;
        }
    });

    function redirectUserBasedOnMenuSelection() {
        if (actualMenu.is($sprint)) {
            window.location = "/challenges/" + TEAM + "/sprint";
        } else if (actualMenu.is($codeChallenge)) {
            window.location = "/challenges/" + TEAM + "/code";
        } else if (actualMenu.is($personal)) {
            window.location = "/challenges/" + TEAM + "/personal";
        } else if (actualMenu.is($history)) {
            window.location = "/challenges/" + TEAM + "/history";
        }
    }

    function nextMenu() {
        if (actualMenu.is($sprint)) {
            actualMenu = $codeChallenge;
        } else if (actualMenu.is($codeChallenge)) {
            actualMenu = $personal;
        } else if (actualMenu.is($personal)) {
            actualMenu = $history;
        } else if (actualMenu.is($history)) {
            actualMenu = $sprint;
        }
    }

    function previousMenu() {
        if (actualMenu.is($sprint)) {
            actualMenu = $history;
        } else if (actualMenu.is($codeChallenge)) {
            actualMenu = $sprint;
        } else if (actualMenu.is($personal)) {
            actualMenu = $codeChallenge;
        } else if (actualMenu.is($history)) {
            actualMenu = $personal;
        }
    }

    $body.on( "mouseover", ".hover", function() {
        if (prohibitTooOftenMenuSelection) {
            return;
        }
        handleProhibitMenuSelection();
        let parent = $(this).parent();
        if (actualMenu.is(parent)) return;
        actualMenu = parent;
        selectMenu(actualMenu);
    });

    $body.on( "click", ".hover", function() {
        let e = jQuery.Event("keydown");
        e.which = ENTER;
        $body.trigger(e);
    });

});