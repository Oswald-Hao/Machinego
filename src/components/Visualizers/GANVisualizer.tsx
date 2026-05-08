import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const GANVisualizer: React.FC = () => {
    // Real data: two clusters at x=100 and x=300
    const realData = [90, 95, 100, 105, 110, 290, 295, 300, 305, 310];
    
    // Fake data: starts uniformly random or just in the middle
    const [fakeData, setFakeData] = useState([200, 210, 190, 220, 180, 205, 195, 185, 215, 225]);
    
    // Discriminator "confidence" curve (y-axis is probability 0 to 1)
    // Initially struggles, learns to peak at 100 and 300
    const [dPeaks, setDPeaks] = useState([{x:200, w: 200, h: 0.5}]); // simple gaussian representation

    const [epoch, setEpoch] = useState(0);

    const trainDiscriminator = () => {
        // D learns to identify where real data is. 
        // We simulate this by shaping its decision boundary to peak at 100 and 300
        const progress = Math.min(1, (epoch + 1) / 10);
        // Slowly form two peaks
        setDPeaks([
            {x: 100, w: 50 - progress*20, h: 0.5 + progress*0.4},
            {x: 300, w: 50 - progress*20, h: 0.5 + progress*0.4}
        ]);
        setEpoch(e => e + 1);
    };

    const trainGenerator = () => {
        // G looks at D's peaks and moves fake data UP the gradient of D 
        // to fool it. Meaning it moves towards 100 or 300.
        const newFake = fakeData.map(v => {
            // move towards nearest peak
            const target = Math.abs(v - 100) < Math.abs(v - 300) ? 100 : 300;
            // step size
            const step = (target - v) * 0.15 * Math.random();
            return v + step;
        });
        setFakeData(newFake);
        setEpoch(e => e + 1);
    };

    const reset = () => {
        setFakeData([200, 210, 190, 220, 180, 205, 195, 185, 215, 225]);
        setDPeaks([{x:200, w: 200, h: 0.5}]);
        setEpoch(0);
    }

    // Generate SVG path for Discriminator
    const getDPath = () => {
        let pts = [];
        for(let x=0; x<=400; x+=5){
            // superpose gaussians
            let y = 0.1; // base probability
            dPeaks.forEach(p => {
                y += p.h * Math.exp(-Math.pow(x - p.x, 2) / (2 * p.w * p.w));
            });
            // cap at 1.0 (which is top of svg)
            y = Math.min(1.0, y);
            // scale to SVG height (200)
            pts.push(`${x},${200 - y*180}`); 
        }
        return pts.join(" ");
    };

    const pyCode = `import torch
import torch.nn as nn

# 判别器：输入图片，输出它是真实的概率 (0~1)
class Discriminator(nn.Module):
    def forward(self, img):
        # ... 卷积层提取特征 ...
        return torch.sigmoid(output)

# 生成器：输入随机噪声，输出伪造的图片
class Generator(nn.Module):
    def forward(self, noise):
        # ... 逆卷积层放大特征 ...
        return fake_img

# ----【训练循环】----
for real_imgs in dataloader:
    noise = torch.randn(batch_size, 100)
    fake_imgs = generator(noise)

    # 1. 训练判别器 D:
    # 尽可能给真实图片打高分(1)，给伪造图片打低分(0)
    d_loss_real = loss_fn(discriminator(real_imgs), 1)
    d_loss_fake = loss_fn(discriminator(fake_imgs.detach()), 0)
    d_loss = d_loss_real + d_loss_fake
    d_loss.backward()
    d_optimizer.step()

    # 2. 训练生成器 G:
    # 它的目标是刁难判别器，即让判别器对它生成的假图打高分(1)！
    g_loss = loss_fn(discriminator(fake_imgs), 1) 
    g_loss.backward()
    g_optimizer.step()`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">GENERATIVE // GAN</div>
                
                <div className="w-full mt-6 text-center z-10 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-2">Simulate the minimax game. <br/>Blue = Real Images, Green = Fake Images (Generator), Curve = Discriminator's Belief of 'Realness'.</p>
                    
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={trainDiscriminator}
                            className="px-4 py-2 bg-[#5A5A40] text-white rounded-lg text-xs font-bold hover:bg-[#484833] shadow-sm transition"
                        >
                            Step D (Train Discriminator)
                        </button>
                        <button 
                            onClick={trainGenerator}
                            className="px-4 py-2 bg-[#8C8C64] text-white rounded-lg text-xs font-bold hover:bg-[#7a7a56] shadow-sm transition"
                        >
                            Step G (Train Generator)
                        </button>
                    </div>

                    <div className="relative w-full max-w-[400px] h-[250px] mt-8 bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                        <svg className="w-full h-full">
                            {/* D Curve */}
                            <path 
                                d={`M 0 200 L ${getDPath()} L 400 200 Z`}
                                fill="#EAE8DD" opacity="0.5"
                            />
                            <polyline 
                                points={getDPath()} 
                                fill="none" stroke="#D4D1C5" strokeWidth="3"
                                className="transition-all duration-300"
                            />

                            {/* Center Line probability 0.5 */}
                            <line x1="0" y1="110" x2="400" y2="110" stroke="#D4D1C5" strokeDasharray="4 4" strokeWidth="1" />

                            {/* Real Data Drops */}
                            {realData.map((x, i) => (
                                <circle key={`r-${i}`} cx={x} cy={180} r={5} fill="#5A5A40" />
                            ))}

                            {/* Fake Data Drops */}
                            {fakeData.map((x, i) => (
                                <motion.circle 
                                    key={`f-${i}`} 
                                    animate={{ cx: x }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                    cy={160} r={5} fill="#8C8C64" 
                                />
                            ))}
                        </svg>
                        
                        <div className="absolute top-2 left-2 text-[10px] text-[#A8A594] font-mono">Epoch: {epoch}</div>
                        <div className="absolute top-2 right-2 text-[10px] text-[#A8A594] font-mono">D output (1.0 = Real)</div>
                    </div>

                    <button 
                        onClick={reset}
                        className="mt-6 px-6 py-2 bg-white border border-[#E2E1D5] rounded-full text-[10px] text-[#8C8C64] hover:bg-[#FDFBF7] transition uppercase tracking-wider font-bold"
                    >
                        Reset Game
                    </button>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
