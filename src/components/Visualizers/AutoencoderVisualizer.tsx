import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const AutoencoderVisualizer: React.FC = () => {
    // 2D latent space values
    const [z1, setZ1] = useState(0.5);
    const [z2, setZ2] = useState(0);

    // Just a fun mathematical mapping to generate a 3x3 pattern from 2 variables
    // so user feels they are controlling a generative latent space
    const getPixel = (x: number, y: number) => {
        // center is 1,1
        const dist = Math.sqrt(Math.pow(x-1, 2) + Math.pow(y-1, 2));
        const val = z1 * Math.sin(x*y*z2*5) + z2 * Math.cos(dist*z1*10);
        
        // map to 0-1 opacity of a dark color
        const op = Math.max(0, Math.min(1, (val + 1) / 2));
        return `rgba(90, 90, 64, ${op})`;
    };

    const pyCode = `import torch.nn as nn

class Autoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        # Encoder (编码器): 将巨大的输入(784像素)压缩成极小的信息瓶颈(2维 Latent Space)
        self.encoder = nn.Sequential(
            nn.Linear(784, 128),
            nn.ReLU(),
            nn.Linear(128, 2) # Bottleneck!
        )
        
        # Decoder (解码器): 尝试仅根据这 2 维核心密码，无损还原原始的输入数据
        self.decoder = nn.Sequential(
            nn.Linear(2, 128),
            nn.ReLU(),
            nn.Linear(128, 784),
            nn.Sigmoid()
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
        
# 训练目标: Loss = MSE(原始输入x, 解码输出decoded)
# 被强迫挤过极小瓶颈的特征，必然是数据最脱水的精华（如笔画粗细、倾斜度）`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">LATENT_SPACE // AUTOENCODER</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center max-w-md">Force data through a tiny bottleneck. It learns to compress (encode) the absolute essence of the data, which can then be decompressed (decoded) to reconstruct it.</p>
                    
                    <div className="flex items-center gap-4 w-full max-w-[500px] mb-8">
                        {/* Original Image */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-[10px] uppercase font-bold text-[#A8A594]">Input Data</div>
                            <div className="grid grid-cols-3 gap-0 border border-[#E2E1D5]">
                                {Array.from({length: 9}).map((_, i) => (
                                    <div key={i} className="w-8 h-8 bg-[#5A5A40]" style={{opacity: 0.5}} />
                                ))}
                            </div>
                        </div>

                        {/* Encoder Polygon */}
                        <svg width="40" height="60" className="opacity-50">
                            <polygon points="0,0 40,20 40,40 0,60" fill="#D4D1C5"/>
                        </svg>

                        {/* Bottleneck (Latent Space) Controls */}
                        <div className="flex flex-col bg-[#FDFBF7] p-4 rounded-xl border border-[#E2E1D5] flex-1">
                            <div className="text-[10px] uppercase font-bold text-[#8C8C64] text-center mb-4">Bottleneck (Latent Z)</div>
                            <div className="flex gap-2 items-center mb-2">
                                <span className="font-mono text-xs text-[#5A5A40]">z1</span>
                                <input type="range" min="-1" max="1" step="0.01" value={z1} onChange={e=>setZ1(parseFloat(e.target.value))} className="w-full accent-[#5A5A40]" />
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="font-mono text-xs text-[#5A5A40]">z2</span>
                                <input type="range" min="-1" max="1" step="0.01" value={z2} onChange={e=>setZ2(parseFloat(e.target.value))} className="w-full accent-[#5A5A40]" />
                            </div>
                        </div>

                        {/* Decoder Polygon */}
                        <svg width="40" height="60" className="opacity-50">
                            <polygon points="0,20 40,0 40,60 0,40" fill="#D4D1C5"/>
                        </svg>

                        {/* Reconstructed Image */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-[10px] uppercase font-bold text-[#A56B6B]">Reconstruction</div>
                            <div className="grid grid-cols-3 gap-0 border border-[#A56B6B]">
                                {Array.from({length: 3}).map((_, y) => 
                                    Array.from({length: 3}).map((_, x) => (
                                        <div key={`out-${x}-${y}`} className="w-8 h-8 transition-colors duration-100" style={{background: getPixel(x, y)}} />
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
