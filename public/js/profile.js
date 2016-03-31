(function() {
    "use strict";
    let $networkError = $(".network-error"),
        $successfullUpdate = $(".successfull-update"),
        $modalTemplate = $("#modal-template"),
        $newDisplayNameModal = $("#new-display-name-modal");

    $(document).ready(function(){
        $(".display-name-change").change(function() {
            let newDisplayName = $(this).val();
            $(this).val("");
            if(newDisplayName === "New") {
                showNewDisplayNameModal();
            } else {
                updateDisplayNameWith(newDisplayName);
            }
        });

        $(".update-display-name-button").click(function() {
            let newDisplayName = $(".update-display-name-text").val();
            updateDisplayNameWith(newDisplayName);
        });
    });

    function invalidRequest(message, subMessage) {
        $modalTemplate.find(".modal-title").text(message);
        if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
        $modalTemplate.modal('show');
    }

    function showNetworkError() {
        $networkError.removeClass("hidden");
        setTimeout(function(){ $networkError.addClass("hidden"); }, 2500);
    }

    function showSuccessfullUpdate() {
        $successfullUpdate.removeClass("hidden");
        setTimeout(function(){ $successfullUpdate.addClass("hidden"); }, 2500);
    }

    function showNewDisplayNameModal() {
        $newDisplayNameModal.modal('show');
    }

    function hideNewDisplayNameModal() {
        $newDisplayNameModal.modal('hide');
    }

    function updateDisplayNameWith(newDisplayName) {
        $.post( "/update-display-name", {'data': newDisplayName} )
            .done( function( data ) {
                if(data.error) {
                    data.message = data.message || "invalid response";
                    data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                    invalidRequest(data.message, data.subMessage);
                    return;
                }
                $(".display-name").text(newDisplayName);
                showSuccessfullUpdate();
            })
            .fail( function() {
                showNetworkError();
            })
            .always(function() {
                hideNewDisplayNameModal();
            });
    }
})();

