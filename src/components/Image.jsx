import { Component } from "react";
import PropTypes from 'prop-types';
import { images } from "../helper";

class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: props.src,
            alt: props.alt,
            className: props.className,
            width: props.width,
            height: props.height,
        };
    }

    componentDidUpdate(prevProps){
        if (prevProps.src !== this.props.src) {
            this.setState({
                image: this.props.src,
            });
        }
    }

    handleImageError = () => {
        this.setState({
            image: images.noImage,
        });
    };

    render() {
        return (
            <img
                src={this.state.image}
                alt={this.state.alt}
                className={this.state.className}
                width={this.state.width}
                height={this.state.height}
                onError={this.handleImageError}
            />
        );
    }
}

Image.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default Image;