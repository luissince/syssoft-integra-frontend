import React from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import { SearchIcon } from 'lucide-react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
    };

    this.debounceTime = this.props.debounceTime || 250;
    this.debouncedSearch = this.debounce(
      this.props.onSearch,
      this.debounceTime,
    );
  }

  initialize = (data) => {
    this.setState({
      searchTerm: data,
    });
  };

  restart = () => {
    this.setState({
      searchTerm: '',
    });
  };

  debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  handleInputChange = (event) => {
    const value = event.target.value;
    this.setState({ searchTerm: value });
    this.debouncedSearch(value);
  };

  render() {
    const { theme = 'classic' } = this.props;

    if (theme === 'classic') {
      return (
        <Input
          autoFocus={true}
          group={this.props.group}
          label={this.props.label}
          className={this.props.className}
          ref={this.props.refInput}
          iconLeft={this.props.iconLeft}
          placeholder={this.props.placeholder}
          value={this.state.searchTerm}
          buttonRight={this.props.buttonRight}
          onChange={this.handleInputChange}
          onKeyDown={this.props.onKeyDown}
        />
      );
    }

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={this.props.placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          ref={this.props.refInput}
          value={this.state.searchTerm}
          onChange={this.handleInputChange}
          onKeyDown={this.props.onKeyDown}
        />
      </div>
    );
  }
}

Search.propTypes = {
  refInput: PropTypes.object,
  group: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onSearch: PropTypes.func.isRequired,
  iconLeft: PropTypes.element,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  buttonRight: PropTypes.element,
  debounceTime: PropTypes.number,
  onKeyDown: PropTypes.func,
  theme: PropTypes.oneOf(['classic', 'modern']),
};

export default Search;
