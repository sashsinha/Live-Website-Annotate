let body = document.body;
let bodyAttributes = [...body.attributes];
let find = bodyAttributes.find(a => a.name === "collaboration");
if (find !== undefined) {
    console.log(find);
} else {
    body.setAttribute("collaboration", "live");
}

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

const createCanvas = () => {
    if (!ranOnce) {
        var canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        canvas.setAttribute("id", "annotation-canvas");
        canvas.setAttribute("width", `${scrollWidth}px`);
        canvas.setAttribute("height", `${scrollHeight}px`);
        document.body.appendChild(canvas);
        var ui = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        ui.setAttribute("id", "ui");
        ui.setAttribute("width", `${scrollWidth}px`);
        ui.setAttribute("height", `${scrollHeight}px`);
        document.body.appendChild(ui);
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

function updateWindow() {
    x = w.innerWidth || e.clientWidth || g.clientWidth;
    x = Math.max(x, scrollWidth);
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    y = Math.max(y, scrollHeight);
    let c = document.getElementById("annotation-canvas");
    c.setAttribute("width", `${x}px`);
    c.setAttribute("height", `${y}px`);
    let u = document.getElementById("ui");
    u.setAttribute("width", `${x}px`);
    u.setAttribute("height", `${y}px`);
}

window.onresize = updateWindow;
