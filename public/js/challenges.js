$(document).ready(function () {
    "use strict";
    let $sprint = $('.sprint'),
        $codeChallenge = $('.code-challenges'),
        $personal = $('.personal'),
        $history = $('.history'),
        menuElements = [$sprint.find('div'), $codeChallenge.find('div'), $personal.find('div'), $history.find('div')],
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40,
        actualMenu = $sprint;

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

    function selectMenu($element) {
        let $selected = $element.find('div');
        for (let $menuElement of menuElements) {
            if ($menuElement.hasClass('selected')) {
                $menuElement.removeClass('selected');
                $menuElement.css({
                    "top": "0",
                    "left": "0",
                    "width": getOriginalWidth($menuElement),
                    "height": "100px",
                    "z-index": "100",
                    "border": "1px solid rgba(255,255,255,0)",
                    "box-shadow": "0 1px 6px rgba(0,0,0,.9)"
                });
            }
        }

        $selected.animate({
            "top": "-50px",
            "left": "-50px",
            "width": "+=100",
            "height": "+=100",
        }, 20, function() {
            $selected.addClass('selected');
            // Animation complete.
        }).css({
            "z-index": "200",
            "border": "1px solid rgba(255,255,255,.1)",
            "box-shadow": "0 15px 15px rgba(0,0,0,.1)"
        });
    }

    $( "body" ).on( "keydown", function(event) {
        switch ( event.which ) {
            case DOWN:
            case RIGHT:
                nextMenu();
                selectMenu(actualMenu);
                break;
            case UP:
            case LEFT:
                previousMenu();
                selectMenu(actualMenu);
            default:
                break;
        }
    });

    function nextMenu() {
        if (actualMenu === $sprint) {
            actualMenu = $codeChallenge;
        } else if (actualMenu === $codeChallenge) {
            actualMenu = $personal;
        } else if (actualMenu === $personal) {
            actualMenu = $history;
        } else if (actualMenu === $history) {
            actualMenu = $sprint;
        }
    }

    function previousMenu() {
        if (actualMenu === $sprint) {
            actualMenu = $history;
        } else if (actualMenu === $codeChallenge) {
            actualMenu = $sprint;
        } else if (actualMenu === $personal) {
            actualMenu = $codeChallenge;
        } else if (actualMenu === $history) {
            actualMenu = $personal;
        }
    }
    //.stop(true, true);
});