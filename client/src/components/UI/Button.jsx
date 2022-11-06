import React from 'react';
import PropTypes from 'prop-types';

function Button({ children, onClick, disabled, className, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 text-sm font-semibold leading-none text-white focus:outline-none border rounded py-4 w-full hover:bg-sky-600 bg-sky-500 ${className}`}
      onClick={(e) => onClick && onClick(e)}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  className: '',
  disabled: false,
};

export default Button;
