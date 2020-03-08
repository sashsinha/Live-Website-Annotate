// Based on the following bl.ock: http://bl.ocks.org/nitaku/d79632a53187f8e92b15

(function() {
    let enabled = false; // drawing disabled

    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName("body")[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;
    x = Math.max(x, scrollWidth);
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    y = Math.max(y, scrollHeight);

    var SWATCH_D,
        active_color,
        active_line,
        canvas,
        drag,
        drawing_data,
        lines_layer,
        palette,
        redraw,
        render_line,
        swatches,
        trash_btn,
        ui;

    SWATCH_D = 32;
    render_line = d3
        .line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveBasis);

    drawing_data = {
        lines: []
    };

    active_line = {};
    active_color = {};
    const default_color = "#333333";
    let active_local_color = default_color;

    canvas = d3.select("#annotation-canvas");
    lines_layer = canvas.append("g");
    ui = d3.select("#ui");
    palette = ui
        .append("g")
        .attr("transform", "translate(" + (x - 135 + SWATCH_D / 2) + "," + (y - 935 + SWATCH_D / 2) + ")")
        .classed("color-palette", true);

    swatches = palette
        .selectAll(".swatch")
        .data([
            "#333333",
            "#ffffff",
            "#1b9e77",
            "#d95f02",
            "#7570b3",
            "#e7298a",
            "#66a61e",
            "#e6ab02",
            "#a6761d",
            "#666666"
        ]);

    var icons2 = ["trash", "pencil", "warning"];

    var hoveredStyle = { color: "white" };
    var defaultStyle = { color: "#3E68B5", cursor: "pointer" };

    d3.select("body")
        .selectAll("i")
        .data(icons2)
        .enter()
        .append("i")
        .attr("class", function(d) {
            return "icon fa fa-5x fa-" + d;
        })
        .styles(defaultStyle)
        .on("mouseover", function() {
            d3.select(this).styles(hoveredStyle);
        })
        .on("mouseout", function() {
            d3.select(this).styles(defaultStyle);
        })
        .on("mouseup", function() {
            d3.select(this).styles(hoveredStyle);
        });

    var trashStyle = {
        padding: "30px 34px 30px 34px",
        "border-radius": "10px",
        stroke: "none",
        width: "100px",
        height: "100px",
        cursor: "pointer",
        position: "fixed",
        bottom: "170px",
        right: "50px",
        "z-index": 2147483647,
        "background-color": "rgba(220, 220, 220, 0.8)",
        color: "#3E68B5",
        "font-size": "40px"
    };
    d3.select(".fa-trash")
        .styles(trashStyle)
        .on("mousedown", function(d) {
            drawing_data.lines = [];
            return redraw();
        });

    var pointerEventsStyle = {
        padding: "30px 34px 30px 34px",
        "border-radius": "10px",
        stroke: "none",
        width: "100px",
        height: "100px",
        cursor: "pointer",
        position: "fixed",
        bottom: "293px",
        right: "50px",
        "z-index": 2147483647,
        "background-color": "rgba(220, 220, 220, 0.8)",
        color: "#3E68B5",
        "font-size": "40px"
    };
    d3.select(".fa-pencil")
        .classed("pointer", true)
        .styles(pointerEventsStyle)
        .on("mousedown", function(d) {
            let c = document.getElementById("annotation-canvas");
            if (!enabled) {
                c.style["pointer-events"] = "stroke";
                c.style["background"] = "rgb(255, 0, 0, 0.1)";
                document.body.style["userSelect"] = "none";
            } else {
                c.style["pointer-events"] = "none";
                c.style["background"] = "transparent";
                document.body.style["userSelect"] = "auto";
            }
            enabled = !enabled;
        });

    let pointerEventsButton = document.getElementsByClassName("pointer")[0];

    const pointerEventsToggle = _event => {
        if (pointerEventsButton.classList.contains("fa-pencil")) {
            pointerEventsButton.classList.remove("fa-pencil");
            pointerEventsButton.classList.add("fa-mouse-pointer");
        } else {
            pointerEventsButton.classList.remove("fa-mouse-pointer");
            pointerEventsButton.classList.add("fa-pencil");
        }
    };

    pointerEventsButton.addEventListener("click", pointerEventsToggle);

    const swatchEnter = swatches.enter().append("circle");

    swatchEnter
        .attr("class", "swatch")
        .attr("cy", function(d, i) {
            return (i * (SWATCH_D + 4)) / 2;
        })
        .attr("cx", function(d, i) {
            if (i % 2) {
                return SWATCH_D;
            } else {
                return 0;
            }
        })
        .attr("r", SWATCH_D / 2)
        .attr("fill", d => d)
        .on("click", function(d) {
            active_color[d3.event.collaboratorId] = d;
            if (d3.event.isLocalEvent) {
                active_local_color = d;
                palette.selectAll(".swatch").classed("active", false);
                return d3.select(this).classed("active", true);
            }
        });

    swatchEnter.each(function(d) {
        if (d === active_local_color) {
            return d3.select(this).classed("active", true);
        }
    });

    var pallateStyle = {
        padding: "30px 34px 30px 34px",
        "border-radius": "10px",
        stroke: "none",
        width: "100px",
        height: "230px",
        cursor: "pointer",
        position: "fixed",
        bottom: "416px",
        right: "50px",
        "z-index": -1,
        "background-color": "rgba(220, 220, 220, 0.8)",
        color: "transparent",
        "font-size": "40px"
    };
    d3.select(".fa-warning").styles(pallateStyle);

    drag = vc.drag(); // = d3.drag();
    var rafRequest = 0;

    drag.on("start", function() {
        active_line[d3.event.sourceEvent.collaboratorId] = {
            points: [],
            color: active_color[d3.event.sourceEvent.collaboratorId] || default_color
        };
        drawing_data.lines.push(active_line[d3.event.sourceEvent.collaboratorId]);
        redraw();
    });

    drag.on("drag", function() {
        if (active_line[d3.event.sourceEvent.collaboratorId]) {
            active_line[d3.event.sourceEvent.collaboratorId].points.push(d3.mouse(this));
            if (!rafRequest) {
                rafRequest = requestAnimationFrame(redraw.bind(this));
            }
        }
    });

    drag.on("end", function() {
        if (
            active_line[d3.event.sourceEvent.collaboratorId] &&
            active_line[d3.event.sourceEvent.collaboratorId].points.length === 0
        ) {
            drawing_data.lines.pop();
        }
        active_line[d3.event.sourceEvent.collaboratorId] = null;
    });

    canvas.call(drag);

    redraw = function() {
        rafRequest = 0;
        const lines = lines_layer.selectAll(".line").data(drawing_data.lines);
        const enter = lines.enter();

        enter
            .append("path")
            .attr("class", "line")
            .attr("stroke", function(d) {
                return d.color;
            })
            .each(function(d) {
                return (d.elem = d3.select(this));
            });

        lines.attr("d", function(d) {
            return render_line(d.points);
        });
        lines.exit().remove();
    };

    redraw();

    function updateWindow() {
        x = w.innerWidth || e.clientWidth || g.clientWidth;
        x = Math.max(x, scrollWidth);
        y = w.innerHeight || e.clientHeight || g.clientHeight;
        y = Math.max(y, scrollHeight);
        d3.select(".color-palette")
            .attr("transform", "translate(" + (x - 135 + SWATCH_D / 2) + "," + (y - 935 + SWATCH_D / 2) + ")")
            .classed("color-palette", true);
    }

    window.onresize = updateWindow;
}.call(this));
