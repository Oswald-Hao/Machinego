import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const CNNVisualizer: React.FC = () => {
  const [step, setStep] = useState(0);
  const gridSize = 5;
  const kernelSize = 3;
  
  const maxSteps = (gridSize - kernelSize + 1) * (gridSize - kernelSize + 1);

  const nextStep = () => {
    setStep((s) => (s + 1) % maxSteps);
  };

  const kernelX = step % (gridSize - kernelSize + 1);
  const kernelY = Math.floor(step / (gridSize - kernelSize + 1));

  const isKernel = (x: number, y: number) => {
    return x >= kernelX && x < kernelX + kernelSize && y >= kernelY && y < kernelY + kernelSize;
  };

  const pyCode = `import torch
import torch.nn as nn

class BasicCNN(nn.Module):
    def __init__(self):
        super().__init__()
        # 1 input channel (e.g. grayscale image)
        # 16 output channels
        # 3x3 square convolution kernel
        self.conv = nn.Conv2d(in_channels=1, out_channels=16, kernel_size=3)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(kernel_size=2)
        
    def forward(self, x):
        x = self.conv(x)  # 滑动窗口提取特征
        x = self.relu(x)
        x = self.pool(x)  # 下采样
        return x

# 输入: [Batch Size, Channels, Height, Width]
x = torch.randn(1, 1, 5, 5) 
model = BasicCNN()
print(model(x).shape) # 观察经过卷积池化后的张量形状变化`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative min-h-[400px] justify-center">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">OPERATION // CONV2D_SLIDING_WINDOW</div>
        
        <div className="flex items-center gap-12 w-full max-w-2xl justify-center scale-90 md:scale-100 mt-8">
          
          {/* Input Image Grid */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono text-[#8C8C64] uppercase tracking-wider font-bold">Input (5x5)</span>
            <div 
              className="grid gap-1 relative" 
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              <motion.div 
                className="absolute border-4 border-[#5A5A40] rounded bg-[#5A5A40]/10 z-10 pointer-events-none"
                initial={false}
                animate={{
                  x: kernelX * 44, // 40px width + 4px gap
                  y: kernelY * 44,
                  width: kernelSize * 44 - 4,
                  height: kernelSize * 44 - 4
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              {Array.from({length: gridSize * gridSize}).map((_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const active = isKernel(x, y);
                return (
                  <div 
                    key={i} 
                    className={`w-10 h-10 flex items-center justify-center font-mono text-xs rounded transition-colors duration-300 ${active ? 'bg-[#EAE8DD] text-[#5A5A40] border border-[#D4D1C5]' : 'bg-[#FDFBF7] text-[#A8A594] border border-[#E2E1D5]'}`}
                  >
                    {(Math.sin(i*12.3) * 10).toFixed(0)}
                  </div>
                )
              })}
            </div>
            <button 
              onClick={nextStep}
              className="mt-6 px-6 py-2 bg-[#F1F0E8] border border-[#D4D1C5] hover:bg-[#EAE8DD] text-[#5A5A40] rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition shadow-sm"
            >
              Next Step
            </button>
          </div>

          <svg className="w-12 h-12 text-[#E2E1D5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>

          {/* Feature Map Grid */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono text-[#8C8C64] uppercase tracking-wider font-bold">Feature Map (3x3)</span>
            <div 
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${gridSize - kernelSize + 1}, minmax(0, 1fr))` }}
            >
               {Array.from({length: maxSteps}).map((_, i) => {
                  return (
                    <motion.div 
                      key={i}
                      animate={{
                        backgroundColor: i === step ? '#5A5A40' : (i < step ? '#EAE8DD' : '#FDFBF7'),
                        color: i === step ? '#FFFFFF' : '#8C8C64',
                        borderColor: i === step ? '#5A5A40' : '#E2E1D5'
                      }}
                      className="w-10 h-10 border flex items-center justify-center font-mono text-xs rounded"
                    >
                      {i <= step ? 'v' : ''}
                    </motion.div>
                  )
               })}
            </div>
            <div className="mt-4 text-[10px] font-mono text-[#8C8C64] max-w-[120px] text-center leading-relaxed">
              Element-wise multiplication & sum outputs feature value.
            </div>
          </div>

        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
