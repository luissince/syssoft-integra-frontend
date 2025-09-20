import { Component } from 'react';
import PropTypes from 'prop-types';
import { images } from '../helper';
import Button from './Button';
import { alertKit } from 'alert-kit';
import { imageBase64 } from '../helper/utils.helper';

const ImageUpload = ({
  label,
  subtitle,
  imageUrl,
  defaultImage,
  alt,
  inputId,
  width = 250,
  accept,
  onChange,
  onClear,
  onDownload,
}) => (
  <div className="text-center">
    {label && (
      <>
        <span>{label}</span> <br />
      </>
    )}
    {subtitle && (
      <>
        <small>{subtitle}</small> <br />{' '}
      </>
    )}
    <div className="text-center mt-2 mb-2">
      <Image
        default={defaultImage}
        src={imageUrl}
        alt={alt}
        className="img-fluid border border-primary rounded"
        width={width}
      />
    </div>
    <input
      type="file"
      id={inputId}
      accept={accept}
      className="display-none"
      onChange={onChange}
    />
    <label htmlFor={inputId} className="btn btn-outline-secondary m-0">
      <div className="content-button">
        <i className="bi bi-image"></i>
        <span></span>
      </div>
    </label>{' '}
    {onClear && (
      <Button className="btn-outline-secondary" onClick={onClear}>
        <i className="bi bi-trash"></i>
      </Button>
    )}
    {onDownload && (
      <Button className="btn-outline-secondary" onClick={onDownload}>
        <i className="bi bi-download"></i>
      </Button>
    )}
  </div>
);

class MultiImages extends Component {
  constructor(props) {
    super(props);
  }

  changeInput = async (event) => {
    let indexImg =
      this.props.images.length > 0
        ? this.props.images[this.props.images.length - 1].index + 1
        : 0;

    const newImgsToState = await this.readMultiFiles(event, indexImg);
    const newImgsState = [...this.props.images, ...newImgsToState];
    this.props.handleSelectImages(newImgsState);
  };

  readMultiFiles = async (event, indexInicial) => {
    const files = event.currentTarget.files;
    const arrayImages = [];
    const maxKB = this.props.maxSizeKB || 500;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const { size, base64String, extension, width, height } =
        await imageBase64(file);

      if (this.props.width && this.props.height) {
        if (width !== this.props.width || height !== this.props.height) {
          alertKit.warning({
            title: 'Imagen',
            message:
              'La imagen ' +
              file.name +
              ' tiene que tener un aspecto de ' +
              this.props.width +
              ' x ' +
              this.props.height +
              ' pixeles',
          });
          continue;
        }
      }

      if (size > maxKB) {
        alertKit.warning({
          title: 'Imagen',
          message:
            'La imagen ' +
            file.name +
            ' a subir tiene que ser menor a ' +
            maxKB +
            ' KB, la imagen tiene un peso aproximado de ' +
            size +
            ' KB',
        });
        continue;
      }

      arrayImages.push({
        index: indexInicial,
        name: file.name,
        base64: base64String,
        extension,
        width,
        height,
        size,
        url,
      });

      indexInicial++;
    }

    event.target.value = null;
    return arrayImages;
  };

  deleteImg = (indice, remove) => {
    const newImgs = remove
      ? this.props.images.map((element) =>
        element.index === indice ? { ...element, remover: true } : element,
      )
      : this.props.images.filter((element) => element.index !== indice);

    this.props.handleRemoveImages(newImgs);
  };

  render() {
    return (
      <div className="d-flex flex-wrap position-relative mt-3 gap-8">
        {this.props.images.map((imagen, index) => {
          if (imagen.remover === false || imagen.remover === undefined) {
            return (
              <div
                key={index}
                className="d-flex justify-content-center border align-items-center position-relative p-2 col-xl-3 col-md-4 col-sm-5 col-12"
              >
                <img
                  alt="vista previa"
                  src={imagen.url}
                  style={{ height: '120px', maxWidth: '100%' }}
                />
                <div
                  className="position-absolute"
                  style={{ top: '0', left: '0' }}
                >
                  <Button
                    className="btn-danger"
                    onClick={() =>
                      this.deleteImg(imagen.index, imagen.remover !== undefined)
                    }
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            );
          }
          return null;
        })}

        <div className="d-flex justify-content-center border align-items-center p-2 col-xl-3 col-md-4 col-sm-5 col-12">
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
              <img
                src={images.imagen}
                style={{ height: '120px', maxWidth: '100%' }}
              />
              <span className="text-base">Subir</span>
            </div>
          </label>
        </div>
      </div>
    );
  }
}

MultiImages.propTypes = {
  images: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  handleSelectImages: PropTypes.func,
  handleRemoveImages: PropTypes.func,
  maxSizeKB: PropTypes.number,
};

MultiImages.defaultProps = {
  maxSizeKB: 500,
};
export { MultiImages, ImageUpload };

/**
 * Image component with support for thumbnail view and fullscreen toggle.
 *
 * - Usa Bootstrap por defecto.
 * - Si se pasa `overrideClass` y/o `overrideStyle`, se priorizan esos estilos (útil al migrar a Tailwind).
 *
 * @component
 * @example
 * // Default usage with Bootstrap styles
 * <Image src="/path/to/image.jpg" alt="Example" />
 *
 * @example
 * // Usage with Tailwind override
 * <Image
 *   src="/path/to/image.jpg"
 *   alt="Example"
 *   overrideClass="rounded-lg shadow-lg cursor-pointer"
 * />
 *
 * @prop {string} [default] - Fallback image source if no image is provided.
 * @prop {string} [src] - The main image source.
 * @prop {string} alt - Alternative text for the image.
 * @prop {string} [className] - Extra classes to append (Bootstrap style).
 * @prop {string|number} [width] - Width of the image.
 * @prop {string|number} [height] - Height of the image.
 * @prop {string} [overrideClass] - Tailwind (or custom) classes that override Bootstrap defaults.
 * @prop {Object} [overrideStyle] - Inline styles that override default styles.
 */
class Image extends Component {

  /**
   * Creates an instance of Image.
   *
   * @param {Object} props - React props.
   * @param {string} [props.default] - Fallback image source.
   * @param {string} [props.src] - Main image source.
   * @param {string} props.alt - Alternative text.
   * @param {string} [props.className] - CSS classes (Bootstrap).
   * @param {string|number} [props.width] - Image width.
   * @param {string|number} [props.height] - Image height.
   * @param {string} [props.overrideClass] - Override CSS classes (Tailwind/custom).
   * @param {Object} [props.overrideStyle] - Override inline styles.
   */
  constructor(props) {
    super(props);
    this.state = {
      default: props.default || images.noImage,
      image: props.src || props.default,
      alt: props.alt,
      className: props.className,
      width: props.width,
      height: props.height,
      showFullScreen: false,
    };
  }

  /**
  * Updates state when the image source changes.
  *
  * @param {Object} prevProps - Previous props.
  */
  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      this.setState({
        image: this.props.src || this.state.default,
      });
    }
  }

  /**
  * Handles image loading errors by setting fallback image.
  *
  * @returns {void}
  */
  handleImageError = () => {
    this.setState({
      image: this.state.default,
    });
  };

  /**
   * Toggles fullscreen mode for the image.
   *
   * @param {React.MouseEvent} e - Click event.
   * @returns {void}
   */
  toggleFullScreen = (e) => {
    e.stopPropagation();
    this.setState((prevState) => ({
      showFullScreen: !prevState.showFullScreen,
    }));
  };

   /**
   * Renders the image and fullscreen modal.
   *
   * @returns {JSX.Element}
   */
  render() {
    const { alt, className, width, height, overrideClass, overrideStyle } = this.props;
    const { image, showFullScreen } = this.state;
    const appliedClass = overrideClass || `${className} img-thumbnail`;
    const appliedStyle = overrideStyle ? {} : { cursor: 'pointer' };

    return (
      <>
        {/* Imagen miniatura con evento onClick */}
        <img
          src={image}
          alt={alt}
          className={appliedClass}
          width={width}
          height={height}
          onError={this.handleImageError}
          onClick={this.toggleFullScreen}
          style={appliedStyle}
        />

        {/* Imagen en pantalla completa */}
        {showFullScreen && (
          <div
            className="fullscreen-container position-fixed top-0 left-0 vw-100 vh-100 d-flex justify-content-center align-items-center z-index-9999"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={this.toggleFullScreen}
          >
            <span className="btn btn-light position-absolute top-3-5 right-3-5">
              &times;
            </span>
            <img
              src={image}
              alt={alt}
              className="mw-90 mh-90 rounded-sm shadow"
            />
          </div>
        )}
      </>
    );
  }
}

Image.propTypes = {
  /** Fallback image source if no image is provided */
  default: PropTypes.string,
  /** The main image source */
  src: PropTypes.string,
  /** Alternative text for the image (required for accessibility) */
  alt: PropTypes.string.isRequired,
  /** Extra CSS classes (Bootstrap style) */
  className: PropTypes.string,
  /** Width of the image */
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Height of the image */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Tailwind (or custom) classes that override Bootstrap defaults */
  overrideClass: PropTypes.string,
  /** Inline styles that override defaults */
  overrideStyle: PropTypes.object,
};

export default Image;
