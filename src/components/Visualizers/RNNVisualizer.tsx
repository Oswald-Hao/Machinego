import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const RNNVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const timeSteps = 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % timeSteps);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const pyCode = `import torch
import torch.nn as nn

class BasicRNN(nn.Module):
    def __init__(self):
        super().__init__()
        # input_size=10 (例如词向量维度)
        # hidden_size=20 (隐状态特征维度)
        self.rnn = nn.RNN(input_size=10, hidden_size=20, batch_first=True)
        self.fc = nn.Linear(20, 2) # 最后输出为2分类
        
    def forward(self, x):
        # x shape: [batch, sequence_length, input_size]
        out, h_n = self.rnn(x)
        
        # 我们只取序列最后一个时间步的隐状态作为句子特征进行分类
        out = self.fc(out[:, -1, :]) 
        return out

model = BasicRNN()
# 一句话含有 4 个单词 (seq_len=4)，每个单词由 length 10 向量表示
x = torch.randn(1, 4, 10) 
print(model(x).shape) # (1, 2)`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative min-h-[400px] justify-center overflow-hidden">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">ARCHITECTURE // RNN_UNROLL</div>
        
        <div className="flex gap-12 relative z-10 w-full overflow-x-auto justify-center md:pb-0 pb-10 mt-8">
          {Array.from({length: timeSteps}).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-6 relative">
              {/* x_t */}
              <motion.div 
                animate={{
                  scale: i === activeStep ? 1.1 : 1,
                  opacity: i <= activeStep ? 1 : 0.3
                }}
                className="w-12 h-12 bg-[#FDFBF7] border-2 border-[#D4D1C5] rounded-xl flex items-center justify-center font-mono text-[#5A5A40] font-bold relative z-20 shadow-sm"
              >
                X<sub className="text-[10px] leading-none ml-0.5">{i}</sub>
              </motion.div>

              {/* Vertical arrow */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: i <= activeStep ? 24 : 0 }}
                className="w-0.5 bg-[#E2E1D5] origin-top"
              />

              {/* h_t */}
              <motion.div 
                animate={{
                  backgroundColor: i === activeStep ? '#5A5A40' : (i < activeStep ? '#EAE8DD' : '#FDFBF7'),
                  borderColor: i === activeStep ? '#5A5A40' : (i < activeStep ? '#D4D1C5' : '#E2E1D5'),
                  color: i === activeStep ? '#FFFFFF' : '#8C8C64',
                  opacity: i <= activeStep ? 1 : 0.3
                }}
                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-bold shadow-sm relative z-20"
              >
                H<sub className="text-[10px] leading-none ml-0.5">{i}</sub>
              </motion.div>

              {/* Horizontal arrow to next H_t */}
              {i < timeSteps - 1 && (
                <svg className="absolute top-[88px] left-[64px] w-12 h-4 overflow-visible pointer-events-none z-10">
                  <motion.line
                    x1={0} y1={0} x2={48} y2={0}
                    stroke="#5A5A40"
                    strokeWidth={2}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: i < activeStep ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  {i < activeStep && (
                    <polygon points="44,-4 44,4 52,0" fill="#5A5A40" />
                  )}
                </svg>
              )}

              {/* y_t (Optional output) */}
              {i === timeSteps - 1 && (
                <>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: i <= activeStep ? 24 : 0 }}
                    className="w-0.5 bg-[#E2E1D5] origin-top"
                  />
                  <motion.div 
                    animate={{
                      scale: i === activeStep ? 1.1 : 1,
                      opacity: i <= activeStep ? 1 : 0.3
                    }}
                    className="w-12 h-12 bg-[#F1F0E8] border-2 border-[#D4D1C5] rounded-full flex items-center justify-center font-mono text-[#5A5A40] font-bold relative z-20"
                  >
                    Y
                  </motion.div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
