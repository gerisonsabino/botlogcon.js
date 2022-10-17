const _QUERYSTRING = window.location.search;
const _URLPARAMS = new URLSearchParams(_QUERYSTRING);
const _INTERVAL = (_URLPARAMS.has("interval") ? parseInt(_URLPARAMS.get('interval')) : parseInt(document.getElementById("slc-interval").value));

const response = async (url) => {
    try {
        if (navigator.onLine) {
            let res = await fetch(url);
            return res;
        }
    } catch (e) { }

    return { status: 0 };
};

const request = async () => {
    let url = "https://jsonplaceholder.typicode.com/todos/" + Math.round((Math.random() * 199) + 1).toString();
    let date = new Date();
    let log = createLog(url, date, await response(url));

    log.writeLine();

    if (document.getElementById("wrapper").getAttribute("data-online") !== log.isOnline.toString()) {
        log.setTheme();
    }
};

const logsToString = () => {
    return "botlogcon.js\n\nRobô (Bot), desenvolvido em JavaScript, para registro de logs sobre o estado atual da conexão com a internet (online/off-line).\n\nDesenvolvido por Gérison Sabino -> https://www.gerisonsabino.com\n\n" + document.getElementById("ul-logs").innerText;
}

const createLog = (url, date, response) => {
    let log = new Object();
    
    log.id = (document.getElementById("ul-logs").getElementsByTagName("li").length + 1);
    log.date = date;
    log.isOnline = (response.status >= 200 && response.status < 300);

    log.request = {
        url: url
    };

    log.response = {
        code: (response.status == undefined ? 0 : response.status)
    };

    log.writeLine = () => {
        let ulLogs = document.getElementById("ul-logs");
        let html = "";
        
        html += "<li data-online='" + log.isOnline + "' data-json='" + JSON.stringify(log) + "'>";
        html += "   <small>" + log.id.toString().padStart(7, '0') + " - " + log.date.toLocaleDateString() + " " + log.date.toLocaleTimeString() + " -> <strong>(" + log.response.code + ") " + (log.isOnline ? "ONLINE" : "OFF-LINE") + "</strong></small>";
        html += "</li>";

        ulLogs.innerHTML = (html + ulLogs.innerHTML);
    };

    log.setTheme = () => {
        document.getElementById("wrapper").setAttribute("data-online", (log.isOnline ? "true" : "false"));
        document.getElementsByTagName("title")[0].innerText = "botlogcon.js • " + (log.isOnline ? "Online" : "Off-Line");
        document.getElementsByTagName("link")[0].setAttribute("href", "img/icon-" + (log.isOnline ? "online" : "offline") + ".ico");
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

window.onload = () => {
    request(); 
    setInterval(request, (_INTERVAL * 1000));

    document.getElementById("ul-logs").innerHTML = "";
    document.getElementById("slc-interval").value = _INTERVAL.toString();

    document.getElementById("slc-interval").addEventListener("change", function() { 
        location.href = location.href.split("?")[0] + "?interval=" + this.value; 
    });

    document.getElementById("btn-print").addEventListener("click", function() {
        window.print(); 
    });

    document.getElementById("btn-copy").addEventListener("click", function() {
        document.getElementById("btn-copy").getElementsByTagName("span")[0].innerHTML = "Copiado";
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

    document.getElementById("btn-save").addEventListener("click", function () { 
        createFile(logsToString(), "botlogcon.js.txt");
    });

    document.getElementById("btn-json").addEventListener("click", function () {
        let json = { logs: new Array() };

        let logs = document.getElementById("ul-logs").getElementsByTagName("li");

        for (let i = 0; i < logs.length; i++) {
            json.logs.unshift(JSON.parse(logs[i].getAttribute("data-json")));
        }

        //for (var i = (logs.length - 1); i >= 0; i--) {
        //    json.logs.push(JSON.parse(logs[i].getAttribute("data-json")));
        //}

        createFile(JSON.stringify(json), "botlogcon.js.json");
    });
};

window.onbeforeunload = (e) => {
    if (e || window.event) {
        e.returnValue = 'Deseja realmente sair?';
    }

    return 'Deseja realmente sair?';
};