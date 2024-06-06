import { Component } from "react";
import PropTypes from 'prop-types';
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
    }

    render() {
        const { alt, className, width, height } = this.props;
        const { image } = this.state;

        return (
            <img
                src={image}
                alt={alt}
                className={className}
                width={width}
                height={height}
                onError={this.handleImageError}
            />
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
}

export default Image;