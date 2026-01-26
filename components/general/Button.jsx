'use client';

import React from 'react';
import '@/styles/button.scss';

/**
 * Unified Button Component
 * 
 * Variants: primary, secondary, danger, ghost, outline, success
 * Sizes: sm, md, lg
 * States: loading, disabled
 * 
 * Examples:
 * <Button variant="primary" size="md">Click Me</Button>
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 * <Button variant="secondary" disabled>Disabled</Button>
 */
const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  children,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}, ref) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled || loading ? 'btn-disabled' : '',
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      <span className="btn-content">
        {loading && (
          <span className="btn-loader">
            <span className="spinner"></span>
          </span>
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="btn-icon btn-icon-left" size={18} />
        )}
        <span className={loading ? 'btn-text btn-text-loading' : 'btn-text'}>
          {children}
        </span>
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="btn-icon btn-icon-right" size={18} />
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
