import bootstrap from '../resource/js/bootstrap';
import Swal from '../resource/js/sweetalert';

/**
 *
 * @param {Number} time Tiempo de espera del time out
 * @returns {Promise<void>}
 */
export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Obtiene el estado de un privilegio específico dentro de un menú, submenú y privilegio dados.
 *
 * @param {Array} menus - Lista de menús, cada uno con sus submenús y privilegios.
 * @param {string} idMenu - Id del menú en el que se encuentra el privilegio.
 * @param {string} idSubMenu - Id del submenú dentro del menú especificado.
 * @param {string} idPrivilegio - Id del privilegio dentro del submenú especificado.
 * @returns {boolean} - Estado del privilegio (true o false), o false si el array de menús está vacío o si ocurre un error.
 */
export function getStatePrivilegio(list, idMenu, idSubMenu, idPrivilegio) {
  // Verifica si el array de menús está vacío o es nulo.
  if (isEmpty(list)) {
    return false;
  }

  try {
    // Encuentra el menú con el id especificado.
    const menu = list.find((item) => item.idMenu === idMenu);
    if (!menu) return false;

    // Encuentra el submenú con el id especificado dentro del menú.
    const subMenu = menu.subMenus.find((item) => item.idSubMenu === idSubMenu);
    if (!subMenu) return false;

    // Encuentra el privilegio con el id especificado dentro del submenú.
    const privilegio = subMenu.privilegios.find(
      (item) => item.idPrivilegio === idPrivilegio,
    );
    if (!privilegio) return false;

    // Retorna el estado del privilegio.
    return privilegio.estado === 1 ? true : false;
  } catch (error) {
    // Retorna 0 si ocurre un error al acceder al privilegio (ej: índices fuera de rango).
    return false;
  }
}

/**
 * Lee un archivo de imagen y devuelve su representación en base64, su extensión y dimensiones.
 * @param {File} file - Archivo seleccionado
 * @returns {Promise<{ base64String: string, extension: string, width: number, height: number } | false>} Un objeto que contiene la representación en base64 del archivo, su extensión, ancho y altura; o false si no se selecciona ningún archivo.
 */
export async function imageBase64(file) {
  if (!file) {
    return false;
  }

  const name = file.name;
  const read = await readDataURL(file);
  const base64String = read.replace(/^data:.+;base64,/, '');
  const extension = getExtension(name);
  const { width, height } = await imageSizeData(read);
  const size = Number(rounded(file.size / 1024));
  return { base64String, extension, width, height, size };
}

export async function convertFileBase64(files) {
  if (files.length !== 0) {
    const file = files[0];
    const data = await readDataFile(file);
    const extension = getExtension(file.name);
    return { data, extension };
  }

  return false;
}

/**
 * Formatea un número como una cantidad de dinero con opciones personalizables.
 *
 * @param {number|string} amount - La cantidad numérica que se va a formatear como dinero.
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

  decimalCount = Number.isInteger(decimalCount) ? Math.abs(decimalCount) : 2;

  const number = Number(amount);

  const negativeSign = number < 0 ? '-' : '';

  const roundedAmount = Math.abs(rounded(number, decimalCount)).toFixed(
    decimalCount,
  );
  const [integerPart, decimalPart] = roundedAmount.split('.');

  const integerFormatted = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousands,
  );
  const decimalFormatted = decimalCount
    ? decimal + (decimalPart || '0'.repeat(decimalCount))
    : '';

  return negativeSign + integerFormatted + decimalFormatted;
}

/**
 * Redondear un número como una cantidad.
 *
 * @param {number} amount - La cantidad numérica
 * @param {number} [decimalCount=2] - El número de decimales a mostrar.
 * @param {string} [type='string'] - El tipo de retorno (string o number).
 * @returns {string | number} La cantidad formateada como dinero.
 */
export function rounded(amount, decimalCount = 2, type = 'string') {
  const isNumber = /^-?\d*\.?\d+$/.test(amount);
  if (!isNumber) return type === 'number' ? 0 : '0.00';

  const number = Number(amount);

  decimalCount = Number.isInteger(decimalCount) ? Math.abs(decimalCount) : 2;

  const negativeSign = number < 0 ? '-' : '';

  const parsedAmount = Math.abs(number);
  const fixedAmount = parsedAmount.toFixed(decimalCount);

  const value = negativeSign + fixedAmount;

  return type === 'string' ? value : Number(value);
}

/**
 * Formatea un número como una cantidad de dinero en la moneda especificada.
 *
 * @param {number} value - El valor numérico que se va a formatear como dinero.
 * @param {string} [currency="PEN"] - El código de moneda (por ejemplo, "PEN" para soles peruanos).
 * @returns {string} La cantidad formateada como dinero en la moneda especificada.
 */
export const numberFormat = (value, currency = 'PEN') => {
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
  return parseFormatDate(date);
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

/**
 * Obtiene los meses del año actual
 * @returns
 */
export function months() {
  return [
    {
      value: 1,
      label: 'Enero',
    },
    {
      value: 2,
      label: 'Febrero',
    },
    {
      value: 3,
      label: 'Marzo',
    },
    {
      value: 4,
      label: 'Abril',
    },
    {
      value: 5,
      label: 'Mayo',
    },
    {
      value: 6,
      label: 'Junio',
    },
    {
      value: 7,
      label: 'Julio',
    },
    {
      value: 8,
      label: 'Agosto',
    },
    {
      value: 9,
      label: 'Septiembre',
    },
    {
      value: 10,
      label: 'Octubre',
    },
    {
      value: 11,
      label: 'Noviembre',
    },
    {
      value: 12,
      label: 'Diciembre',
    },
  ];
}

export function years(yearOld = 5) {
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let i = currentYear - yearOld; i <= currentYear; i++) {
    years.push({
      value: i,
      label: i,
    });
  }

  return years;
}

export function getCurrentMonth() {
  const today = new Date();
  return today.getMonth() + 1;
}

export function getCurrentYear() {
  const today = new Date();
  return today.getFullYear();
}

export function getFirstDayOfTheMonth() {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return parseFormatDate(firstDay);
}

export function getLastDayOfTheMonth() {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return parseFormatDate(lastDay);
}

function parseFormatDate(date) {
  const year = date.getFullYear();
  const month = padZeroes(date.getMonth() + 1);
  const day = padZeroes(date.getDate());
  return `${year}-${month}-${day}`;
}

function padZeroes(num) {
  return num > 9 ? num : '0' + num;
}

export function text(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Comprueba si el valor coincide con la expresión regular
  const isValid = emailRegex.test(email);

  // Devuelve el resultado de la validación
  return isValid;
}

/**
 * Verifica si el valor proporcionado es numérico.
 *
 * @param {*} valor - El valor a evaluar.
 * @returns {boolean} `true` si el valor es numérico válido, `false` en caso contrario.
 */
export function isNumeric(valor) {
  return !isNaN(valor) && !isNaN(parseFloat(valor));
}

/**
 * Verifica si el valor proporcionado es un texto no vacío.
 *
 * @param {*} value - El valor a evaluar.
 * @returns {boolean} `true` si el valor es una cadena de texto no vacía, `false` en caso contrario.
 */
export function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Convierte un valor a número si es numérico, de lo contrario retorna 0.
 *
 * @param {*} value - El valor a convertir.
 * @returns {number} El valor convertido a número, o 0 si no es numérico.
 */
export function getNumber(value) {
  if (!isNumeric(value)) {
    return 0;
  }

  return Number(value);
}

/**
 * Valida un número de teléfono de WhatsApp.
 *
 * @param {string} phone - El número de teléfono que se va a validar.
 * @returns {boolean} `true` si el número de teléfono es válido, de lo contrario, `false`.
 */
export function validateNumberWhatsApp(phone) {
  const regex = /^\+\d{1,3}\d{7,12}$/;
  return regex.test(phone);
}

export function keyNumberInteger(event, enterCallback) {
  const key = event.key;
  const isDigit = /\d/.test(key);

  if (
    !(
      isDigit ||
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab' ||
      ((event.ctrlKey || event.metaKey) && key === 'c') ||
      ((event.ctrlKey || event.metaKey) && key === 'v')
    )
  ) {
    event.preventDefault();
  }

  // Ejecutar el callback si la tecla presionada es "Enter"
  if (key === 'Enter' && typeof enterCallback === 'function') {
    enterCallback();
  }
}

export function handlePasteInteger(event) {
  const pasteData = event.clipboardData.getData('text/plain');
  if (!/^\d+$/.test(pasteData)) {
    event.preventDefault();
  }
}

export function keyNumberFloat(event, enterCallback) {
  const key = event.key;
  const isDigit = /\d/.test(key);
  const isDot = key === '.';
  const hasDot = event.target.value.includes('.');

  if (
    !(
      isDigit ||
      isDot ||
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab' ||
      ((event.ctrlKey || event.metaKey) && key === 'c') ||
      ((event.ctrlKey || event.metaKey) && key === 'v')
    )
  ) {
    event.preventDefault();
  }

  if (isDot && hasDot) {
    event.preventDefault();
  }

  // Permitir solo un punto al principio del número
  if (event.target.selectionStart === 0 && isDot) {
    event.preventDefault();
  }

  // Ejecutar el callback si la tecla presionada es "Enter"
  if (key === 'Enter' && typeof enterCallback === 'function') {
    enterCallback();
  }
}

export function handlePasteFloat(event) {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return;
  const pastedData = clipboardData.getData('text');

  // Verificar si el texto pegado es un número decimal válido
  if (!/^(\d*\.?\d*)$/.test(pastedData)) {
    event.preventDefault();
  }
}

export function keyNumberPhone(event, enterCallback) {
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

  if (
    !(
      isDigitOrAllowedChar ||
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab' ||
      ((event.ctrlKey || event.metaKey) && key === 'c') ||
      ((event.ctrlKey || event.metaKey) && key === 'v')
    )
  ) {
    event.preventDefault();
  }

  // Ejecutar el callback si la tecla presionada es "Enter"
  if (key === 'Enter' && typeof enterCallback === 'function') {
    enterCallback();
  }
}

export function keyUpSearch(event, callback) {
  if (
    event.key !== 'Tab' &&
    event.key !== 'Enter' &&
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

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * Formatea una cadena de fecha en un formato de "DD/MM/YYYY"
 *
 * @param {string} date
 * @returns {string} La cadena de fecha formateada.
 */
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

export function getUrlFileExtension(url) {
  const urlParts = url.split('/');
  const extension = urlParts[urlParts.length - 1];
  return extension ?? null;
}

export function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const formatBytes = (bytes) =>
  `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function getRowCellIndex(event) {
  const target = event.target;
  const cell = target.closest('td, th');
  if (!cell) {
    return -1;
  }

  const row = cell.parentElement;
  const tBody = row.closest('tbody');
  if (!tBody) return -1;

  const rowIndex = Array.prototype.indexOf.call(tBody.children, row);
  const cellIndex = Array.prototype.indexOf.call(row.children, cell);
  const children = Array.from(tBody.children);

  return { rowIndex, cellIndex, tBody, children };
}

export function getExtension(filename) {
  return filename.split('?')[0].split('#')[0].split('.').pop();
}

export function convertNullText(value) {
  const text = value === undefined ? null : value;
  return text === null ? '' : text;
}

/**
 * Verifica si un valor es "vacío".
 *
 * Esta función es útil para condiciones donde quieras saber si una variable está vacía
 * sin preocuparte del tipo (null, undefined, string vacío, array vacío, objeto sin claves, etc).
 *
 * @param {*} object - El valor a verificar.
 * @returns {boolean} `true` si está vacío, `false` si contiene datos.
 *
 * ✔️ Soporta:
 * - `null` o `undefined`
 * - Strings (considera vacíos los que solo tienen espacios)
 * - Arrays o `FileList`
 * - Objetos (devuelve true si no tiene claves)
 *
 * ❌ Otros tipos (como números o funciones) siempre devolverán `false`.
 *
 * @example
 * if (isEmpty(nombre)) {
 *   console.log("El nombre está vacío");
 * }
 *
 * if (!isEmpty(data)) {
 *   procesar(data);
 * }
 */
export function isEmpty(object) {
  if (object === null || typeof object === 'undefined') {
    return true;
  }

  if (Array.isArray(object) || object instanceof FileList) {
    return object.length === 0;
  }

  if (typeof object === 'string') {
    return object.trim() === '';
  }

  if (typeof object === 'object') {
    return Object.keys(object).length === 0;
  }

  return false;
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

export function viewModal(id, callback = function () {}) {
  const myModalEl = document.getElementById(id);
  myModalEl.addEventListener('shown.bs.modal', callback);
}

export function clearModal(id, callback = function () {}) {
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

/**
 * Valida los inputs dentro de un contenedor referenciado.
 * Si encuentra un campo inválido según el tipo (`number` o `string`), enfoca ese campo.
 *
 * @param {React.RefObject} ref - Referencia a un contenedor DOM (por ejemplo, un `<form>` o `<div>`).
 * @param {'number' | 'string'} [type='number'] - Tipo de validación:
 *   - 'number': verifica que los valores sean numéricos.
 *   - 'string': verifica que los valores no estén vacíos.
 *
 * ✅ Uso común: validación básica antes de enviar formularios.
 *
 * 🛑 Si encuentra un input inválido, **frena** en el primero y aplica `.focus()` a ese campo.
 *
 * ⚠️ Requiere que existan las funciones `isNumeric` e `isEmpty`.
 *
 * @example
 * const formRef = useRef();
 * validateNumericInputs(formRef, 'number'); // Verifica que todos los inputs tengan valores numéricos
 *
 * validateNumericInputs(formRef, 'string'); // Verifica que los campos no estén vacíos
 */
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

/**
 * Enfoca el primer `<input>` encontrado dentro de un contenedor referenciado.
 *
 * @param {React.RefObject} ref - Referencia a un contenedor DOM (como un <form> o <div>).
 *
 * ✔️ Uso típico: mejorar la experiencia del usuario al validar formularios.
 *
 * 🔍 Qué hace:
 * 1. Verifica que el `ref` exista y sea válido.
 * 2. Obtiene todos los elementos `<input>` dentro del contenedor.
 * 3. Si hay al menos uno, enfoca el primero (por ejemplo, para que el usuario corrija un error).
 *
 * ❗ Requiere que la función `isEmpty()` esté disponible (verifica arrays vacíos).
 *
 * @example
 * const formRef = useRef();
 * focusOnFirstInvalidInput(formRef);
 */
export function focusOnFirstInvalidInput(ref) {
  if (!ref || !ref.current) return;

  const inputs = Array.from(ref.current.querySelectorAll('input'));

  if (isEmpty(inputs)) return;

  const input = inputs[0];
  input.focus();
}

export function readDataURL(file) {
  return new Promise((resolve, reject) => {
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

export function readDataFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
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

export function guId() {
  const s4 = () => {
    return (
      (1 + crypto.getRandomValues(new Uint16Array(1))[0] / 0x10000) *
      0x10000
    )
      .toString(16)
      .substring(1);
  };
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
}

export function generar128Code() {
  // Caracteres permitidos en el estándar Code 128
  const caracteresPermitidos =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  // Longitud del código de barras (puedes ajustarla)
  const longitudCodigo = 12;

  let codigoBarras = '';

  // Generar un código de barras aleatorio
  for (let i = 0; i < longitudCodigo; i++) {
    const indiceAleatorio = Math.floor(
      Math.random() * caracteresPermitidos.length,
    );
    codigoBarras += caracteresPermitidos.charAt(indiceAleatorio);
  }

  return codigoBarras;
}

export function generateEAN13Code() {
  // Prefijo válido (2-3 dígitos según país, aquí usamos 3 aleatorios del 0 al 9)
  let prefix = Math.floor(100 + Math.random() * 900).toString();

  // Generamos 9 dígitos aleatorios más para completar 12 dígitos
  let core = '';
  for (let i = 0; i < 9; i++) {
    core += Math.floor(Math.random() * 10);
  }

  // Concatenamos sin el dígito verificador aún
  let partialCode = prefix + core;

  // Calculamos el dígito verificador
  let checkDigit = calculateEAN13CheckDigit(partialCode);

  // Retornamos el código de barras completo
  return partialCode + checkDigit;
}

// 📌 Función para calcular el dígito de control del EAN-13
function calculateEAN13CheckDigit(code) {
  let sum = 0;

  for (let i = 0; i < code.length; i++) {
    let digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3; // Pesos alternos 1 y 3
  }

  let remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export function getRanurasDeTiempo() {
  const ranurasDeTiempo = []
  for (let hour = 7; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`
      ranurasDeTiempo.push(timeString)
    }
  }
  return ranurasDeTiempo
}

export function getPathNavigation(opcion, idNavegacion) {
  if (opcion == 'venta' || opcion == 'fac') {
    return `/inicio/facturacion/ventas/detalle?idVenta=${idNavegacion}`;
  }

  if (opcion == 'cobro') {
    return `/inicio/facturacion/cobros/detalle?idCobro=${idNavegacion}`;
  }

  if (opcion == 'compra') {
    return `/inicio/tesoreria/compras/detalle?idCompra=${idNavegacion}`;
  }

  if (opcion == 'gasto') {
    return `/inicio/tesoreria/gastos/detalle?idGasto=${idNavegacion}`;
  }

  if (opcion == 'ajuste') {
    return `/inicio/logistica/ajuste/detalle?idAjuste=${idNavegacion}`;
  }

  if (opcion == 'traslado') {
    return `/inicio/logistica/traslado/detalle?idTraslado=${idNavegacion}`;
  }

  if (opcion == 'cpe') {
    return `/inicio/cpesunat/cpeelectronicos?comprobante=${idNavegacion}`;
  }

  if (opcion == 'guia-create') {
    return `/inicio/facturacion/guiaremision/crear?idVenta=${idNavegacion}`;
  }

  if (opcion == 'guia') {
    return `/inicio/facturacion/guiaremision/detalle?idGuiaRemision=${idNavegacion}`;
  }
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

export function alertHTML(title, html, callback = function () {}) {
  Swal({
    html: html,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cerrar',
    cancelButtonColor: '#dc3545',
    allowOutsideClick: false,
    showCloseButton: true,
  }).then((event) => {
    callback(event);
  });
}

export function alertSuccess(title, message, callback = function () {}) {
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

export function alertWarning(title, message, callback = function () {}) {
  Swal({
    title: title,
    text: message,
    type: 'warning',
    focusConfirm: true,
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
    input: 'text',
    onKeyDown: keyNumberFloat,
    inputPlaceholder: '0.00',
    inputAttributes: {
      autocapitalize: 'off',
    },
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: 'Aceptar',
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
