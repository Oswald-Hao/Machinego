import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizProps {
  question: string;
  options: string[];
  correctIndex: number;
}

export const QuizComponent: React.FC<QuizProps> = ({ question, options, correctIndex }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset state when question changes
  React.useEffect(() => {
    setSelected(null);
    setHasSubmitted(false);
  }, [question]);

  return (
    <div className="bg-white border border-[#E2E1D5] rounded-2xl p-6 mt-8 shadow-sm">
      <h3 className="text-sm font-bold text-[#8C8C64] mb-4 uppercase tracking-widest font-sans">Checkpoint Quiz</h3>
      <p className="text-[#5A5A40] font-medium font-sans mb-6 text-sm">{question}</p>
      
      <div className="space-y-3">
        {options.map((opt, idx) => {
          let btnClass = "w-full text-left p-4 rounded border transition-all duration-200 font-sans text-sm ";
          
          if (!hasSubmitted) {
            btnClass += selected === idx 
              ? "bg-[#F1F0E8] border-[#5A5A40] text-[#2D2D2A] font-bold" 
              : "bg-transparent border-[#E2E1D5] text-[#3D3D35] hover:bg-[#F8F7F2]";
          } else {
            if (idx === correctIndex) {
              btnClass += "bg-[#EAF1E8] border-[#8C8C64] text-[#5A5A40] font-bold";
            } else if (selected === idx) {
              btnClass += "bg-[#F1E8E8] border-[#D4A5A5] text-[#A56B6B] line-through";
            } else {
              btnClass += "bg-transparent border-[#E2E1D5] text-[#A8A594] opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={hasSubmitted}
              onClick={() => setSelected(idx)}
              className={btnClass}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected !== null && !hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex justify-end"
          >
            <button 
              onClick={() => setHasSubmitted(true)}
              className="px-8 py-3 bg-[#5A5A40] text-white rounded-full text-sm font-medium hover:bg-[#484833] transition-colors shadow-sm"
            >
              提交答案
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 font-mono text-sm"
          >
            {selected === correctIndex ? (
              <div className="text-[#5A5A40] bg-[#EAF1E8] p-4 rounded-xl border border-[#8C8C64]">
                🎉 回答正确！你已经掌握了本关的核心概念。
              </div>
            ) : (
              <div className="text-[#A56B6B] bg-[#F1E8E8] p-4 rounded-xl border border-[#D4A5A5]">
                ❌ 回答错误。再仔细阅读一下教程内容吧。
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
