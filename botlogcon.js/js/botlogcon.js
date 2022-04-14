const _queryString = window.location.search;
const _urlParams = new URLSearchParams(_queryString);

const response = async () => {
    try {
        const url = "https://jsonplaceholder.typicode.com/todos/" + Math.round((Math.random() * 199) + 1).toString();
        const res = await fetch(url);
        return res;
    }
    catch (e) {
        return false;
    }
};

const request = async () => { 
    let log = createLog(await response()); 
    
    log.writeLine();

    if (document.getElementById("wrapper").getAttribute("data-online") !== log.response.online.toString()) {
        log.setTheme();
    }
}

function getLogsString() {
    let logs = document.getElementById("ul-logs").getElementsByTagName("li");
    let txt = "botlogcon.js\nBot para registro de logs sobre o estado atual da conexão com a internet\nDesenvolvido por Gérison Sabino → https://gerison.net\n\n";

    for (var i = 0; i < logs.length; i++) {
        txt += logs[i].innerText + "\n";
    }

    return txt;
}

function createLog(response) {
    let log = new Object();
    
    log.request = {
        id: (document.getElementById("ul-logs").getElementsByTagName("li").length + 1),
        date: new Date(),
        url: response.url
    };

    log.response = {
        code: (response.status == undefined ? 0 : response.status),
        online: (response.status >= 200 && response.status < 300)
    };

    log.writeLine = function () {
        let ulLogs = document.getElementById("ul-logs");
        let html = "";

        html += "<li data-online='" + this.response.online + "' data-json='" + JSON.stringify(this) + "'>";
        html += "   <small>REQ-" + this.request.id.toString().padStart(7, '0') + " - " + this.request.date.toLocaleDateString() + " " + this.request.date.toLocaleTimeString() + " → <strong>(" + this.response.code + ") " + (this.response.online ? "ONLINE" : "OFF-LINE") + "</strong></small>";
        html += "</li>";
    
        ulLogs.innerHTML = (html + ulLogs.innerHTML);
    };

    log.setTheme = function () {
        document.getElementById("wrapper").setAttribute("data-online", (this.response.online ? "true" : "false"));
        document.getElementsByTagName("title")[0].innerText = "botlogcon.js • " + (this.response.online ? "Online" : "Off-Line");
        document.getElementsByTagName("link")[0].setAttribute("href", "img/icon-" + (this.response.online ? "online" : "offline") + ".ico");
    };

    return log; 
}

function createFile(text, filename) {
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

window.onload = function () {
    const interval = (_urlParams.has("interval") ? parseInt(_urlParams.get('interval')) : parseInt(document.getElementById("slc-interval").value));
    document.getElementById("ul-logs").innerHTML = "";
    
    request(); 

    setInterval(request, (interval * 1000));

    document.getElementById("slc-interval").value = interval.toString();
    document.getElementById("slc-interval").addEventListener("change", function() { 
        location.href = location.href.split("?")[0] + "?interval=" + this.value; 
    });

    document.getElementById("btn-print").addEventListener("click", function() {
        window.print(); 
    });

    document.getElementById("btn-copy").addEventListener("click", function() {
        document.getElementById("btn-copy").getElementsByTagName("label")[0].innerHTML = "Copiado";
        setTimeout("document.getElementById('btn-copy').getElementsByTagName('label')[0].innerHTML = 'Copiar';", 3000);

        let s = getLogsString();

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
        createFile(getLogsString(), "botlogcon.js.txt");
    });

    document.getElementById("btn-json").addEventListener("click", function () {
        let json = { logs: new Array() };

        let logs = document.getElementById("ul-logs").getElementsByTagName("li");
    
        for (var i = (logs.length - 1); i >= 0; i--) {
            json.logs.push(JSON.parse(logs[i].getAttribute("data-json")));
        }

        createFile(JSON.stringify(json), "botlogcon.js.json");
    });
};

window.onbeforeunload = function (e) {
    if (e || window.event) {
        e.returnValue = 'Deseja realmente sair?';
    }

    return 'Deseja realmente sair?';
};