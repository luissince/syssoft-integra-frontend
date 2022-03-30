import bootstrap from "../../recursos/js/bootstrap";
import Swal from "../../recursos/js/sweetalert";

export function keyNumberInteger(event) {
  var key = window.Event ? event.which : event.keyCode;
  var c = String.fromCharCode(key);
  if ((c < "0" || c > "9") && c !== "\b") {
    event.preventDefault();
  }
}

export function keyNumberFloat(event) {
  var key = window.Event ? event.which : event.keyCode;
  var c = String.fromCharCode(key);
  if ((c < "0" || c > "9") && c !== "\b" && c !== ".") {
    event.preventDefault();
  }
  if (c === "." && event.target.value.includes(".")) {
    event.preventDefault();
  }
}

export function timeForma24(value) {
  var hourEnd = value.indexOf(":");
  var H = +value.substr(0, hourEnd);
  var h = H % 12 || 12;
  var ampm = H < 12 || H === 24 ? "AM" : "PM";
  return h + value.substr(hourEnd, 3) + ":" + value.substr(6, 2) + " " + ampm;
}

export function getExtension(filename) {
  return filename.split("?")[0].split("#")[0].split(".").pop();
}

export function showModal(id) {
  let myModal = new bootstrap.Modal(document.getElementById(id));
  myModal.show();
}

export function hideModal(id) {
  const myModal = bootstrap.Modal.getInstance(document.getElementById(id));
  myModal.hide();
}

export function viewModal(id, callback = function () {}) {
  let myModalEl = document.getElementById(id);
  myModalEl.addEventListener("show.bs.modal", callback);
}

export function clearModal(id, callback = function () {}) {
  let myModalEl = document.getElementById(id);
  myModalEl.addEventListener("hidden.bs.modal", callback);
}

export function ModalAlertClear() {
  Swal({
    type: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    clearModal: true,
  });
}

export function ModalAlertInfo(title, message) {
  Swal({
    title: title,
    text: message,
    type: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export function ModalAlertSuccess(title, message, callback = function () {}) {
  Swal({
    title: title,
    text: message,
    type: "success",
    showConfirmButton: true,
    allowOutsideClick: false,
  }).then((event) => {
    callback();
  });
}

export function ModalAlertWarning(title, message, callback = function () {}) {
  Swal({
    title: title,
    text: message,
    type: "warning",
    showConfirmButton: true,
    allowOutsideClick: false,
  }).then((event) => {
    callback();
  });
}

export function ModalAlertError(title, message) {
  Swal({
    title: title,
    text: message,
    type: "error",
    showConfirmButton: true,
    allowOutsideClick: false,
  });
}
