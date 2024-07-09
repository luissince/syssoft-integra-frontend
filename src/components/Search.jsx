import React from 'react';
import PropTypes from 'prop-types';
import Input from './Input';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };

    this.debounceTime = this.props.debounceTime || 250;
    this.debouncedSearch = this.debounce(this.props.onSearch, this.debounceTime);
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
        refInput={this.props.refInput}
        iconLeft={<i className="bi bi-search"></i>}
        placeholder={this.props.placeholder}
        value={this.state.searchTerm}
        onChange={this.handleInputChange}
      />
    );
  }
}

Search.propTypes = {
  refInput: PropTypes.object,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceTime: PropTypes.number,
}


export default Search;