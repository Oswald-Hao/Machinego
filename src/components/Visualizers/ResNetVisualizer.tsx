import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const ResNetVisualizer: React.FC = () => {
    const [useSkip, setUseSkip] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Initial gradients: the loss at the end
    const initialGrad = 1.0;
    
    // Attenuation factor per layer (e.g., 0.6)
    const fade = 0.5;

    const layers = 4;

    const runBackprop = () => {
        setIsAnimating(false);
        setTimeout(() => setIsAnimating(true), 50);
    };

    const pyCode = `import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)

    def forward(self, x):
        # 1. 保存一条不受任何影响的“捷径”
        identity = x

        # 2. 正常经过两层网络提取特征
        out = self.conv1(x)
        out = self.relu(out)
        out = self.conv2(out)

        # 3. 最关键的一步：将老特征（捷径）与新特征相加
        # 这保证了如果前面的特征已经足够好，这一层只需拟合“零”即可
        # 同时，反向传播时，梯度畅通无阻地直接回传！
        out += identity 
        out = self.relu(out)
        
        return out`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">ARCHITECTURE // RESNET</div>
                
                <div className="w-full mt-6 text-center z-10 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6">Compare Gradient Flow during Backpropagation (Right to Left).</p>
                    
                    <div className="flex bg-[#F1F0E8] p-1 rounded-xl mb-12">
                        <button 
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${!useSkip ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8C8C64] hover:bg-[#EAE8DD]'}`}
                            onClick={() => setUseSkip(false)}
                        >
                            Plain Network (No Skip)
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${useSkip ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8C8C64] hover:bg-[#EAE8DD]'}`}
                            onClick={() => setUseSkip(true)}
                        >
                            ResNet (Skip Connection)
                        </button>
                    </div>

                    <div className="relative w-full max-w-lg h-[150px] flex items-center justify-between px-4">
                        {/* Final Output (Loss) */}
                        <div className="flex flex-col items-center absolute right-[0%] z-20">
                            <div className="text-[10px] uppercase text-[#8C8C64] font-bold mb-2">Loss</div>
                            <div className="w-12 h-12 bg-[#8C8C64] rounded-full border-4 border-white shadow flex items-center justify-center text-white text-xs font-bold">1.0</div>
                        </div>

                        {/* Network Blocks */}
                        {Array.from({length: layers}).map((_, i) => {
                            // Calculate gradient value at this point based on architecture
                            // Right to Left: i=0 is rightmost (layer 4), i=3 is leftmost (layer 1)
                            const isFirstLayer = i === 3;
                            let gradVal = initialGrad;
                            
                            if (useSkip) {
                                // With skip connection, gradient is roughly 1.0 everywhere on the main trunk
                                gradVal = 1.0;
                            } else {
                                // Without skip, it fades each step
                                gradVal = Math.pow(fade, i + 1);
                            }

                            const xPos = 85 - i * 23;

                            return (
                                <React.Fragment key={`block-${i}`}>
                                    {/* Main Path (Fading in plain net) */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                        <line 
                                            x1={`${xPos + 5}%`} y1="50%" 
                                            x2={`${xPos + 18}%`} y2="50%" 
                                            stroke="#E2E1D5" strokeWidth="4" 
                                        />
                                        {/* Backprop animation main path */}
                                        {isAnimating && (
                                            <motion.line
                                                x1={`${xPos + 18}%`} y1="50%" 
                                                x2={`${xPos + 5}%`} y2="50%" 
                                                stroke="#A56B6B" strokeWidth="6" strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 1 }}
                                                animate={{ pathLength: 1, opacity: 0 }}
                                                transition={{ duration: 0.5, delay: i * 0.5, ease: "linear" }}
                                            />
                                        )}
                                        
                                        {/* Skip Connection Path */}
                                        {useSkip && (
                                            <>
                                                <path 
                                                    d={`M ${xPos + 22}% 50% Q ${xPos + 11}% -20% ${xPos + 5}% 50%`}
                                                    fill="none" stroke="#D4D1C5" strokeWidth="3" strokeDasharray="4 4"
                                                />
                                                {/* Backprop animation skip path */}
                                                {isAnimating && (
                                                    <motion.path
                                                        d={`M ${xPos + 22}% 50% Q ${xPos + 11}% -20% ${xPos + 5}% 50%`}
                                                        fill="none" stroke="#A56B6B" strokeWidth="5" strokeLinecap="round"
                                                        initial={{ pathLength: 0, opacity: 1 }}
                                                        animate={{ pathLength: 1, opacity: 0 }}
                                                        transition={{ duration: 0.3, delay: i * 0.5, ease: "linear" }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </svg>

                                    {/* The Block Node */}
                                    <div className="flex flex-col items-center absolute z-20" style={{ right: `${100 - xPos}%` }}>
                                        <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-mono text-[10px] font-bold shadow-sm bg-white border-[#E2E1D5] text-[#5A5A40]`}>
                                            <div className="flex flex-col items-center">
                                                <span>{isFirstLayer ? 'Input' : `L${layers - i}`}</span>
                                                {isAnimating && (
                                                    <motion.span 
                                                        className="text-[#A56B6B] absolute -bottom-6 bg-white/80 px-1 rounded backdrop-blur-sm shadow-sm"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.5 + 0.3 }}
                                                    >
                                                        ∇ {gradVal.toFixed(3)}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <button 
                        onClick={runBackprop}
                        className="mt-8 px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                    >
                        Simulate Backpropagation
                    </button>
                    
                    {/* Status Note */}
                    <div className="h-8 mt-4">
                        {isAnimating && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
                                className={`text-sm font-bold ${useSkip ? 'text-[#8C8C64]' : 'text-[#A56B6B]'}`}
                            >
                                {useSkip ? "✓ Gradient preserved! Deep layers can learn." : "✗ Gradient vanished! Shallow layers learn nothing."}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
