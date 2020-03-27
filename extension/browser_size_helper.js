const REQUIRED_WIDTH = 1280;
const REQUIRED_HEIGHT = 720;
const LEEWAY = 10;

let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;
let isValidWindowSize = false;
let isTooSmall = false;

const checkValidWindowSize = () => {
    if (
        windowWidth >= REQUIRED_WIDTH - LEEWAY &&
        windowWidth <= REQUIRED_WIDTH + LEEWAY &&
        windowHeight >= REQUIRED_HEIGHT - LEEWAY &&
        windowHeight <= REQUIRED_HEIGHT + LEEWAY
    ) {
        console.log(`Live Website Annotate Valid Window Size : ${windowWidth}px x ${windowHeight}px`);
        isValidWindowSize = true;

        if (document.getElementById("resizeBoxHelper") != null) {
            let resizeBoxHelperDiv = document.getElementById("resizeBoxHelper");
            resizeBoxHelperDiv.style.borderColor = "#7ac142";
        }
    } else {
        console.log(`Live Website Annotate Invalid Window Size: ${windowWidth}px x ${windowHeight}px`);
        isValidWindowSize = false;

        if (windowWidth < REQUIRED_WIDTH - LEEWAY && windowHeight < REQUIRED_HEIGHT - LEEWAY) {
            isTooSmall = true;
        } else {
            isTooSmall = false;
        }

        if (document.getElementById("resizeBoxHelper") != null) {
            let resizeBoxHelperDiv = document.getElementById("resizeBoxHelper");
            resizeBoxHelperDiv.style.borderColor = "#f44336";
        }
    }
};

const fadeOut = element => {
    var op = 1; // initial opacity
    var timer = setInterval(() => {
        if (op <= 0.1) {
            clearInterval(timer);
            element.style.display = "none";
        }
        element.style.opacity = op;
        element.style.filter = "alpha(opacity=" + op * 100 + ")";
        op -= op * 0.1;
    }, 100);
};

const displayWindowSize = () => {
    // Get width and height of the window excluding scrollbars
    windowWidth = document.documentElement.clientWidth;
    windowHeight = document.documentElement.clientHeight;
    checkValidWindowSize();
};

window.addEventListener("resize", displayWindowSize);
displayWindowSize();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "getWindowSize") {
        if (document.getElementById("resizeBoxHelper") == null) {
            let resizeBoxHelperDiv = document.createElement("div");
            resizeBoxHelperDiv.id = "resizeBoxHelper";
            document.body.insertAdjacentElement("afterbegin", resizeBoxHelperDiv);
        }
        document.getElementById("resizeBoxHelper").style.display = "block";
        document.getElementById("resizeBoxHelper").style.opacity = 1;
        displayWindowSize();
        sendResponse({
            width: windowWidth,
            height: windowHeight,
            valid: isValidWindowSize,
            tooSmall: isTooSmall
        });
    }

    if (request.action == "fadeHelper") {
        sendResponse({
            success: true
        });
        console.log(document.getElementById("resizeBoxHelper"));
        console.log(document.getElementById("resizeBoxHelper") == null);
        if (document.getElementById("resizeBoxHelper") != null) {
            fadeOut(document.getElementById("resizeBoxHelper"));
        }
    }
});
