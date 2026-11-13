'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Cursor } from '@/components/core/cursor';
import { AnimatePresence, motion } from 'motion/react';
import { PlusIcon, ArrowUpRight } from 'lucide-react';

export function GlobalCursor() {
  const [hoverState, setHoverState] = useState({
    isHovering: false,
    text: 'View',
    isTouch: false,
  });

  // Detect touch devices (coarse pointer)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      if (isCoarse) {
        setHoverState(prev => ({ ...prev, isTouch: true }));
      }
    }
  }, []);

  const handlePositionChange = useCallback((x, y) => {
    if (typeof document === 'undefined') return;

    // Fast check for element under cursor
    const element = document.elementFromPoint(x, y);
    if (!element) {
      setHoverState(prev => (prev.isHovering ? { ...prev, isHovering: false } : prev));
      return;
    }

    // Check if element or any ancestor is interactive
    const interactiveTarget = element.closest('button, a, select, input, [role="button"], tr.cursor-pointer, [data-cursor]');

    if (interactiveTarget) {
      const customText = interactiveTarget.getAttribute('data-cursor') || 
        (interactiveTarget.tagName === 'A' ? 'Open' : 
         interactiveTarget.tagName === 'SELECT' ? 'Choose' : 
         interactiveTarget.tagName === 'INPUT' ? 'Type' : 'View');

      setHoverState(prev => {
        if (!prev.isHovering || prev.text !== customText) {
          return { ...prev, isHovering: true, text: customText };
        }
        return prev;
      });
    } else {
      setHoverState(prev => (prev.isHovering ? { ...prev, isHovering: false } : prev));
    }
  }, []);

  if (hoverState.isTouch) {
    return null; // Disable custom cursor on touch/mobile devices
  }

  return (
    <Cursor
      attachToParent={false}
      variants={{
        initial: { scale: 0.3, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.3, opacity: 0 },
      }}
      springConfig={{
        bounce: 0.001,
      }}
      transition={{
        ease: 'easeInOut',
        duration: 0.15,
      }}
      onPositionChange={handlePositionChange}
    >
      <motion.div
        animate={{
          width: hoverState.isHovering ? (hoverState.text.length > 4 ? 88 : 76) : 14,
          height: hoverState.isHovering ? 28 : 14,
        }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 350,
          bounce: 0.001,
        }}
        className="flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-white shadow-lg pointer-events-none"
      >
        <AnimatePresence mode="wait">
          {hoverState.isHovering ? (
            <motion.div
              key="hover-label"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12 }}
              className="inline-flex w-full items-center justify-center px-2"
            >
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-100 tracking-tight gap-1">
                {hoverState.text}
                <ArrowUpRight className="h-3 w-3 text-sky-400 shrink-0" />
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="dot"
              className="w-1.5 h-1.5 rounded-full bg-sky-400"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Cursor>
  );
}

export default GlobalCursor;

