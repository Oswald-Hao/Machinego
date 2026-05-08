import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const DiffusionVisualizer: React.FC = () => {
    // Timestep T from 0 (perfect signal) to 100 (pure gaussian noise)
    const [t, setT] = useState(0);
    const [isReversing, setIsReversing] = useState(false);

    // A deterministic "clean" pattern: a simple smiley or cross matrix (8x8)
    const cleanImage = [
        0,0,1,1,1,1,0,0,
        0,1,0,0,0,0,1,0,
        1,0,1,0,0,1,0,1,
        1,0,0,0,0,0,0,1,
        1,0,1,0,0,1,0,1,
        1,0,0,1,1,0,0,1,
        0,1,0,0,0,0,1,0,
        0,0,1,1,1,1,0,0,
    ];

    // Pre-calculate random noise seeds for determinism
    const [noiseMap] = useState(() => Array.from({length: 64}, () => (Math.random() * 2) - 1));

    // Combine clean + noise based on T
    // As T -> 100, alpha -> 0
    const alpha = Math.max(0, 1 - (t / 100)); // simplifies diffusion schedule

    // pixel value blending
    const getPix = (idx: number) => {
        const clean = cleanImage[idx] === 1 ? -1 : 1; // map clean to -1 and 1
        const noise = noiseMap[idx];
        const combined = (clean * alpha) + (noise * (1 - alpha));
        
        // map combined (-1 to 1) to a grayscale (or in our case beige to dark)
        const intensity = Math.max(0, Math.min(1, (combined + 1)/2));
        // color interpolation between #FDFBF7 (light) and #5A5A40 (dark)
        // using simple opacity for UI
        return `rgba(90, 90, 64, ${1 - intensity})`; 
    };

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isReversing && t > 0) {
            timer = setInterval(() => {
                setT(prev => {
                    if (prev <= 2) {
                        setIsReversing(false);
                        return 0;
                    }
                    return prev - 2;
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [isReversing, t]);

    const pyCode = `import torch
from diffusers import DDPMPipeline

# 扩散模型是一个加噪与去噪的马尔可夫链
# Forward Pass (加噪): 每一步向图片随机添加高斯噪声，直至完全变成雪花点。
# Reverse Pass (去噪): UNet 模型学习预测并减去当前的噪声，从死胡同里一步步倒退走回来。

# 这里展示一段调用 HuggingFace Diffusers 快速生成图像的极简代码
pipe = DDPMPipeline.from_pretrained("google/ddpm-celebahq-256")
pipe.to("cuda")

# 模型从 T=1000 的纯随机噪声图开始，一步步进行 UNet 预测，最终"无中生有"生成了一张惊艳的高清人脸！
image = pipe(num_inference_steps=50).images[0]
image.save("generated_face.png")`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">AIGC // DIFFUSION</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center max-w-sm">Forward: Gradually destroy data with gaussian noise until Pure Noise.<br/>Reverse: Let the UNet predict and subtract the noise step-by-step.</p>
                    
                    <div className="flex flex-col items-center mb-8 bg-[#FDFBF7] p-8 border border-[#E2E1D5] rounded-xl shadow-inner">
                        <div className="grid grid-cols-8 gap-0 border border-[#E2E1D5]">
                            {Array.from({length: 64}).map((_, i) => (
                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8" style={{background: getPix(i), transition: isReversing ? "none" : "background 0.1s"}} />
                            ))}
                        </div>
                        
                        <div className="text-[10px] text-[#5A5A40] font-mono font-bold mt-4 uppercase">
                            Timestep T: {t} {t === 0 ? "(Clean Data)" : t === 100 ? "(Pure Noise!)" : ""}
                        </div>
                    </div>

                    <div className="w-full max-w-[400px] flex flex-col items-center gap-4">
                        <div className="flex w-full gap-4 items-center">
                            <span className="text-[10px] font-bold text-[#8C8C64]">Signal</span>
                            <input 
                                type="range" min="0" max="100" step="1" 
                                value={t} onChange={(e) => setT(parseInt(e.target.value))}
                                className="w-full accent-[#5A5A40]"
                                disabled={isReversing}
                            />
                            <span className="text-[10px] font-bold text-[#A56B6B]">Noise</span>
                        </div>
                        
                        {t === 100 && !isReversing && (
                            <button 
                                onClick={() => setIsReversing(true)}
                                className="px-6 py-2 bg-[#A56B6B] text-white rounded-full text-[10px] font-bold hover:bg-[#8e5a5a] transition shadow-sm uppercase tracking-wider animate-bounce"
                            >
                                Simulate Denoising (Reverse Diffusion)
                            </button>
                        )}
                        {isReversing && (
                            <div className="text-[10px] text-[#A56B6B] font-bold uppercase tracking-wider animate-pulse">
                                U-Net predicting and subtracting noise...
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
