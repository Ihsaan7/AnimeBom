'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  return (
    <div style={{ perspective: 1200 }} className="w-full h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0.2, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 