chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Clicked VisLink");
    console.log(`Current URL: ${tab.url}`);
    if (tab.url.includes("?visconnect")) {
        const newUrl = tab.url.slice(0, tab.url.indexOf("?visconnect"));
        chrome.tabs.update(window.currentTabID, { url: newUrl, active: true });
    } else {
        const newUrl = tab.url + "?visconnect";
        chrome.tabs.update(window.currentTabID, { url: newUrl, active: true });
    }
});
