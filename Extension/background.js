// background.js
var firebaseConfig = {
  apiKey: "<REDACTED>",
  authDomain: "desktexter.firebaseapp.com",
  databaseURL: "https://desktexter.firebaseio.com",
  projectId: "desktexter",
  storageBucket: "desktexter.appspot.com",
  messagingSenderId: "<REDACTED>",
  appId: "<REDACTED>",
  measurementId: "<REDACTED>"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(async user => {
  if (user) {
    // Add right click option if user is signed in
    chrome.contextMenus.create({
      id: "desktexter_send",
      title: "Send selection",
      contexts: ["selection"], // ContextType
      onclick: word => {
        sendNotificationRequest("text", _activeTab => word.selectionText);
      }
    });
    chrome.contextMenus.create({
      id: "desktexter_logout",
      title: "Logout",
      contexts: ["all"], // ContextType
      onclick: () => {
        firebase
          .auth()
          .signOut()
          .then(() => {
            // not passing in an active tab id here because it seemed to be using some hidden popup tab id used when called from within this onAuthStateChangedhandler
            displayPopup(null, "Signed out.");
          });
      }
    });
  } else {
    chrome.contextMenus.removeAll();
  }
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(async function (tab) {
  const activeTab = await getActiveTab();

  if (firebase.auth().currentUser) {
    sendNotificationRequest("url", activeTab => activeTab.url);
  } else {
    try {
      displayPopup(activeTab.id, "Attempting to sign in...", false, true);
      let provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          if (result.user) {
            displayPopup(activeTab.id, "Successfully signed in!");
          } else {
            displayPopup(
              activeTab.id,
              "Sign in failed for an unknown reason.",
              true
            );
          }
        })
        .catch(error =>
          displayPopup(activeTab.id, `Sign in failed. ${error.message}`, true)
        );
    } catch (error) {
      displayPopup(activeTab.id, error.message, true);
    }
  }
});

const sendNotificationRequest = async (contentType, getContentHandler) => {
  const activeTab = await getActiveTab();
  const content = getContentHandler(activeTab);
  displayPopup(activeTab.id, "Sending...", false, true);

  try {
    const token = await retrieveToken(); // could conceivably throw an error - occurred in testing when manually deleted a user, tried to user extension but didn't refresh the page first

    if (token) {
      fetch("https://desktexter.herokuapp.com/", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: content, userToken: token })
      })
        .then(response => {
          if (response.ok) {
            switch (contentType) {
              case "text":
                displayPopup(activeTab.id, "Your selection has been sent!");
                break;
              case "url":
                displayPopup(activeTab.id, "This page's URL has been sent!");
                break;
            }
          } else {
            response
              .json()
              .then(json =>
                displayPopup(activeTab.id, json.errorMessage, true)
              );
          }
        })
        .catch(error => {
          displayPopup(activeTab.id, "Failed to connect to server.", true);
        });
    } else {
      displayPopup(activeTab.id, "Failed to send data.", true);
    }
  } catch (error) {
    displayPopup(
      activeTab.id,
      "An authentication error occurred. Please try again.",
      true
    );
  }
};

const retrieveToken = async () => {
  const user = firebase.auth().currentUser;
  if (user) {
    return user.getIdToken(true);
  } else {
    return null;
  }
};

const getActiveTab = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      resolve(tabs[0]);
    });
  });
};

const displayPopup = (
  tabId,
  message,
  error = false,
  pendingMessage = false
) => {
  if (tabId !== null) {
    chrome.tabs.sendMessage(tabId, {
      key: pendingMessage ? "show_popup_pending" : "show_popup",
      message,
      error
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        key: pendingMessage ? "show_popup_pending" : "show_popup",
        message,
        error
      });
    });
  }
};
