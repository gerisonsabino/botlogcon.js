const _QUERYSTRING = window.location.search;
const _URLPARAMS = new URLSearchParams(_QUERYSTRING);
const _INTERVAL = (_URLPARAMS.has("interval") ? parseInt(_URLPARAMS.get('interval')) : parseInt(document.getElementById("slc-interval").value));
const _REQUESTURLS = ["https://jsonplaceholder.typicode.com/todos", "https://dummyjson.com/todos"];

const wrapper = document.getElementById("wrapper");
const ul_logs = document.getElementById("ul-logs");
const slc_interval = document.getElementById("slc-interval");
const btn_print = document.getElementById("btn-print");
const btn_copy = document.getElementById("btn-copy");
const btn_save = document.getElementById("btn-save");
const btn_json = document.getElementById("btn-json");

const response = async (url) => {
    try {
        if (navigator.onLine) {
            let res = await fetch(url);
            return res;
        }
    } catch (e) { }

    return { ok: false, status: 0 };
};

const request = async () => {
    let url = getURL();
    let log = createLog(url, new Date(), await response(url));

    log.writeLine();

    if (wrapper.getAttribute("data-online") !== log.online.toString()) {
        log.setTheme();
    }
};

const logsToString = () => {
    return "botlogcon.js\n\nRobô (Bot), desenvolvido em JavaScript, para registro de logs sobre o estado atual da conexão com a internet (online/off-line).\n\nDesenvolvido por Gérison Sabino -> https://www.gerisonsabino.com\n\n" + document.getElementById("ul-logs").innerText;
}

const createLog = (url, date, response) => {
    let log = new Object();

    log.id = (ul_logs.getElementsByTagName("li").length + 1);
    log.online = (response.ok && (response.status >= 200 && response.status < 300));
    log.date = date;

    log.request = {
        url: url
    };

    log.response = {
        ok: response.ok,
        code: (response.status == undefined ? 0 : response.status)
    };

    log.writeLine = () => {
        let html = "";
        
        html += "<li data-online='" + log.online + "' data-json='" + JSON.stringify(log) + "'>";
        html += "   <small>" + log.id.toString().padStart(7, '0') + " - " + log.date.toLocaleDateString() + " " + log.date.toLocaleTimeString() + " -> <strong>(" + log.response.code + ") " + (log.online ? "ONLINE" : "OFF-LINE") + "</strong></small>";
        html += "</li>";

        ul_logs.innerHTML = (html + ul_logs.innerHTML);
    };

    log.setTheme = () => {
        wrapper.setAttribute("data-online", (log.online ? "true" : "false"));
        document.getElementsByTagName("title")[0].innerText = "botlogcon.js • " + (log.online ? "Online" : "Off-Line");
        document.getElementsByTagName("link")[0].setAttribute("href", "img/icon-" + (log.online ? "online" : "offline") + ".ico");
    };

    return log;
}

const createFile = (text, filename) => {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    let blob = new Blob([text], {type: "octet/stream"});
    let url = window.URL.createObjectURL(blob);

    a.href = url;
    
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

const getURL = () => {
    return `${_REQUESTURLS[Math.floor(Math.random() * _REQUESTURLS.length)]}/${Math.floor((Math.random() * 150) + 1)}`; 
}

window.addEventListener("load", () => {
    request(); 
    setInterval(request, (_INTERVAL * 1000));

    ul_logs.innerHTML = "";
    slc_interval.value = _INTERVAL.toString();

    slc_interval.addEventListener("change", () => { 
        location.href = location.href.split("?")[0] + "?interval=" + slc_interval.value; 
    });

    btn_print.addEventListener("click", () => {
        window.print(); 
    });

    btn_copy.addEventListener("click", () => {
        btn_copy.getElementsByTagName("span")[0].innerHTML = "Copiado";
        setTimeout("document.getElementById('btn-copy').getElementsByTagName('span')[0].innerHTML = 'Copiar';", 3000);

        let s = logsToString();

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
    
        setClipboardData(logsToText());
    });

    btn_save.addEventListener("click", () => { 
        createFile(logsToString(), "botlogcon.js.txt");
    });

    btn_json.addEventListener("click", () => {
        let json = { logs: new Array() };

        let logs = ul_logs.getElementsByTagName("li");

        for (let i = 0; i < logs.length; i++) {
            json.logs.unshift(JSON.parse(logs[i].getAttribute("data-json")));
        }

        createFile(JSON.stringify(json), "botlogcon.js.json");
    });
});

window.addEventListener("beforeunload", (e) => {
    if (e || window.event) {
        e.returnValue = 'Deseja realmente sair?';
    }

    return 'Deseja realmente sair?';
});