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

    function selectMenu($element) {
        let $selected = $element.find('div');
        for (let $menuElement of menuElements) {
            $menuElement.stop(true, true);
            if ($menuElement.hasClass('selected')) {
                $menuElement.removeClass('selected');
                $menuElement.animate({
                    "top": "0px",
                    "left": "0px",
                    "z-index": "100",
                    "width": "-=100",
                    "height": "-=100",
                    "border": "1px solid rgba(255,255,255,0)",
                    "box-shadow": "0 1px 6px rgba(0,0,0,.9)"
                }, 2000, function() {
                    // Animation complete.
                });
            }
        }
        $selected.addClass('selected');
        $selected.animate({
            "top": "-50px",
            "left": "-50px",
            "z-index": "200",
            "width": "+=100",
            "height": "+=100",
            "border": "1px solid rgba(255,255,255,.1)",
            "box-shadow": "0 15px 15px rgba(0,0,0,.1)"
        }, 2000, function() {
            // Animation complete.
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