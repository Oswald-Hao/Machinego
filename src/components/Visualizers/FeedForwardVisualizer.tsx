import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const FeedForwardVisualizer: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLayer((l) => (l + 1) % 4);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const layers = [
    { id: 'input', nodes: 3, label: '输入层' },
    { id: 'hidden1', nodes: 5, label: '隐藏层 1' },
    { id: 'hidden2', nodes: 4, label: '隐藏层 2' },
    { id: 'output', nodes: 2, label: '输出层' }
  ];

  const pyCode = `import torch
import torch.nn as nn

class FFN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(3, 5),   # 输入层 -> 隐藏层1
            nn.ReLU(),
            nn.Linear(5, 4),   # 隐藏层1 -> 隐藏层2
            nn.ReLU(),
            nn.Linear(4, 2)    # 隐藏层2 -> 输出层
        )
        
    def forward(self, x):
        return self.net(x)

# 测试前向传播
model = FFN()
x = torch.randn(1, 3) # Batch=1, Features=3
output = model(x)
print(output.shape) # Output shape: (1, 2)`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px] justify-center">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">ARCHITECTURE // FORWARD_PASS</div>
        
        <div className="flex justify-between items-center w-full max-w-2xl relative z-10 mt-8">
          {layers.map((layer, lIdx) => (
            <div key={layer.id} className="flex flex-col gap-4 items-center relative">
              <div className="text-[10px] text-[#A8A594] font-mono absolute -top-8 w-24 text-center">{layer.label}</div>
              {Array.from({length: layer.nodes}).map((_, nIdx) => (
                <div key={nIdx} className="relative">
                  <motion.div 
                    animate={{
                      scale: activeLayer === lIdx ? 1.2 : 1,
                      backgroundColor: activeLayer === lIdx ? '#5A5A40' : '#FDFBF7',
                      borderColor: activeLayer === lIdx ? '#8C8C64' : '#D4D1C5'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-8 h-8 rounded-full border-2 relative z-20 flex items-center justify-center shadow-sm"
                  />
                  
                  {/* Edges to next layer */}
                  {lIdx < layers.length - 1 && (
                    <svg className="absolute top-4 left-4 w-[150px] h-0 overflow-visible z-0 pointer-events-none">
                      {Array.from({length: layers[lIdx+1].nodes}).map((_, targetIdx) => {
                        const yOffset = (targetIdx - (layers[lIdx+1].nodes - 1) / 2) * 48 - (nIdx - (layer.nodes - 1) / 2) * 48;
                        const isActiveEdge = activeLayer === lIdx;
                        return (
                          <motion.line 
                            key={'edge-'+targetIdx}
                            x1={0} y1={0} 
                            x2={100} y2={yOffset}
                            stroke={isActiveEdge ? '#5A5A40' : '#E2E1D5'}
                            strokeWidth={isActiveEdge ? 2 : 1}
                            initial={{ pathLength: 0, opacity: 0.3 }}
                            animate={{ 
                              pathLength: isActiveEdge ? 1 : 0, 
                              opacity: isActiveEdge ? 0.8 : 0.5 
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
