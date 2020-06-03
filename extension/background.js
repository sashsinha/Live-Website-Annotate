chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.msg == "popupOpened") {
        chrome.tabs.executeScript(message.tabId, {
            file: 'browser_size_helper.js'
        });
    }
});