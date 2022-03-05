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