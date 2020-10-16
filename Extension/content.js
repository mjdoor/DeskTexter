// content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // define function to make the modal popup thing
  const showModal = (message, error) => {
    const modal = document.createElement("div");
    $(modal).attr("id", "desktexter_modal");
    $(modal).css({
      position: "fixed",
      top: "10px",
      right: "30px",
      width: "300px",
      height: "auto",
      padding: "10px",
      "z-index": 10000,
      "background-color": "#9EB1B8",
      border: "2px solid black",
      "border-radius": "5px"
    });

    $(modal).html(
      `
      <p style="font-size: 20pt; font-weight: bold; padding: 0 0 10px; margin: 0; text-shadow: 2px 2px 1px white; font-family: 'Roboto' sans-serif;">DeskTexter</p>
      ${
        error
          ? "<p style='color: red; text-align: center; margin: 0; padding: 0 0 2px; font-size: 13pt; font-family: 'Roboto' sans-serif;'>Something went wrong</p>"
          : ""
      }
      <p style="text-align: center; word-wrap: break-word; padding: 0; margin: 0; font-size: 12pt; font-family: 'Roboto' sans-serif;">${message}</p>
      `
    );
    $(modal).hide().appendTo(document.body).slideDown(200);
    if (request.key === "show_popup") {
      setTimeout(() => {
        $("#desktexter_modal").slideUp(200, () => {
          $("#desktexter_modal").remove();
        });
      }, 5000);
    }
  };

  // if the modal is already open, close it and open a new one
  if ($("#desktexter_modal").length) {
    $("#desktexter_modal").slideUp(200, () => {
      $("#desktexter_modal").remove();

      showModal(request.message, request.error);
    });
  } else {
    showModal(request.message, request.error);
  }
});
