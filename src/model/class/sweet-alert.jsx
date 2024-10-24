import { keyNumberFloat } from '../../helper/utils.helper';
import { Swal } from '../../resource/js/sweetalert';

/**
 * Clase que encapsula la funcionalidad de SweetAlert para mostrar diferentes tipos de alertas.
 */
class SweetAlert {

    /**
     * Constructor que inicializa la instancia de SweetAlert.
     */
    constructor() {
        this.alert = Swal();
    }

    /**
     * Muestra una alerta informativa.
     * @param {string} title - El título de la alerta.
     * @param {string} message - El mensaje de la alerta.
     */
    information = (title, message) => {
        this.alert({
            title: title,
            text: message,
            type: 'info',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });
    };

    /**
     * Muestra una alerta de éxito con opción de ejecutar un callback.
     * @param {string} title - El título de la alerta.
     * @param {string} message - El mensaje de la alerta.
     * @param {Function} [callback=function()] - Función a ejecutar cuando se confirma la alerta.
     */
    success = (title, message, callback = function () { }) => {
        this.alert({
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
    };

    /**
     * Muestra una alerta de advertencia con opción de ejecutar un callback.
     * @param {string} title - El título de la alerta.
     * @param {string} message - El mensaje de la alerta.
     * @param {Function} [callback=function()] - Función a ejecutar cuando se confirma la alerta.
     */
    warning = (title, message, callback = function () { }) => {
        this.alert({
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
    };

    /**
     * Muestra una alerta de error.
     * @param {string} title - El título de la alerta.
     * @param {string} message - El mensaje de la alerta.
     */
    error = (title, message) => {
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
    };

    /**
     * Muestra un diálogo de confirmación con botones "Sí" y "No".
     * @param {string} title - El título del diálogo.
     * @param {string} mensaje - El mensaje del diálogo.
     * @param {Function} callback - Función que recibe un booleano indicando si se confirmó o no.
     */
    dialog = (title, mensaje, callback) => {
        this.alert({
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
    };

    /**
     * Muestra una alerta con contenido HTML personalizado.
     * @param {string} title - El título de la alerta.
     * @param {string} html - El contenido HTML de la alerta.
     * @param {Function} [callback=function()] - Función a ejecutar cuando se cierra la alerta.
     */
    html = (title, html, callback = function () { }) => {
        this.alert({
            title: title,
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
    };

    /**
     * Muestra una alerta con un campo de entrada.
     * @param {string} title - El título de la alerta.
     * @param {string} mensaje - El mensaje de la alerta.
     * @param {Function} callback - Función que recibe dos parámetros: el éxito de la operación y el valor ingresado.
     */
    input = (title, mensaje, callback) => {
        this.alert({
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
    };

    /**
     * Cierra la alerta actual.
     */
    close = () => {
        this.alert.closePopup();
    };

}

export default SweetAlert;
