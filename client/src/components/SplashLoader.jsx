import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  'Watering the Sakura seeds... 🌸',
  'Polishing cozy polaroids... 📸',
  'Counting relationship milestones... 💖',
  'Syncing our little world... 🏡',
  'Catching floating fireflies... ✨'
];

export default function SplashLoader({ onComplete }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Cycle through loading messages
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);

    const finishTimeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Allow fadeout animation to finish
    }, 3200);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-tr from-sakura-50 to-cozy-cream dark:from-cozy-darkBg dark:to-[#1a162b] select-none"
        >
          {/* Merging Bubble Animation (BubbleBee style) */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Left Bubble (Partner 1) */}
            <motion.div
              initial={{ x: -60, scale: 0.8, opacity: 0.5 }}
              animate={{
                x: [-60, 0, -2],
                scale: [0.8, 1.1, 1],
                opacity: [0.5, 1, 1],
              }}
              transition={{
                duration: 2.2,
                ease: 'easeInOut',
                times: [0, 0.7, 1]
              }}
              className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-sakura-300 to-sakura-400 blur-[2px] shadow-lg shadow-sakura-200/50 flex items-center justify-center text-2xl"
            >
              🌸
            </motion.div>

            {/* Right Bubble (Partner 2) */}
            <motion.div
              initial={{ x: 60, scale: 0.8, opacity: 0.5 }}
              animate={{
                x: [60, 0, 2],
                scale: [0.8, 1.1, 1],
                opacity: [0.5, 1, 1],
              }}
              transition={{
                duration: 2.2,
                ease: 'easeInOut',
                times: [0, 0.7, 1]
              }}
              className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-cozy-purple to-sakura-200 blur-[2px] shadow-lg shadow-pink-200/50 flex items-center justify-center text-2xl"
            >
              ✨
            </motion.div>

            {/* Merged Heart/Blossom Center (appears when they merge) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 0, 1.3, 1],
                opacity: [0, 0, 1, 1],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.65, 0.85, 1],
                ease: 'easeOut'
              }}
              className="absolute w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md border-2 border-sakura-400 z-10 text-xl font-bold"
            >
              ❤️
            </motion.div>

            {/* Glowing rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.8],
                opacity: [0.4, 0]
              }}
              transition={{
                delay: 1.5,
                duration: 1.2,
                ease: 'easeOut'
              }}
              className="absolute w-24 h-24 rounded-full border-2 border-sakura-400"
            />
          </div>

          {/* Text headers */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mt-6"
          >
            <h1 className="font-kosugi text-3xl font-black bg-gradient-to-r from-sakura-500 to-sakura-600 dark:from-sakura-400 dark:to-cozy-darkAccent bg-clip-text text-transparent tracking-wide">
              Shinoraa
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Our Little Sakura World 🌸</p>
          </motion.div>

          {/* Dynamic loading subtexts */}
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-12 h-6 text-xs text-slate-400 font-bold italic"
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
