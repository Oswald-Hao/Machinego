import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const BatchNormVisualizer: React.FC = () => {
    const [normalized, setNormalized] = useState<boolean>(false);

    // X axis covers -10 to +10. We have 2 distributions (Layer 1 output before/after BN)
    // Unnormalized: mean = 6, std = 2
    // Normalized: mean = 0, std = 1

    const getCurve = (mean: number, std: number) => {
        let pts = [];
        for (let x = -10; x <= 10; x += 0.2) {
            const y = Math.exp(-Math.pow(x - mean, 2) / (2 * std * std)) / (std * Math.sqrt(2 * Math.PI));
            // mapping to svg coords (width 400, height 200)
            const sx = ((x + 10) / 20) * 400;
            const sy = 200 - (y * 400); // 400 is arbitrary scaling to fit SVG height
            pts.push(`${sx},${sy}`);
        }
        return pts.join(" ");
    };

    const pyCode = `import torch.nn as nn

class MyNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        # 假设第一隐藏层产生 64 维特征
        self.fc1 = nn.Linear(128, 64)
        
        # 紧跟在 Linear/Conv 层之后，激活函数之前！
        # 强制将这 64 维数据的分布拉回到 均值=0，方差=1
        self.bn1 = nn.BatchNorm1d(64) 
        
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.fc1(x)    # 前面的矩阵乘法可能导致数据完全偏移到了十几、或者负几十
        x = self.bn1(x)    # ✨强行拉回 N(0, 1) 的正态分布，确保处于激活函数的高敏度区间且不梯度弥散
        x = self.relu(x)
        return x`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">STABILIZATION // BATCH_NORM</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center max-w-sm">"Internal Covariate Shift": As weights update, hidden layers' inputs randomly drift. BN centers them back to Mean=0, Std=1.</p>
                    
                    <div className="relative w-full max-w-[400px] h-[200px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] mb-8">
                        <svg className="w-full h-full">
                            {/* Grid lines */}
                            <line x1="200" y1="0" x2="200" y2="200" stroke="#D4D1C5" strokeDasharray="4 4" strokeWidth="2" />
                            <text x="200" y="15" fontSize="10" fill="#A8A594" textAnchor="middle" opacity="0.6">μ = 0</text>
                            
                            <motion.path 
                                d={`M 0 200 L ${getCurve(6, 2)} L 400 200 Z`}
                                fill="#A56B6B" opacity="0.5"
                                animate={normalized ? { d: `M 0 200 L ${getCurve(0, 1)} L 400 200 Z`, fill: "#8C8C64" } : undefined}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            />
                        </svg>

                        <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-white/80 p-1 px-2 rounded border border-[#E2E1D5] flex flex-col text-[#5A5A40]">
                            <span>Current Mean (μ): {normalized ? "0.0" : "6.0"}</span>
                            <span>Current Std (σ): {normalized ? "1.0" : "2.0"}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-[#F1F0E8] font-mono text-sm px-4 py-2 rounded-lg border border-[#E2E1D5] text-[#5A5A40] flex items-center">
                            y = (x - μ) / σ * γ + β
                        </div>
                        <button 
                            onClick={() => setNormalized(!normalized)}
                            className="px-6 py-2 bg-[#5A5A40] text-white rounded-lg text-xs font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                        >
                            {normalized ? "Reset Network Drift" : "Apply Batch Norm"}
                        </button>
                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
