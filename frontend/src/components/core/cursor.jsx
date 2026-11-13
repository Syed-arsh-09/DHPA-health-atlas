'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

export function Cursor({
  children,
  className = '',
  style = {},
  attachToParent = false,
  variants,
  transition,
  springConfig = { bounce: 0.001 },
  onPositionChange,
}) {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const parent = attachToParent && cursorRef.current ? cursorRef.current.parentElement : null;

    if (attachToParent && parent) {
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      const handleMouseMove = (e) => {
        const rect = parent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseX.set(x);
        mouseY.set(y);
        if (onPositionChange) {
          onPositionChange(e.clientX, e.clientY);
        }
      };

      const handleMouseEnter = () => setIsVisible(true);
      const handleMouseLeave = () => setIsVisible(false);

      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseenter', handleMouseEnter);
      parent.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      };
    } else {
      const handleMouseMove = (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (onPositionChange) {
          onPositionChange(e.clientX, e.clientY);
        }
        if (!isVisible) setIsVisible(true);
      };

      const handleWindowLeave = () => setIsVisible(false);
      const handleWindowEnter = () => setIsVisible(true);

      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleWindowLeave);
      document.addEventListener('mouseenter', handleWindowEnter);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleWindowLeave);
        document.removeEventListener('mouseenter', handleWindowEnter);
      };
    }
  }, [attachToParent, mouseX, mouseY, onPositionChange, isVisible]);

  return (
    <div ref={cursorRef} className="pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`pointer-events-none z-[9999] ${attachToParent ? 'absolute' : 'fixed'} ${className}`}
            style={{
              x: smoothX,
              y: smoothY,
              top: 0,
              left: 0,
              translateX: '-50%',
              translateY: '-50%',
              ...style,
            }}
            initial={variants?.initial || { scale: 0.3, opacity: 0 }}
            animate={variants?.animate || { scale: 1, opacity: 1 }}
            exit={variants?.exit || { scale: 0.3, opacity: 0 }}
            transition={transition || { ease: 'easeInOut', duration: 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cursor;
