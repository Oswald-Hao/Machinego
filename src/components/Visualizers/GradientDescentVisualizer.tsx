import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const GradientDescentVisualizer: React.FC = () => {
  const [lr, setLr] = useState(0.1);
  const [history, setHistory] = useState<{x: number, loss: number}[]>([]);
  const [playing, setPlaying] = useState(false);

  // Define a simple loss function: f(x) = 0.5 * x^2 + 20 * sin(0.5 * x) + 20, let's normalize this
  // To make it easy to see local vs global minimum: Let's use x^4 / 100 - x^2 + x
  const fn = (x: number) => Math.pow(x, 4) / 100 - Math.pow(x, 2) + x + 30;
  const dfn = (x: number) => 4 * Math.pow(x, 3) / 100 - 2 * x + 1;

  const startX = -8;

  const reset = () => {
    setHistory([{x: startX, loss: fn(startX)}]);
    setPlaying(false);
  };

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (playing) {
      const step = () => {
        setHistory(prev => {
          const current = prev[prev.length - 1];
          // Gradient descent step
          const nextX = current.x - lr * dfn(current.x);
          const nextLoss = fn(nextX);
          
          // Stop if diverged (NaN or extremely large) or converged
          if (isNaN(nextX) || nextLoss > 200 || Math.abs(current.x - nextX) < 0.001 || prev.length > 50) {
            setPlaying(false);
            return prev;
          }
          return [...prev, { x: nextX, loss: nextLoss }];
        });
      };
      
      const timer = setInterval(step, 400);
      return () => clearInterval(timer);
    }
  }, [playing, lr]);

  // Generate background curve points
  const curvePoints = [];
  for (let x = -10; x <= 10; x += 0.5) {
    const scrX = ((x + 10) / 20) * 400;
    const scrY = 200 - (fn(x) * 2); // Scale Y
    curvePoints.push(`${scrX},${scrY}`);
  }

  const pyCode = `import torch
import torch.nn as nn
import torch.optim as optim

# 初始化我们需要优化的参数 x
# requires_grad=True 意味着 PyTorch 会自动在反向传播时记录它的梯度
x = torch.tensor([-8.0], requires_grad=True)

# 定义优化器 (SGD 代表随机梯度下降)
# 尝试在上方控制台改变 Learning Rate 看看发生了什么
optimizer = optim.SGD([x], lr=${lr})

for epoch in range(50):
    optimizer.zero_grad()      # 清空上一步残留的梯度
    
    # 前向传播：计算当前的 Loss (对应我们的损失曲面)
    loss = (x**4)/100 - (x**2) + x + 30
    
    # 反向传播：自动计算 df(x)/dx
    loss.backward()            
    
    # 梯度下降步进：x = x - lr * x.grad
    optimizer.step()           
    
    print(f"Step {epoch}: x={x.item():.4f}, loss={loss.item():.4f}")`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">OPTIMIZATION // GRADIENT_DESCENT</div>
        
        <div className="w-full max-w-[400px] mt-6">
          <div className="flex justify-between items-center mb-4">
             <div className="flex flex-col gap-1 w-2/3">
                <div className="flex justify-between text-[10px] font-bold text-[#8C8C64] uppercase tracking-wider">
                  <span>Learning Rate (lr)</span>
                  <span className="font-mono text-[#5A5A40] bg-[#F1F0E8] px-2 py-1 rounded">{lr}</span>
                </div>
                <input 
                  type="range" min="0.01" max="1" step="0.01" 
                  value={lr} onChange={e => {setLr(parseFloat(e.target.value)); reset();}} 
                  className="accent-[#5A5A40]"
                  disabled={playing}
                />
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={reset}
                  className="px-3 py-2 bg-[#F1F0E8] text-[#5A5A40] rounded-lg text-xs font-bold hover:bg-[#EAE8DD] transition"
                >Reset</button>
                <button 
                  onClick={() => setPlaying(!playing)}
                  className="px-3 py-2 bg-[#5A5A40] text-white rounded-lg text-xs font-bold hover:bg-[#484833] transition"
                >
                  {playing ? 'Pause' : 'Play'}
                </button>
             </div>
          </div>

          <div className="relative w-full h-[250px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden mt-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
              <polyline 
                points={curvePoints.join(' ')} 
                fill="none" stroke="#D4D1C5" strokeWidth="4" strokeLinejoin="round" 
              />
              
              <AnimatePresence>
                {history.map((pt, i) => {
                  const scrX = ((pt.x + 10) / 20) * 400;
                  const scrY = 200 - (pt.loss * 2);
                  const isLatest = i === history.length - 1;
                  
                  // Ensure it doesn't render out of bounds drastically
                  if (pt.loss > 150) return null;

                  return (
                    <motion.circle
                      key={i}
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ 
                        r: isLatest ? 8 : 4, 
                        opacity: isLatest ? 1 : 0.2,
                        fill: isLatest ? '#5A5A40' : '#A8A594' 
                      }}
                      cx={scrX}
                      cy={scrY}
                    />
                  );
                })}
              </AnimatePresence>
            </svg>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               {history.length > 0 && history[history.length - 1].loss > 100 && (
                 <div className="text-xl font-bold text-[#A56B6B] bg-white/80 px-4 py-2 rounded-lg border border-[#D4A5A5] backdrop-blur-sm -rotate-6">Diverged! 🤯 (lr too high)</div>
               )}
            </div>
            <div className="absolute bottom-3 left-3 text-[10px] text-[#A8A594] font-mono">
              f(x) = x^4/100 - x^2 + x + 30
            </div>
          </div>
        </div>

      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
