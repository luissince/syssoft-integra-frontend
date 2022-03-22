export function keyNumberInteger(event) {
    var key = window.Event ? event.which : event.keyCode;
    var c = String.fromCharCode(key);
    if ((c < '0' || c > '9') && (c !== '\b')) {
        event.preventDefault();
    }
}

export function keyNumberFloat(event) {
    var key = window.Event ? event.which : event.keyCode;
    var c = String.fromCharCode(key);
    if ((c < '0' || c > '9') && (c !== '\b') && (c !== '.')) {
        event.preventDefault();
    }
    if (c === '.' && event.target.value.includes(".")) {
        event.preventDefault();
    }
}

export function timeForma24(value) {
    var hourEnd = value.indexOf(":");
    var H = +value.substr(0, hourEnd);
    var h = H % 12 || 12;
    var ampm = (H < 12 || H === 24) ? "AM" : "PM";
    return h + value.substr(hourEnd, 3) + ":" + value.substr(6, 2) + " " + ampm;
};