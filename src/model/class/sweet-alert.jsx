import { Swal } from '../../resource/js/sweetalert';

class SweetAlert {

    constructor() {
        this.alert = Swal();
    }

    success = (title, message, callback = function () { }) => {
        const result = this.alert({
            title: title,
            text: message,
            type: "success",
            showConfirmButton: true,
            allowOutsideClick: false,
        });

        if (result instanceof Promise) {
            result.then(() => {
                callback();
            });
        }
    };

    close =() =>{
        this.alert.closePopup();
    }

}

export default SweetAlert;