import bootstrap from "../../recursos/js/bootstrap";
import Swal from "../../recursos/js/sweetalert";

export function validateDate(date) {
  var regex = new RegExp(
    "([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})"
  );
  return regex.test(date);
}

export function validateComboBox(comboBox) {
  if (comboBox.children("option").length === 0) {
    return true;
  }
  if (comboBox.children("option").length > 0 && comboBox.val() === "") {
    return true;
  } else {
    return false;
  }
}

export function validateEmail(value) {
  var validRegex =
    /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value.match(validRegex)) {
    return true;
  } else {
    return false;
  }
}

export function isNumeric(value) {
  try {
    if (value.trim().length === 0 || value === "undefined") return false;

    if (isNaN(value.trim())) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export function isText(value) {
  try {
    if (
      value.trim() === "" ||
      value.trim().length === 0 ||
      value === "undefined" ||
      value === null
    ) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

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

export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
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
  myModalEl.addEventListener("shown.bs.modal", callback);
}

export function clearModal(id, callback = function () {}) {
  let myModalEl = document.getElementById(id);
  myModalEl.addEventListener("hidden.bs.modal", callback);
}

export function readDataURL(files) {
  return new Promise((resolve, reject) => {
    let file = files[0];
    let blob = file.slice();
    var reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function imageSizeData(data) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.src = data;
    image.onload = function () {
      var height = this.height;
      var width = this.width;
      resolve({ width, height });
    };
    image.onerror = reject;
  });
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
