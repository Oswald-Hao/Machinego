import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const DropoutVisualizer: React.FC = () => {
    // 6 hidden nodes
    const [activeNodes, setActiveNodes] = useState<boolean[]>([true, true, true, true, true, true]);
    const inputNodes = 3;
    const hiddenNodes = 6;
    const outputNodes = 2;

    const applyDropout = () => {
        // Randomly dropout ~50%
        const newActive = Array.from({length: hiddenNodes}, () => Math.random() > 0.5);
        // Ensure at least one is active so visualization isn't completely empty
        if (newActive.every(a => !a)) newActive[0] = true;
        setActiveNodes(newActive);
    };

    const resetDropout = () => {
        setActiveNodes([true, true, true, true, true, true]);
    }

    const pyCode = `import torch
import torch.nn as nn

class DropoutNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(3, 6)
        
        # 训练时随机将一部分神经元输出置为 0 (p=0.5 即 50%)
        # 这能强制迫使网络不依赖特定的节点，防止“共适应”导致过拟合
        self.dropout = nn.Dropout(p=0.5) 
        
        self.fc2 = nn.Linear(6, 2)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)  # Dropout 起效，随机断开连接
        x = self.fc2(x)
        return x
        
# 注意：在模型评估 (model.eval()) 时，Dropout 会自动关闭
# 所有节点都会恢复工作，但它们的权重会被乘以 (1-p) 进行缩放缩放`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">REGULARIZATION // DROPOUT</div>
                
                <div className="w-full mt-6 text-center z-10">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6">Click "Forward Pass" to simulate training. Dropout randomly disables ~50% of the hidden neurons.</p>
                </div>
                
                <div className="flex justify-between items-center w-full max-w-lg relative z-10 my-4 px-6 h-[200px]">
                    {/* SVG Connections container */}
                    <svg className="absolute inset-0 w-full h-[200px]" style={{ zIndex: -1 }}>
                        <defs>
                            <linearGradient id="fadeEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#E2E1D5" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#A8A594" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                        {Array.from({length: inputNodes}).map((_, i) =>
                            Array.from({length: hiddenNodes}).map((_, h) => (
                                <motion.line 
                                    key={`in-${i}-${h}`}
                                    x1="12%" y1={`${15 + i * 35}%`} 
                                    x2="50%" y2={`${(h * 100/5) * 0.8 + 10}%`} 
                                    stroke="#E2E1D5" 
                                    strokeWidth={activeNodes[h] ? 1.5 : 0.5}
                                    strokeDasharray={activeNodes[h] ? "none" : "2 2"}
                                    animate={{ opacity: activeNodes[h] ? 0.6 : 0.1 }}
                                />
                            ))
                        )}
                        {Array.from({length: hiddenNodes}).map((_, h) =>
                            Array.from({length: outputNodes}).map((_, o) => (
                                <motion.line 
                                    key={`out-${h}-${o}`}
                                    x1="50%" y1={`${(h * 100/5) * 0.8 + 10}%`} 
                                    x2="88%" y2={`${30 + o * 40}%`} 
                                    stroke={activeNodes[h] ? "url(#fadeEdge)" : "#E2E1D5"} 
                                    strokeWidth={activeNodes[h] ? 2 : 0.5}
                                    strokeDasharray={activeNodes[h] ? "none" : "2 2"}
                                    animate={{ opacity: activeNodes[h] ? 0.8 : 0.1 }}
                                />
                            ))
                        )}
                    </svg>
                    
                    {/* Input Layer */}
                    <div className="flex flex-col gap-6 items-center">
                        {Array.from({length: inputNodes}).map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#A8A594] bg-[#FDFBF7] flex items-center justify-center font-mono text-[10px] text-[#A8A594]">in</div>
                        ))}
                    </div>
                    
                    {/* Hidden Layer with Dropout */}
                    <div className="flex flex-col gap-2 items-center">
                        {Array.from({length: hiddenNodes}).map((_, i) => (
                            <motion.div 
                                key={i} 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-[10px] shadow-sm`}
                                animate={{ 
                                    borderColor: activeNodes[i] ? '#5A5A40' : '#E2E1D5',
                                    background: activeNodes[i] ? '#F1F0E8' : '#FDFBF7',
                                    color: activeNodes[i] ? '#5A5A40' : '#E2E1D5',
                                    scale: activeNodes[i] ? 1 : 0.9,
                                    opacity: activeNodes[i] ? 1 : 0.4
                                }}
                            >
                                h{i}
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* Output Layer */}
                    <div className="flex flex-col gap-8 items-center">
                        {Array.from({length: outputNodes}).map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shadow-md font-mono text-xs">out</div>
                        ))}
                    </div>
                </div>
                
                <div className="flex mt-8 gap-4">
                    <button 
                        onClick={applyDropout}
                        className="px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                    >
                        Forward Pass (Apply)
                    </button>
                    <button 
                        onClick={resetDropout}
                        className="px-6 py-2 bg-[#F1F0E8] border border-[#E2E1D5] rounded-full text-[10px] text-[#8C8C64] hover:bg-[#EAE8DD] transition uppercase tracking-wider font-bold"
                    >
                        Eval Mode (Reset)
                    </button>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
