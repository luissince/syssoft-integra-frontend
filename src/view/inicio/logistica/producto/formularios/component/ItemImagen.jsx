import React from "react";
import PropTypes from 'prop-types';
import Button from "../../../../../../components/Button";
import { images } from "../../../../../../helper";
import { alertWarning, imageBase64 } from "../../../../../../helper/utils.helper";

class ItemImage extends React.Component {
    constructor(props) {
        super(props);
    }

    changeInput = async (event) => {
        let indexImg;

        if (this.props.imagenes.length > 0) {
            indexImg = this.props.imagenes[this.props.imagenes.length - 1].index + 1;
        } else {
            indexImg = 0;
        }

        let newImgsToState = await this.readMultiFiles(event, indexImg);
        let newImgsState = [...this.props.imagenes, ...newImgsToState];
        this.props.handleSelectImagenes(newImgsState);
    };

    readMultiFiles = async (event, indexInicial) => {
        const files = event.currentTarget.files;

        const arrayImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            let url = URL.createObjectURL(file);

            const logoSend = await imageBase64(file);

            if (logoSend.size > 500) {
                alertWarning("Producto", "La imagen " + file.name + " a subir tiene que ser menor a 500 KB, la imagen tiene un peso aproximado de " + logoSend.size + " KB")
                continue;
            } else {
                arrayImages.push({
                    index: indexInicial,
                    name: file.name,
                    base64: logoSend.base64String,
                    extension: logoSend.extension,
                    width: logoSend.width,
                    height: logoSend.height,
                    size: logoSend.size,
                    url,
                });

                indexInicial++;
            }
        }

        event.target.value = null;

        return arrayImages;
    };

    deleteImg = (indice, remove) => {
        if (remove) {
            const newImgs = this.props.imagenes.map((element) => {
                if (element.index === indice) {
                    return {
                        ...element,
                        remover: true
                    }
                }
                return element;
            });
            this.props.handleRemoveImagenes(newImgs);
        } else {
            const newImgs = this.props.imagenes.filter((element) => element.index !== indice);
            this.props.handleRemoveImagenes(newImgs);
        }
    };

    render() {
        return (
            <div className='d-flex flex-wrap position-relative mt-3 gap-8'>
                {this.props.imagenes.map((imagen, index) => {
                    if (imagen.remover !== undefined) {
                        if (imagen.remover === false) {
                            return (
                                <div
                                    key={index}
                                    className='d-flex justify-content-center border align-items-center position-relative p-2 col-xl-3 col-md-4 col-sm-5 col-12'
                                >
                                    <img alt="algo" src={imagen.url} style={{ height: "120px", maxWidth: "100%" }} />

                                    <div className="position-absolute" style={{ top: "0", left: "0" }}>
                                        <Button
                                            className="btn-danger"
                                            onClick={() => this.deleteImg(imagen.index, true)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                </div>
                            );
                        }
                    } else {
                        return (
                            <div
                                key={index}
                                className='d-flex justify-content-center border align-items-center position-relative p-2 col-xl-3 col-md-4 col-sm-5 col-12'
                            >
                                <img alt="algo" src={imagen.url} style={{ height: "120px", maxWidth: "100%" }} />

                                <div className="position-absolute" style={{ top: "0", left: "0" }}>
                                    <Button
                                        className="btn-danger"
                                        onClick={() => this.deleteImg(imagen.index, false)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        );
                    }
                })}

                <div
                    className='d-flex justify-content-center border align-items-center p-2 col-xl-3 col-md-4 col-sm-5 col-12'
                >
                    <input
                        type="file"
                        id="fileSelectImage"
                        multiple
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        hidden
                        onChange={this.changeInput}
                    />
                    <label htmlFor="fileSelectImage">
                        <div className="d-flex flex-column justify-content-center align-items-center cursor-pointer m-0 gap-3-5">
                            <img src={images.imagen} style={{ height: "120px", maxWidth: "100%" }} />
                            <span className="text-base">Subir</span>
                        </div>
                    </label>
                </div>
            </div>
        );
    }
}

ItemImage.propTypes = {
    imagenes: PropTypes.array,
    handleSelectImagenes: PropTypes.func,
    handleRemoveImagenes: PropTypes.func
}

export default ItemImage;