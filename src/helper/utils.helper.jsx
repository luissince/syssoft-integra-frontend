import bootstrap from '../recursos/js/bootstrap';
import Swal from '../recursos/js/sweetalert';

/**
 *
 * @param {Number} time Tiempo de espera del time out
 * @returns {Promise<void>}
 */
export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function makeid(length) {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  result = result.match(/\d{1,4}/g).join('');
  return result;
}

export function statePrivilegio(value) {
  if (value === undefined) return false;
  return value === 1 ? true : false;
}

/**
 * Lee un archivo de imagen y devuelve su representación en base64, su extensión y dimensiones.
 * @param {File[]} files - La lista de archivos de imagen seleccionados.
 * @returns {Promise<{ base64String: string, extension: string, width: number, height: number } | false>} Un objeto que contiene la representación en base64 del archivo, su extensión, ancho y altura; o false si no se selecciona ningún archivo.
 */
export async function imageBase64(files) {
  if (files.length !== 0) {
    const name = files[0].name;
    const read = await readDataURL(files);
    const base64String = read.replace(/^data:.+;base64,/, '');
    const extension = getExtension(name);
    const { width, height } = await imageSizeData(read);
    return { base64String, extension, width, height };
  }

  return false;
}

/**
 * Formatea un número como una cantidad de dinero con opciones personalizables.
 *
 * @param {number} amount - La cantidad numérica que se va a formatear como dinero.
 * @param {number} [decimalCount=2] - El número de decimales a mostrar.
 * @param {string} [decimal="."] - El separador decimal.
 * @param {string} [thousands=","] - El separador de miles.
 * @returns {string} La cantidad formateada como dinero.
 */
export function formatDecimal(
  amount,
  decimalCount = 2,
  decimal = '.',
  thousands = ',',
) {
  const isNumber = /^-?\d*\.?\d+$/.test(amount);
  if (!isNumber) return '0.00';

  decimalCount = Math.abs(decimalCount);
  decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

  const negativeSign = amount < 0 ? '-' : '';

  let i = parseInt(
    (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)),
  ).toString();

  let j = i.length > 3 ? i.length % 3 : 0;

  const negative = negativeSign + (j ? i.substring(0, j) + thousands : '');

  const a = i.substring(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands);

  const d = decimalCount
    ? decimal +
    Math.abs(amount - i)
      .toFixed(decimalCount)
      .slice(2)
    : '';

  const total = negative + a + d;

  return total;
}

/**
 * Redondear un número como una cantidad.
 *
 * @param {number} amount - La cantidad numérica que se va a formatear como dinero.
 * @param {number} [decimalCount=2] - El número de decimales a mostrar.
 * @returns {string} La cantidad formateada como dinero.
 */
export function rounded(amount, decimalCount = 2) {
  const isNumber = /^-?\d*\.?\d+$/.test(amount);
  if (!isNumber) return '0';

  decimalCount = Math.abs(decimalCount);
  decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

  const negativeSign = amount < 0 ? '-' : '';

  const parsedAmount = Math.abs(Number(amount)) || 0;
  const fixedAmount = parsedAmount.toFixed(decimalCount);

  return negativeSign + fixedAmount;
}

/**
 * Formatea un número como una cantidad de dinero en la moneda especificada.
 *
 * @param {number} value - El valor numérico que se va a formatear como dinero.
 * @param {string} [currency="PEN"] - El código de moneda (por ejemplo, "PEN" para soles peruanos).
 * @returns {string} La cantidad formateada como dinero en la moneda especificada.
 */
export const numberFormat = (value, currency) => {
  // Definir formatos para diferentes monedas
  const formats = [
    {
      locales: 'es-PE',
      options: {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
      },
    },
    {
      locales: 'en-US',
      options: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
    },
    {
      locales: 'de-DE',
      options: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      },
    },
  ];

  // Buscar el formato correspondiente a la moneda especificada
  const newFormat = formats.find((item) => currency === item.options.currency);

  if (newFormat) {
    // Crear un formateador de números con el formato encontrado
    const formatter = new Intl.NumberFormat(newFormat.locales, {
      style: newFormat.options.style,
      currency: newFormat.options.currency,
    });

    // Formatear el valor y devolverlo
    const formattedValue = formatter.format(value);

    // Elimina todos los espacios en blanco
    return formattedValue.replace(/\s/g, '');
  } else {
    // Si no se encuentra un formato válido, devolver "0"
    return 'MN ' + formatDecimal(value);
  }
};
/**
 * Formatea un número agregando ceros delante hasta alcanzar una longitud específica.
 *
 * @param {number} numero - El número que se va a formatear.
 * @returns {string} El número formateado con ceros delante.
 */
export function formatNumberWithZeros(numero) {
  // Convierte el número a cadena y maneja números negativos
  const numeroAbsoluto = Math.abs(numero);
  const numeroFormateado = String(numeroAbsoluto).padStart(6, '0');

  // Añade el signo negativo si el número original era negativo
  return numero < 0 ? `-${numeroFormateado}` : numeroFormateado;
}

/**
 * Obtiene la fecha actual en el formato 'YYYY-MM-DD'.
 * @returns {string} Fecha actual en formato 'YYYY-MM-DD'.
 */
export function currentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
  const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
  const formatted_date = `${year}-${month}-${day}`;
  return formatted_date;
}

/**
 * Obtiene la hora actual en el formato "HH:MM:SS".
 * @returns {string} La hora actual en el formato "HH:MM:SS".
 */
export function currentTime() {
  const time = new Date();
  const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours();
  const minutes =
    time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes();
  const seconds =
    time.getSeconds() > 9 ? time.getSeconds() : '0' + time.getSeconds();
  const formatted_time = `${hours}:${minutes}:${seconds}`;
  return formatted_time;
}

export function getCurrentMonth() {
  const today = new Date();
  return today.getMonth() + 1;
}

export function getCurrentYear() {
  const today = new Date();
  return today.getFullYear();
}

export function monthName(month) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return months[month - 1];
}

export function validateDate(date) {
  const regex = new RegExp(
    '([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})',
  );

  return regex.test(date);
}

export function validateComboBox(comboBox) {
  if (comboBox.children('option').length === 0) {
    return true;
  }

  if (comboBox.children('option').length > 0 && comboBox.val() === '') {
    return true;
  }

  return false;
}

/**
 * Valida una dirección de correo electrónico.
 *
 * @param {string} email - La dirección de correo electrónico que se va a validar.
 * @returns {boolean} `true` si la dirección de correo electrónico es válida, de lo contrario, `false`.
 */
export function validateEmail(email) {
  // Expresión regular para validar direcciones de correo electrónico
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // Comprueba si el valor coincide con la expresión regular
  const isValid = emailRegex.test(email);

  // Devuelve el resultado de la validación
  return isValid;
}

export function isNumeric(valor) {
  return !isNaN(valor) && !isNaN(parseFloat(valor));
}

export function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function keyNumberInteger(event) {
  const key = event.key;
  const isDigit = /\d/.test(key);

  if (!(isDigit || key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab' || (event.ctrlKey || event.metaKey) && key === 'c')) {
    event.preventDefault();
  }
}

export function keyNumberFloat(event) {
  const key = event.key;
  const isDigit = /\d/.test(key);
  const isDot = key === '.';
  const hasDot = event.target.value.includes('.');

  if (!(isDigit || isDot || key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab' || (event.ctrlKey || event.metaKey) && key === 'c')) {
    event.preventDefault();
  }

  if (isDot && hasDot) {
    event.preventDefault();
  }
}

export function keyNumberPhone(event) {
  const key = event.key;
  const inputValue = event.target.value;

  // Verifica si la tecla presionada es un dígito o uno de los caracteres permitidos
  const isDigitOrAllowedChar = /^[0-9+()-]$/.test(key);

  // Verifica si el carácter ya existe en el valor actual del campo
  const charAlreadyExists = inputValue.includes(key);

  if (key === '-' && charAlreadyExists) {
    event.preventDefault();
  }

  if (key === '+' && charAlreadyExists) {
    event.preventDefault();
  }

  if (!(isDigitOrAllowedChar || key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab' || (event.ctrlKey || event.metaKey) && key === 'c')) {
    event.preventDefault();
  }
}

export function keyUpSearch(event, callback) {
  if (
    event.key !== 'Tab' &&
    event.key !== 'Backspace' &&
    event.key !== 'Control' &&
    event.key !== 'AltRight' &&
    event.key !== 'Control' &&
    event.key !== 'AltRight' &&
    event.key !== 'Control' &&
    event.key !== 'c' &&
    event.key !== 'Alt' &&
    event.key !== 'ArrowRight' &&
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowDown' &&
    event.key !== 'ArrowUp'
  ) {
    callback();
  }
}

export function formatDate(date) {
  const parts = date.split('-');
  const today = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = today.getDate() > 9 ? today.getDate() : '0' + today.getDate();
  const month =
    today.getMonth() + 1 > 9
      ? today.getMonth() + 1
      : '0' + (today.getMonth() + 1);
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una cadena de tiempo en un formato de 12 horas (por defecto) o de 24 horas.
 *
 * @param {string} time - La cadena de tiempo en formato "HH:mm" o "HH:mm:ss".
 * @param {boolean} [addSeconds=false] - Indica si se deben incluir los segundos en la salida.
 * @returns {string} La cadena de tiempo formateada.
 */
export function formatTime(time, addSeconds = false) {
  const timeRegex =
    /^(0\d|1\d|2[0-4]):((0[0-9])|([1-5][0-9])|59)(?::([0-5][0-9]))?$/;
  const match = time.match(timeRegex);

  if (!match) {
    return 'Invalid Time';
  }

  const parts = time.split(':');

  const HH = parts[0];
  const mm = parts[1];
  const ss = parts[2] === undefined ? '00' : parts[2];

  const thf = HH % 12 || 12;
  const ampm = HH < 12 || HH === 24 ? 'AM' : 'PM';
  const formattedHour = thf < 10 ? '0' + thf : thf;

  if (addSeconds) {
    return `${formattedHour}:${mm}:${ss} ${ampm}`;
  }

  return `${formattedHour}:${mm} ${ampm}`;
}

export function getExtension(filename) {
  return filename.split('?')[0].split('#')[0].split('.').pop();
}

export function convertNullText(value) {
  const text = value === undefined ? null : value;
  return text === null ? '' : text;
}

export function isEmpty(object) {
  if (object === null) {
    return true;
  }

  if (Array.isArray(object)) {
    return object.length === 0 ? true : false;
  }

  if (typeof object === 'string') {
    return object === '' ? true : false;
  }

  if (typeof object === 'object') {
    return false;
  }

  if (typeof object === 'undefined') {
    return true;
  }
}

export function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function limitarCadena(cadena, limite, sufijo) {
  if (cadena.length > limite) {
    return cadena.substr(0, limite) + sufijo;
  }
  return cadena;
}

export function calculateTaxBruto(impuesto, monto) {
  return monto / ((impuesto + 100) * 0.01);
}

export function calculateTax(porcentaje, valor) {
  const igv = parseFloat(porcentaje) / 100.0;
  return valor * igv;
}

export function showModal(id) {
  const myModalEl = document.getElementById(id);
  const myModal = new bootstrap.Modal(myModalEl);
  myModal.show();
}

export function hideModal(id) {
  const myModal = bootstrap.Modal.getInstance(document.getElementById(id));
  myModal.hide();
}

export function viewModal(id, callback = function () { }) {
  const myModalEl = document.getElementById(id);
  myModalEl.addEventListener('shown.bs.modal', callback);
}

export function clearModal(id, callback = function () { }) {
  const myModalEl = document.getElementById(id);
  myModalEl.addEventListener('hidden.bs.modal', callback);
}

export function getInstanceModal(id) {
  return bootstrap.Modal.getInstance(document.getElementById(id));
}

export function spinnerLoading(message = 'Cargando datos...', table = false) {
  if (!table) {
    return (
      <div className="clearfix absolute-all bg-white">
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <div>
            <div className="spinner-grow text-danger" role="status"></div>
            <div className="spinner-grow text-warning" role="status"></div>
            <div className="spinner-grow text-info" role="status"></div>
          </div>
          <div>
            <strong>{message}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center h-100">
      <div>
        <div className="spinner-grow text-danger" role="status"></div>
        <div className="spinner-grow text-warning" role="status"></div>
        <div className="spinner-grow text-info" role="status"></div>
      </div>
      <div>
        <strong>{message}</strong>
      </div>
    </div>
  );
}

export function validateNumericInputs(ref, type = 'number') {
  if (!ref || !ref.current) return;

  const inputs = ref.current.querySelectorAll('input');

  for (const input of inputs) {
    const inputValue = input.value.trim();

    if (type === 'number') {
      if (!isNumeric(inputValue)) {
        input.focus();
        break;
      }
    }

    if (type === 'string') {
      if (isEmpty(inputValue)) {
        input.focus();
        break;
      }
    }
  }
}

export function focusOnFirstInvalidInput(ref) {
  if (!ref || !ref.current) return;

  const inputs = ref.current.querySelectorAll('input');

  if (inputs.length === 0) return;

  const input = inputs[0];
  input.focus();
}

export function readDataURL(files) {
  return new Promise((resolve, reject) => {
    const file = files[0];
    const blob = file.slice();
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function readDataBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(JSON.parse(reader.result));
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

export function imageSizeData(data) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = data;
    image.onload = function () {
      const height = this.height;
      const width = this.width;
      resolve({ width, height });
    };
    image.onerror = reject;
  });
}

export function alertInfo(title, message) {
  Swal({
    title: title,
    text: message,
    type: 'info',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export function getPathNavigation(opcion, idComprobante) {
  if (opcion == "venta") {
    return `/inicio/ventas/detalle?idVenta=${idComprobante}`
  }

  if (opcion == "cobro") {
    return `/inicio/cobros/detalle?idCobro=${idComprobante}`
  }

  if (opcion == "compra") {
    return `/inicio/compras/detalle?idCompra=${idComprobante}`
  }

  if (opcion == "gasto") {
    return `/inicio/gastos/detalle?idGasto=${idComprobante}`
  }

  if (opcion == "cpe") {
    return `/inicio/cpeelectronicos?comprobante=${idComprobante}`
  }
}

export function alertHTML(title, html) {
  Swal({
    html: html,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cerrar',
    cancelButtonColor: '#dc3545',
    allowOutsideClick: false,
    showCloseButton: true,
  }).then((event) => {
    console.log(event)
  });
}

export function alertSuccess(title, message, callback = function () { }) {
  Swal({
    title: title,
    text: message,
    type: 'success',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showConfirmButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
  }).then(() => {
    callback();
  });
}

export function alertWarning(title, message, callback = function () { }) {
  Swal({
    title: title,
    text: message,
    type: 'warning',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showConfirmButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
  }).then(() => {
    callback();
  });
}

export function alertError(title, message) {
  Swal({
    title: title,
    text: message,
    type: 'error',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showConfirmButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
  });
}

export function alertDialog(title, mensaje, callback) {
  Swal({
    title: title,
    text: mensaje,
    type: 'question',
    showCancelButton: true,
    confirmButtonText: 'Si',
    confirmButtonColor: '#007bff',
    cancelButtonText: 'No',
    cancelButtonColor: '#dc3545',
    allowOutsideClick: false,
    showCloseButton: true,
  }).then((isConfirm) => {
    if (isConfirm.value === undefined) {
      return false;
    }
    if (isConfirm.value) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

export function alertInput(title, mensaje, callback) {
  Swal({
    title: title,
    text: mensaje,
    type: 'info',
    input: "text",
    onKeyDown: keyNumberFloat,
    inputPlaceholder: '0.00',
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "Aceptar",
    confirmButtonColor: '#007bff',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#dc3545',
    showCloseButton: true,
  }).then((result) => {
    if (result.value) {
      callback(true, result.value);
    }
    callback(false);
  });
}