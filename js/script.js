const BOTLOGCON_JS = {
    interval: 60,
    elements: {
        section: {
            wrapper: document.getElementById("wrapper")
        },
        select: {
            interval: document.getElementById("slc-interval")
        },
        button: {
            copy: document.getElementById("btn-copy"),
            save: document.getElementById("btn-save"),
            print: document.getElementById("btn-print"),
            json: document.getElementById("btn-json")
        },
        ul: {
            logs: document.getElementById("ul-logs")
        },
        small: {
            desc: document.getElementById("sm-desc"),
        },
        label: {
            desc: document.getElementById("sm-desc"),
        }
    },
    cookies: {
        set: (name, value, expires) => {
            try {
                let d = new Date();
                d.setTime(d.getTime() + (expires * 24 * 60 * 60 * 1000));

                let cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;

                document.cookie = cookie;
            }
            catch (e) { }
        },
        get: (name) => {
            let value = null;

            try {
                let cookies = document.cookie.split(';');

                cookies.forEach((cookie) => {
                    if ((cookie + "=").trim().indexOf(name) == 0)
                        value = cookie.substring(name.length + 2, cookie.length);
                });
            }
            catch (e) { }

            return { name, value };
        },
        load: () => {
            let _interval = BOTLOGCON_JS.cookies.get("botlogconjs_interval");

            if (!_interval.value)
                BOTLOGCON_JS.cookies.set("botlogconjs_interval", BOTLOGCON_JS.interval.toString(), 365);
            else
                BOTLOGCON_JS.elements.select.interval.value = BOTLOGCON_JS.interval = parseInt(_interval.value.toString());
        }
    },
    logs: {
        engine: {
            request: async () => {
                let ok = false;
                let status = 0;

                try {
                    if (navigator.onLine) {
                        let res = await fetch("https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js");

                        ok = res.ok;
                        status = res.status;
                    }
                } catch (e) { }

                return { ok, status };
            },
            createFile: (text, filename) => {
                let blob = new Blob([text], { type: "octet/stream" });
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement("a");

                a.style = "display: none";
                a.href = url;
                a.download = filename;

                document.body.appendChild(a);
                a.click();

                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            record: async () => {
                let date = new Date();
                let res = await BOTLOGCON_JS.logs.engine.request();
                let id = (BOTLOGCON_JS.elements.ul.logs.getElementsByTagName("li").length + 1);
                let online = (res.ok && (res.status >= 200 && res.status < 300));

                let log = { date, res, id, online };

                BOTLOGCON_JS.logs.engine.writeLine(log);
                BOTLOGCON_JS.logs.engine.setTheme(log);
            },
            writeLine: (log) => {
                let html = `<li data-online="${log.online}" data-json='${JSON.stringify(log)}'><small>${log.id.toString().padStart(7, "0")} - ${log.date.toLocaleDateString()} ${log.date.toLocaleTimeString()} / <strong>(${log.res.status}) ${log.online ? "ONLINE" : "OFF-LINE"}</strong></small></li>`;

                BOTLOGCON_JS.elements.ul.logs.innerHTML = (html + BOTLOGCON_JS.elements.ul.logs.innerHTML);
            },
            setTheme: (log) => {
                BOTLOGCON_JS.elements.section.wrapper.setAttribute("data-online", (log.online ? "true" : "false"));

                document.title = `botlogcon.js | ${(log.online ? "Online" : "Off-Line")}`;
                document.querySelector("link[rel='icon']").setAttribute("href", "img/" + (log.online ? "online" : "offline") + ".png");
            }
        },
        copy: () => {
            let s = BOTLOGCON_JS.logs.toString();

            if (window.clipboardData && window.clipboardData.setData) {
                return clipboardData.setData("Text", s);
            }
            else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                var textarea = document.createElement("textarea");

                textarea.textContent = s;
                textarea.style.position = "fixed";

                document.body.appendChild(textarea);
                textarea.select();

                try {
                    return document.execCommand("copy");
                }
                catch (ex) {
                    return false;
                }
                finally {
                    document.body.removeChild(textarea);
                }
            }

            setClipboardData(s);
        },
        toString: () => {
            return `botlogcon.js\n\n${BOTLOGCON_JS.elements.small.desc.innerText}\nMade by Gérison Sabino -> https://www.gerisonsabino.com\n\n${BOTLOGCON_JS.elements.ul.logs.innerText}`;
        },
        toJson: () => {
            let json = { logs: new Array() };
            let logs = BOTLOGCON_JS.elements.ul.logs.getElementsByTagName("li");

            for (let log of logs) {
                json.logs.unshift(JSON.parse(log.getAttribute("data-json")));
            }

            return `//botlogcon.js\n//${BOTLOGCON_JS.elements.small.desc.innerText}\n//Made by Gérison Sabino -> https://www.gerisonsabino.com\n${JSON.stringify(json)}`;
        }
    },
    run: () => {
        BOTLOGCON_JS.logs.engine.record();

        setTimeout(() => {
            BOTLOGCON_JS.run();
        }, BOTLOGCON_JS.interval * 1000);
    },
    load: () => {
        BOTLOGCON_JS.cookies.load();
        BOTLOGCON_JS.elements.ul.logs.innerHTML = "";

        BOTLOGCON_JS.elements.select.interval.addEventListener("change", () => {
            BOTLOGCON_JS.cookies.set("botlogconjs_interval", BOTLOGCON_JS.elements.select.interval.value, 365);
            location.reload();
        });

        BOTLOGCON_JS.elements.button.print.addEventListener("click", () => {
            window.print();
        });

        BOTLOGCON_JS.elements.button.copy.addEventListener("click", () => {
            BOTLOGCON_JS.elements.button.copy.getElementsByTagName("small")[0].innerHTML = "Copied";

            setTimeout(() => {
                BOTLOGCON_JS.elements.button.copy.getElementsByTagName("small")[0].innerHTML = "Copy";
            }, 750);

            BOTLOGCON_JS.logs.copy();
        });

        BOTLOGCON_JS.elements.button.save.addEventListener("click", () => {
            BOTLOGCON_JS.logs.engine.createFile(BOTLOGCON_JS.logs.toString(), "botlogconjs_logs.txt");
        });

        BOTLOGCON_JS.elements.button.json.addEventListener("click", () => {
            BOTLOGCON_JS.logs.engine.createFile(BOTLOGCON_JS.logs.toJson(), "botlogconjs_logs.json");
        });

        BOTLOGCON_JS.run();
    }
};

window.addEventListener("load", () => {
    window.dataLayer = window.dataLayer || [];

    function gtag() {
        dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', 'G-YXNCPPFVCW');

    BOTLOGCON_JS.load();
});

window.addEventListener("beforeunload", (e) => {
    if (e || window.event) 
        e.returnValue = 'Reload page?';

    return 'Reload page?';
});