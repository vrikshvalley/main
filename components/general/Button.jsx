'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  magnetic = true, // Enable magnetic effect by default
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

  // Magnetic Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!magnetic || disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Limit the movement
    x.set(distanceX * 0.2); 
    y.set(distanceY * 0.2);
  };

  const handleMouseLeave = () => {
      x.set(0); 
      y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      style={magnetic && !disabled ? { x: springX, y: springY } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
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
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
