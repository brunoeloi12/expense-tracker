'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedBalanceProps {
  value: number;
  className?: string;
}

export default function AnimatedBalance({ value, className }: AnimatedBalanceProps) {
  const nodeRef = useRef<HTMLParagraphElement>(null);
  const objRef = useRef({ val: 0 });

  useEffect(() => {
    if (!nodeRef.current) return;

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val / 100);
    };

    // Initialize display with 0
    nodeRef.current.innerText = formatCurrency(objRef.current.val);

    const ctx = gsap.context(() => {
      gsap.to(objRef.current, {
        val: value,
        duration: 1.5,
        ease: 'expo.out',
        onUpdate: () => {
          if (nodeRef.current) {
            nodeRef.current.innerText = formatCurrency(Math.round(objRef.current.val));
          }
        }
      });
    });

    return () => ctx.revert();
  }, [value]);

  return (
    <p ref={nodeRef} className={className}>
      R$ 0,00
    </p>
  );
}
