import { Component } from "react";
import PropTypes from "prop-types";
import { images } from "../helper";

class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            default: props.default || images.noImage,
            image: props.src || props.default,
            alt: props.alt,
            className: props.className,
            width: props.width,
            height: props.height,
            showFullScreen: false, // Estado para controlar la vista grande
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.src !== this.props.src) {
            this.setState({
                image: this.props.src || this.state.default,
            });
        }
    }

    handleImageError = () => {
        this.setState({
            image: this.state.default,
        });
    };

    toggleFullScreen = () => {
        this.setState((prevState) => ({
            showFullScreen: !prevState.showFullScreen,
        }));
    };

    render() {
        const { alt, className, width, height } = this.props;
        const { image, showFullScreen } = this.state;

        return (
            <>
                {/* Imagen miniatura con evento onClick */}
                <img
                    src={image}
                    alt={alt}
                    className={`${className} img-thumbnail`}
                    width={width}
                    height={height}
                    onError={this.handleImageError}
                    onClick={this.toggleFullScreen} // Click para ver en grande
                    style={{ cursor: "pointer" }} // Cursor tipo puntero
                />

                {/* Imagen en pantalla completa */}
                {showFullScreen && (
                    <div
                        className="fullscreen-container position-fixed top-0 left-0 vw-100 vh-100 d-flex justify-content-center align-items-center z-index-9999"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                        onClick={this.toggleFullScreen}>
                        <span className="btn btn-light position-absolute top-3-5 right-3-5">&times;</span>
                        <img src={image} alt={alt} className="mw-90 mh-90 rounded-sm shadow" />
                    </div>
                )}
            </>
        );
    }
}

Image.propTypes = {
    default: PropTypes.string,
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Image;
