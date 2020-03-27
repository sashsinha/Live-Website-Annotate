const getTabDetails = () => {
    let q = { active: true, currentWindow: true };
    chrome.tabs.query(q, tabs => {
        window.currentTab = tabs[0];
        window.tabBaseURL = window.currentTab.url;
    });
    setTimeout(() => {
        // console.log(window.currentTab);
        // console.log(window.tabBaseURL);
        if (!window.tabBaseURL.includes("chrome")) {
            console.log(window.tabBaseURL.includes("?visconnect"));
            if (window.tabBaseURL.includes("?visconnect")) {
                annotateAsLeaderButton.innerText = "Stop annotating";
            } else {
                annotateAsLeaderButton.innerText = "Start Annotating as Leader";
            }
        }
    }, 10);
};
getTabDetails();

let connectToVislinkButton = document.getElementById("connect-to-vislink");
let inputElement = document.getElementById("textarea1");

connectToVislinkButton.addEventListener("click", () => {
    connectToVislinkButtonPress();
});

const connectToVislinkButtonPress = () => {
    const visLinkURL = inputElement.value + "?lwa";
    getTabDetails();
    setTimeout(() => {
        chrome.tabs.update(window.currentTab.id, { url: visLinkURL, active: true });
    }, 10);
    setTimeout(() => {
        window.close();
    }, 1000);
};

inputElement.addEventListener("input", event => {
    let labelForInput = document.getElementById("textarea1label");
    const value = inputElement.value;
    if (!value) {
        labelForInput.classList.remove("active");
        return;
    } else {
        labelForInput.classList.add("active");
        if (value.includes("?visconnectid=")) {
            connectToVislinkButton.classList.remove("disabled");
            connectToVislinkButton.removeAttribute("disabled");
        } else {
            let connectToVislinkButton = document.getElementById("connect-to-vislink");
            connectToVislinkButton.classList.add("disabled");
            connectToVislinkButton.setAttribute("disabled", "disabled");
        }
    }
});

let annotateAsLeaderButton = document.getElementById("annotate-as-leader");
annotateAsLeaderButton.addEventListener("click", () => {
    annotateAsLeaderPress();
    setTimeout(() => {
        window.close();
    }, 1000);
});

const annotateAsLeaderPress = () => {
    getTabDetails();
    setTimeout(() => {
        // console.log(window.tabBaseURL);
        // console.log(window.tabBaseURL.includes("?visconnect"));
        if (window.tabBaseURL.includes("?visconnect")) {
            const newUrl = window.tabBaseURL.slice(0, window.tabBaseURL.indexOf("?visconnect"));
            chrome.tabs.update(window.currentTab.id, { url: newUrl, active: true });
            annotateAsLeaderButton.innerText = "Start Annotating as Leader";
        } else {
            const newUrl = window.tabBaseURL + "?visconnect";
            chrome.tabs.update(window.currentTab.id, { url: newUrl, active: true });
            annotateAsLeaderButton.innerText = "Stop annotating";
        }
    }, 10);
};

const myFunction = () => {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(() => {
        x.className = x.className.replace("show", "");
    }, 3000);
};

const myFunction2 = () => {
    var z = document.getElementById("snackbar2");
    z.className = "show";
    setTimeout(() => {
        z.className = z.className.replace("show", "");
    }, 3000);
};

const checkBrowserWindowSize = () => {
    if (!window.tabBaseURL.startsWith("chrome") || window.tabBaseURL.startsWith("chrome-extension")) {
        if (window.tabBaseURL.startsWith("chrome-extension")) {
            
        }

        chrome.tabs.sendMessage(window.currentTab.id, { action: "getWindowSize" }, response => {
            // console.log(response.width);
            // console.log(response.height);
            // console.log(response.valid);
            // console.log(response.tooSmall);

            let textarea1 = document.getElementById("textarea1");
            let container = document.getElementsByClassName("container")[0];

            if (response) {
                if (response.valid) {
                    document.getElementById("resize-menu").style.display = "none";
                    document.getElementById("valid-menu").style.display = "block";

                    annotateAsLeaderButton.classList.toggle("disabled");
                    annotateAsLeaderButton.removeAttribute("disabled");

                    textarea1.removeAttribute("disabled");

                    myFunction();

                    chrome.tabs.sendMessage(window.currentTab.id, { action: "fadeHelper" }, response => {
                        // console.log(`Helper fading!: ${response.success}`);
                    });

                    clearInterval(recheckIntervalId);
                } else {
                    document.getElementById("resize-menu").style.display = "block";
                    document.getElementById("valid-menu").style.display = "none";

                    if (response.tooSmall) {
                        document.getElementById("resize-gif").src = "https://i.imgur.com/9G2skVN.gif";
                    } else {
                        document.getElementById("resize-gif").src = "https://i.imgur.com/pEAZPkl.gif";
                    }

                    annotateAsLeaderButton.classList.toggle("disabled");
                    annotateAsLeaderButton.setAttribute("disabled", "disabled");

                    textarea1.setAttribute("disabled", "disabled");
                }
            }
        });
    } else {
        myFunction2();
    }
};

setTimeout(checkBrowserWindowSize, 100);
var recheckIntervalId = setInterval(checkBrowserWindowSize, 4000);
