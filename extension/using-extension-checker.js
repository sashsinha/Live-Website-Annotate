const currentURL = location.href;

if (!currentURL.endsWith("?lwa")) {
    console.log("ERROR: Enter the VisConnect link in the Live Website Annotate Interface.")
    location.replace("https://live-website-annotate.surge.sh/use-chrome-extension-interface.html")
}