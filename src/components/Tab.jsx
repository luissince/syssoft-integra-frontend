import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef } from 'react';

const TabHeader = forwardRef((props, ref) => {
  const {
    children,
    className = '',
    id = 'tab-container',
    onTabChange,
    ...rest
  } = props;
  const tabRef = useRef(null);

  useEffect(() => {
    const handleTabChange = (event) => {
      if (onTabChange) {
        onTabChange(event.target.id);
      }
    };

    const tabElement = tabRef.current;
    if (tabElement) {
      tabElement.addEventListener('shown.bs.tab', handleTabChange);
    }

    return () => {
      if (tabElement) {
        tabElement.removeEventListener('shown.bs.tab', handleTabChange);
      }
    };
  }, [onTabChange]);

  return (
    <ul
      ref={(el) => {
        tabRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      className={`nav nav-tabs ${className}`}
      id={id}
      role="tablist"
      {...rest}
    >
      {children}
    </ul>
  );
});

TabHeader.displayName = 'TabHeader';

TabHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  onTabChange: PropTypes.func, // Nueva prop para manejar cambios de tab
};

const TabHead = forwardRef((props, ref) => {
  const { children, className = '', id, isActive = false, ...rest } = props;

  return (
    <li ref={ref} className="nav-item" role="presentation" {...rest}>
      <a
        className={`nav-link ${isActive ? 'active' : ''} ${className}`}
        id={`${id}-tab`}
        data-bs-toggle="tab"
        href={`#${id}`}
        role="tab"
        aria-controls={id}
        aria-selected={isActive}
      >
        {children}
      </a>
    </li>
  );
});

TabHead.displayName = 'TabHead';

TabHead.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

const TabContent = forwardRef((props, ref) => {
  const { children, className = '', id = 'tab-content', ...rest } = props;

  return (
    <div
      ref={ref}
      className={`tab-content pt-3 ${className}`}
      id={id}
      {...rest}
    >
      {children}
    </div>
  );
});

TabContent.displayName = 'TabContent';

TabContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
};

const TabPane = forwardRef((props, ref) => {
  const { children, className = '', id, isActive = false, ...rest } = props;

  return (
    <div
      ref={ref}
      className={`tab-pane fade ${isActive ? 'show active' : ''} ${className}`}
      id={id}
      role="tabpanel"
      aria-labelledby={`${id}-tab`}
      {...rest}
    >
      {children}
    </div>
  );
});

TabPane.displayName = 'TabPane';

TabPane.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

export { TabHeader, TabHead, TabContent, TabPane };
