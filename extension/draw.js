// Based on the following bl.ock: http://bl.ocks.org/nitaku/d79632a53187f8e92b15

(function () {
    var b = document.body;

    b.insertAdjacentHTML(
        "afterbegin",
        `<div id="lds-ring-loading" class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    );

    setTimeout(() => {
        document.getElementById("lds-ring-loading").style.display = "none";

        let chat_enabled = false;

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
            ui,
            controlsPalette;

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

        active_control = {};
        const default_control = "icons/mouse-pointer-solid";
        let active_local_control = default_control;

        canvas = d3.select("#annotation-canvas");
        lines_layer = canvas.append("g");
        ui = d3.select("#annotation-ui");
        palette = ui
            .append("g")
            .attr(
                "transform",
                "translate(" +
                (document.documentElement.clientWidth - 136 + SWATCH_D / 2) +
                "," +
                (document.documentElement.clientHeight - 666 + SWATCH_D / 2) +
                ")"
            )
            .style("display", "none")
            .classed("color-palette", true);

        controlsPalette = ui
            .append("g")
            .attr(
                "transform",
                "translate(" +
                (document.documentElement.clientWidth - 165 + SWATCH_D / 2) +
                "," +
                (document.documentElement.clientHeight - 832 + SWATCH_D / 2) +
                ")"
            )
            .style("display", "none")
            .classed("controls-palette", true);

        swatches = palette
            .selectAll(".swatch")
            .data([
                "#333333", // black
                "#ffffff", // white
                "#959697", // gray
                "#FF1493", // pink
                "#8527AF", // purple
                "#2772F7", // blue
                "#32cd32", // green
                "#FFFF00", // yellow
                "#FFA500", // orange
                "#FF0000", // red
            ]);

        controls = controlsPalette
            .selectAll(".swatch")
            .data([
                "icons/mouse-pointer-solid",
                "icons/highlighter-solid",
                "icons/pencil-alt-solid"
            ]);

        trash_btn = ui.append('text').html('')
            .attr("class", 'btn')
            .attr("id", "trash")
            .on('click', function () {
                drawing_data.lines = [];
                return redraw();
            });

        const swatchEnter = swatches.enter().append("circle");

        swatchEnter
            .attr("class", "swatch")
            .attr("cy", function (d, i) {
                if (i % 2) {
                    return ((i - 1) * (SWATCH_D + 8)) / 2;
                } else {
                    return (i * (SWATCH_D + 8)) / 2;
                }
            })
            .attr("cx", function (d, i) {
                if (i % 2) {
                    return SWATCH_D + 8;
                } else {
                    return 0;
                }
            })
            .attr("r", SWATCH_D / 2)
            .attr("fill", d => d)
            .on("click", function (d) {
                active_color[d3.event.collaboratorId] = d;
                if (d3.event.isLocalEvent) {
                    active_local_color = d;
                    palette.selectAll(".swatch").classed("active", false);
                    return d3.select(this).classed("active", true);
                }
            });

        swatchEnter.each(function (d) {
            if (d === active_local_color) {
                return d3.select(this).classed("active", true);
            }
        });

        const controlsEnter = controls.enter().append("svg:image");

        controlsEnter
            .attr("class", "control")
            .attr("id", function (d) {
                if (d == "icons/mouse-pointer-solid") {
                    return "pointer-action";
                } else if (d == "icons/pencil-alt-solid") {
                    return "pencil-action";
                } else if (d == "icons/highlighter-solid") {
                    return "highlighter-action";
                }
            })
            .attr("width", function (d) {
                if (d == "icons/mouse-pointer-solid") {
                    return "50";
                } else if (d == "icons/pencil-alt-solid") {
                    return "20";
                } else if (d == "icons/highlighter-solid") {
                    return "20";
                }
            })
            .attr("height", function (d) {
                if (d == "icons/mouse-pointer-solid") {
                    return "50";
                } else if (d == "icons/pencil-alt-solid") {
                    return "20";
                } else if (d == "icons/highlighter-solid") {
                    return "20";
                }
            })
            .attr("href", d => {
                if (d == active_local_control) {
                    return `${chrome.runtime.getURL(d + ".svg")}`
                } else {
                    return `${chrome.runtime.getURL(d + "-gray.svg")}`
                }
            })
            .attr("y", function (d, i) {
                if (d == "icons/mouse-pointer-solid") {
                    return "10";
                } else if (d == "icons/pencil-alt-solid") {
                    return "70";
                } else if (d == "icons/highlighter-solid") {
                    return "70";
                }
            })
            .attr("x", function (d, i) {
                if (d == "icons/mouse-pointer-solid") {
                    return "25";
                } else if (d == "icons/pencil-alt-solid") {
                    return "10";
                } else if (d == "icons/highlighter-solid") {
                    return "70";
                }
            })
            .on("click", function (d) {
                active_control[d3.event.collaboratorId] = d;

                if (d3.event.isLocalEvent) {
                    active_local_control = d;

                    var cursorTransition = d3.select("#pointer-action").transition();
                    var penTransition = d3.select("#pencil-action").transition();
                    var highlighterTransition = d3.select("#highlighter-action").transition();

                    if (active_local_control == "icons/pencil-alt-solid") {

                        cursorTransition.attr("transform", "translate(45,60)").duration(500);
                        cursorTransition.attr("href", `${chrome.runtime.getURL("icons/mouse-pointer-solid-gray.svg")}`).duration(500);
                        cursorTransition.style("width", "20").duration(500);
                        cursorTransition.style("height", "20").duration(500);

                        penTransition.attr("transform", "translate(15,-60)").duration(500);
                        penTransition.attr("href", `${chrome.runtime.getURL("icons/pencil-alt-solid.svg")}`).duration(500);
                        penTransition.style("width", "50").duration(500);
                        penTransition.style("height", "50").duration(500);

                        highlighterTransition.attr("transform", "translate(-60,0)").duration(500);
                        highlighterTransition.attr("href", `${chrome.runtime.getURL("icons/highlighter-solid-gray.svg")}`).duration(500);
                        highlighterTransition.style("width", "20").duration(500);
                        highlighterTransition.style("height", "20").duration(500);

                        document.getElementById("annotation-canvas").style["pointer-events"] = "stroke";
                        document.body.style["userSelect"] = "none";
                    } else if (active_local_control == "icons/highlighter-solid") {

                        cursorTransition.attr("transform", "translate(-15,60)").duration(500);
                        cursorTransition.attr("href", `${chrome.runtime.getURL("icons/mouse-pointer-solid-gray.svg")}`).duration(500);
                        cursorTransition.style("width", "20").duration(500);
                        cursorTransition.style("height", "20").duration(500);

                        penTransition.attr("transform", "translate(60,0)").duration(500);
                        penTransition.attr("href", `${chrome.runtime.getURL("icons/pencil-alt-solid-gray.svg")}`).duration(500);
                        penTransition.style("width", "20").duration(500);
                        penTransition.style("height", "20").duration(500);

                        highlighterTransition.attr("transform", "translate(-45,-60)").duration(500);
                        highlighterTransition.attr("href", `${chrome.runtime.getURL("icons/highlighter-solid.svg")}`).duration(500);
                        highlighterTransition.style("width", "50").duration(500);
                        highlighterTransition.style("height", "50").duration(500);

                        document.getElementById("annotation-canvas").style["pointer-events"] = "stroke";
                        document.body.style["userSelect"] = "none";
                    } else if (active_local_control == "icons/mouse-pointer-solid") {

                        cursorTransition.attr("transform", "translate(0,0)").duration(500);
                        cursorTransition.attr("href", `${chrome.runtime.getURL("icons/mouse-pointer-solid.svg")}`).duration(500);
                        cursorTransition.style("width", "50").duration(500);
                        cursorTransition.style("height", "50").duration(500);

                        penTransition.attr("transform", "translate(0,0)").duration(500);
                        penTransition.attr("href", `${chrome.runtime.getURL("icons/pencil-alt-solid-gray.svg")}`).duration(500);
                        penTransition.style("width", "20").duration(500);
                        penTransition.style("height", "20").duration(500);

                        highlighterTransition.attr("transform", "translate(0,0)").duration(500);
                        highlighterTransition.attr("href", `${chrome.runtime.getURL("icons/highlighter-solid-gray.svg")}`).duration(500);
                        highlighterTransition.style("width", "20").duration(500);
                        highlighterTransition.style("height", "20").duration(500);

                        document.getElementById("annotation-canvas").style["pointer-events"] = "none";
                        document.getElementById("annotation-canvas").style["background"] = "transparent";
                        document.body.style["userSelect"] = "auto";
                    }
                }
            })
            .on("mouseover", function (d) {
                d3.select(this).attr("href", d =>
                    `${chrome.runtime.getURL(d + "-white.svg")}`
                );
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("href", d => {
                    if (d === active_local_control) {
                        return `${chrome.runtime.getURL(d + ".svg")}`
                    } else {
                        return `${chrome.runtime.getURL(d + "-gray.svg")}`
                    }
                });
            })
            .append("svg:title")
            .text(function (d, i) {
                if (d == "icons/mouse-pointer-solid") {
                    return "Select Pointer";
                } else if (d == "icons/pencil-alt-solid") {
                    return "Select Pencil";
                } else if (d == "icons/highlighter-solid") {
                    return "Select Highlighter";
                }
            });

        drag = vc.drag(); // = d3.drag();
        var rafRequest = 0;

        drag.on("start", function () {
            active_line[d3.event.sourceEvent.collaboratorId] = {
                points: [],
                color: active_color[d3.event.sourceEvent.collaboratorId] || default_color,
                control: active_control[d3.event.sourceEvent.collaboratorId] || default_control
            };
            drawing_data.lines.push(active_line[d3.event.sourceEvent.collaboratorId]);
            redraw();
        });

        drag.on("drag", function () {
            if (active_line[d3.event.sourceEvent.collaboratorId]) {
                active_line[d3.event.sourceEvent.collaboratorId].points.push(vc.mouse(this));
                if (!rafRequest) {
                    rafRequest = requestAnimationFrame(redraw.bind(this));
                }
            }
            // console.log(document.querySelectorAll(":hover"));
        });

        drag.on("end", function () {
            if (
                active_line[d3.event.sourceEvent.collaboratorId] &&
                active_line[d3.event.sourceEvent.collaboratorId].points.length === 0
            ) {
                drawing_data.lines.pop();
            }
            active_line[d3.event.sourceEvent.collaboratorId] = null;
        });

        canvas.call(drag);

        redraw = function () {
            rafRequest = 0;
            const lines = lines_layer.selectAll(".line").data(drawing_data.lines);
            const enter = lines.enter();

            enter
                .append("path")
                .attr("class", "line")
                .attr("stroke", function (d) {
                    return d.color;
                })
                .attr("stroke-width", function (d) {
                    if (d.control == "icons/highlighter-solid") {
                        return "15px";
                    } else {
                        return "2px";
                    }
                })
                .attr("stroke-opacity", function (d) {
                    if (d.control == "icons/highlighter-solid") {
                        return ".4";
                    } else {
                        return "1";
                    }
                })
                .each(function (d) {
                    return (d.elem = d3.select(this));
                });

            lines.attr("d", function (d) {
                return render_line(d.points);
            });
            lines.exit().remove();
        };

        redraw();

        const isLeader = () => {
            let url = window.location.href;
            return !url.includes("?visconnectid=");
        };

        // var b = document.getElementById("live-website-annotate-div");
        var b = document.body;

        b.insertAdjacentHTML(
            "beforeend",
            `<div id="controls-background">
            </div>`
        );

        b.insertAdjacentHTML(
            "beforeend",
            `<div id="palette-background">
                <img
                    id="trash-btn-img"
                    src=${chrome.runtime.getURL("icons/trash-alt-solid.svg")} 
                    alt="delete"
                    title="Delete Annotation"
                />
            </div>`
        );

        let trashBtnImg = document.getElementById("trash-btn-img");
        trashBtnImg.addEventListener("mouseover", function () {
            trashBtnImg.src = `${chrome.runtime.getURL("icons/trash-alt-solid-white.svg")}`;
            trashBtnImg.style.cursor = "pointer";
        });
        trashBtnImg.addEventListener("mouseout", function () {
            trashBtnImg.src = `${chrome.runtime.getURL("icons/trash-alt-solid.svg")}`;
            trashBtnImg.style.cursor = "pointer";
        });
        trashBtnImg.addEventListener("click", _e => {
            d3.select('#trash').dispatch('click');
        });


        b.insertAdjacentHTML(
            "beforeend",
            `<div id="chat-btn-background">
                <img
                    id="chat-btn-img"
                    src=${chrome.runtime.getURL("icons/comment-solid.svg")} 
                    alt="chat"
                    title="Chat"
                />
            </div>`
        );

        const randomAlphaNumeric = btoa(Math.random()).substr(3, 3);

        b.insertAdjacentHTML(
            "beforeend",
            `<div id="chat-background">
                <div id="lds-ring-chat" class="lds-ring"><div></div><div></div><div></div><div></div></div>
                <div id="chat-title"><span><b>Current Chat Name:</b></span>
                    <input class="live-web-annotate-input" id="live-web-annotate-chat-nick" size="60" value="Anon-${randomAlphaNumeric}" type="text" name="nick" autocomplete="off" maxlength="10" />
                </div>
                <div id="live-web-annotate-chat"></div>
                <input class="live-web-annotate-input" id="live-web-annotate-chat-input" size="60" type="text" name="message" autocomplete="off" />
            </div>`
        );

        setTimeout(() => {
            document.getElementById("lds-ring-chat").style.display = "none";
            document.getElementById("live-web-annotate-chat").style.display = "block";
            document.getElementById("chat-title").style.display = "flex";
            document.getElementById("live-web-annotate-chat-input").style.display = "block";
        }, 3000);

        document.getElementById("live-web-annotate-chat-input").addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('live-web-annotate-chat-nick').value == "") {
                    document.getElementById('live-web-annotate-chat-nick').value = `Anon-${randomAlphaNumeric}`;
                }
                const data = {
                    sender: document.getElementById('live-web-annotate-chat-nick').value,
                    text: document.getElementById('live-web-annotate-chat-input').value,
                    time: Date.now()
                };
                const event = new CustomEvent('chat-message', { detail: data });
                document.body.dispatchEvent(event);
                document.getElementById('live-web-annotate-chat-input').value = "";
            }
        });

        const messages = [];
        document.body.addEventListener('chat-message', (e) => {
            messages.push(e.detail);
            rerender();
        });

        function rerender() {
            const chat = d3.select('#live-web-annotate-chat');
            const msgs = chat.selectAll('.msg').data(messages);
            msgs.enter().append('div').attr('class', 'msg').html((d) => {
                if (d.sender == document.getElementById('live-web-annotate-chat-nick').value) {
                    return `<b id="local-chat-msg">${d.sender}</b>: ${d.text}`;
                } else {
                    return `<b>${d.sender}</b>: ${d.text}`;
                }
            });
        }
        
        // let messages = document.getElementById("messages");
        // let textbox = document.getElementById("sendMessageBox");
        // let sendButton = document.getElementById("sendButton");

        // sendButton.addEventListener("click", function () {
        //     if (textbox.value) {
        //         let newMessage = document.createElement("li");
        //         newMessage.innerHTML = `<span class="you" style="color:${active_local_color}"><b>You</b>: </span>` + textbox.value;
        //         messages.appendChild(newMessage);
        //         textbox.value = "";
        //     }
        // });
        
        let chatBackground = document.getElementById("chat-background");
        let chatBtnImg = document.getElementById("chat-btn-img");
        chatBtnImg.addEventListener("mouseover", function () {
            if (chat_enabled) {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-slash-solid-white.svg")}`;
            } else {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-solid-white.svg")}`;
            }
            chatBtnImg.style.cursor = "pointer";
        });
        chatBtnImg.addEventListener("mouseout", function () {
            if (chat_enabled) {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-slash-solid.svg")}`;
                chatBtnImg.style.width = `63px`;
                chatBtnImg.style.height = `63px`;
            } else {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-solid.svg")}`;
                chatBtnImg.style.width = `50px`;
                chatBtnImg.style.height = `50px`;
            }
            chatBtnImg.style.cursor = "pointer";
        });
        chatBtnImg.addEventListener("click", _e => {
            if (chat_enabled) {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-slash-solid.svg")}`;
                chatBackground.style.display = "none";
            } else {
                chatBtnImg.src = `${chrome.runtime.getURL("icons/comment-solid.svg")}`;
                chatBackground.style.display = "flex";
            }
            chat_enabled = !chat_enabled;
            d3.select("#chat-btn-img").dispatch("mouseout");
            d3.select("#chat-btn-img").dispatch("mouseover");
        });

        const updatePalette = () => {
            let clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;

            d3.select(".color-palette")
                .attr(
                    "transform",
                    "translate(" +
                    (document.documentElement.clientWidth - 136 + SWATCH_D / 2) +
                    "," +
                    (document.documentElement.clientHeight - 540 + SWATCH_D / 2) +
                    ")"
                );

            d3.select(".controls-palette")
                .attr(
                    "transform",
                    "translate(" +
                    (document.documentElement.clientWidth - 165 + SWATCH_D / 2) +
                    "," +
                    (document.documentElement.clientHeight - 690 + SWATCH_D / 2) +
                    ")"
                )

            d3.select(".color-palette").style("display", "block");
            d3.select(".controls-palette").style("display", "block");
            d3.select("#visconnect-container").style("display", "flex");
            d3.select("html").style("cursor", "unset");
        };
        window.onresize = updatePalette;
        updatePalette();
    }, 2000);
}.call(this));
