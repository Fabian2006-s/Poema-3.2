'use client';

import { motion } from 'framer-motion';

export function HolaMundo() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-80"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35), transparent 18%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.28), transparent 22%), radial-gradient(circle at 50% 80%, rgba(59,130,246,0.15), transparent 28%)',
          backgroundSize: '200% 200%',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-6 flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-7xl font-extrabold tracking-tighter sm:text-8xl md:text-9xl"
          >
            Hola
          </motion.span>
          <motion.span
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="text-7xl font-extrabold tracking-tighter text-blue-300 sm:text-8xl md:text-9xl"
          >
            Mundo
          </motion.span>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.0, ease: 'easeInOut' }}
          className="h-px w-40 bg-gradient-to-r from-transparent via-white to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="mt-6 max-w-xl text-lg font-light tracking-[0.2em] text-white/70 uppercase"
        >
          Sistema Fullstack TypeScript
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 1.6, stiffness: 260, damping: 20 }}
          className="mt-8 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-sm text-blue-100 shadow-lg backdrop-blur-md"
        >
          TS • Next.js • JSON DB
        </motion.div>
      </motion.div>
    </div>
  );
}
