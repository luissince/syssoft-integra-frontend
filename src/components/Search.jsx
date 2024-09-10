import React from 'react';
import PropTypes from 'prop-types';
import Input from './Input';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };

    this.debounceTime = this.props.debounceTime || 250;
    this.debouncedSearch = this.debounce(this.props.onSearch, this.debounceTime);
  }

  initialize = (data) => {
    this.setState({
      searchTerm: data
    });
  }

  restart = () => {
    this.setState({
      searchTerm: ''
    });
  }

  debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  handleInputChange = (event) => {
    const value = event.target.value;
    this.setState({ searchTerm: value });
    this.debouncedSearch(value);
  }

  render() {
    return (
      <Input
        autoFocus={true}
        group={this.props.group}
        label={this.props.label}
        className={this.props.className}
        refInput={this.props.refInput}
        iconLeft={this.props.iconLeft}
        placeholder={this.props.placeholder}
        value={this.state.searchTerm}
        buttonRight={this.props.buttonRight}
        onChange={this.handleInputChange}
        onKeyDown={this.props.onKeyDown}
      />
    );
  }
}

Search.propTypes = {
  refInput: PropTypes.object,
  group: PropTypes.bool,
  label: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  iconLeft: PropTypes.element,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  buttonRight: PropTypes.element,
  debounceTime: PropTypes.number,
  onKeyDown: PropTypes.func,
}


export default Search;