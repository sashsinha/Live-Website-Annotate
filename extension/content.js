// let body = document.body;
// let bodyAttributes = [...body.attributes];
// let find = bodyAttributes.find(a => a.name === "collaboration");
// if (find !== undefined) {
//     console.log(find);
// } else {
//     body.setAttribute("collaboration", "live");
// }

let ranOnce = false;

let scrollWidth = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.body.clientWidth,
    document.documentElement.clientWidth
);

let scrollHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
);

console.log(scrollHeight);

const createCanvas = () => {
    if (!ranOnce) {
        var liveWebsiteAnnotateDiv = document.createElement('div');
        liveWebsiteAnnotateDiv.setAttribute("id", "live-website-annotate-div");
        liveWebsiteAnnotateDiv.setAttribute("collaboration", "live");
        document.body.appendChild(liveWebsiteAnnotateDiv);
        var ui = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        ui.setAttribute("id", "annotation-ui");
        ui.setAttribute("width", `${scrollWidth}px`);
        ui.setAttribute("height", `${scrollHeight}px`);
        liveWebsiteAnnotateDiv.appendChild(ui);
        var canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        canvas.setAttribute("id", "annotation-canvas");
        canvas.setAttribute("width", `${scrollWidth}px`);
        canvas.setAttribute("height", `${scrollHeight}px`);
        liveWebsiteAnnotateDiv.appendChild(canvas);
        ranOnce = true;
    }
};

createCanvas();

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

var ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        const cr = entry.contentRect;
        console.log("Element:", entry.target);
        console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
        x = Math.max(cr.width, scrollWidth);
        y = Math.max(cr.height, scrollHeight);
        let c = document.getElementById("annotation-canvas");
        c.setAttribute("width", `${x}px`);
        c.setAttribute("height", `${y}px`);
        let u = document.getElementById("annotation-ui");
        u.setAttribute("width", `${x}px`);
        u.setAttribute("height", `${y}px`);
    }
});

// Observe one or multiple elements
ro.observe(d.documentElement);
