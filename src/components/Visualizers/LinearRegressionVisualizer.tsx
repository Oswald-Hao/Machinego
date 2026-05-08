import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const LinearRegressionVisualizer: React.FC = () => {
  const [points, setPoints] = useState<{x: number, y: number}[]>([
    {x: 50, y: 60}, {x: 100, y: 120}, {x: 150, y: 140}, {x: 200, y: 190}, {x: 250, y: 240}
  ]);

  const { w, b, mse } = useMemo(() => {
    if (points.length < 2) return { w: 0, b: 0, mse: 0 };
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    points.forEach(p => {
      sumX += p.x; sumY += p.y;
      sumXY += p.x * p.y; sumXX += p.x * p.x;
    });
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    // Check divide by zero
    const denominator = sumXX - n * meanX * meanX;
    const slope = denominator === 0 ? 0 : (sumXY - n * meanX * meanY) / denominator;
    const intercept = meanY - slope * meanX;
    
    let error = 0;
    points.forEach(p => {
      const pred = slope * p.x + intercept;
      error += Math.pow(p.y - pred, 2);
    });

    return { w: slope, b: intercept, mse: error / n };
  }, [points]);

  const handleAddPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y: 300 - y }]);
  };

  const clearPoints = () => setPoints([]);

  const y1 = w * 0 + b;
  const y2 = w * 400 + b;

  const pyCode = `from sklearn.linear_model import LinearRegression
import numpy as np

# 输入数据 (X) 和目标数据 (y)
X = np.array([[p['x']] for p in points])
y = np.array([p['y'] for p in points])

# 初始化最小二乘法线性回归模型
model = LinearRegression()

# 拟合模型：通过 OLS 寻找使得 MSE (均方误差) 最小的权重 w 和偏置 b
model.fit(X, y)

print(f"Weight (Slope): {model.coef_[0]}")
print(f"Bias (Intercept): {model.intercept_}")`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">FOUNDATION // LINEAR_REGRESSION</div>
        
        <div className="w-full mt-6">
           <p className="text-xs text-[#8C8C64] font-serif italic mb-4 text-center">Click on the canvas to add data points. The model will instantly calculate the best-fit line using Ordinary Least Squares.</p>
           
           <div className="flex justify-center w-full">
               <div className="relative border-l border-b border-[#E2E1D5] w-[400px] h-[300px] bg-[#FDFBF7]">
                   <svg width="400" height="300" className="absolute inset-0 cursor-crosshair overflow-hidden" onClick={handleAddPoint}>
                      {/* Grid for aesthetics */}
                      {Array.from({length: 8}).map((_, i) => (
                        <line key={'v'+i} x1={i*50} y1={0} x2={i*50} y2={300} stroke="#E2E1D5" strokeWidth={0.5} opacity={0.5} />
                      ))}
                      {Array.from({length: 6}).map((_, i) => (
                        <line key={'h'+i} x1={0} y1={i*50} x2={400} y2={i*50} stroke="#E2E1D5" strokeWidth={0.5} opacity={0.5} />
                      ))}

                      {points.length >= 2 && (
                         <motion.line 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           x1={0} y1={300 - y1} x2={400} y2={300 - y2} 
                           stroke="#5A5A40" strokeWidth="2"
                           className="transition-all duration-300 pointer-events-none"
                         />
                      )}
                      
                      {points.map((p, i) => {
                         const predY = w * p.x + b;
                         return (
                           <g key={i}>
                             {points.length >= 2 && (
                               <line x1={p.x} y1={300 - p.y} x2={p.x} y2={300 - predY} stroke="#D4D1C5" strokeDasharray="2 2" strokeWidth={1} />
                             )}
                             <motion.circle 
                               initial={{ r: 0 }}
                               animate={{ r: 4 }}
                               cx={p.x} 
                               cy={300 - p.y} 
                               fill="#8C8C64" 
                             />
                           </g>
                         );
                      })}
                   </svg>
               </div>
           </div>

           <div className="mt-8 grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-wider font-bold max-w-lg mx-auto">
               <div className="bg-[#F1F0E8] p-3 rounded-xl border border-[#E2E1D5] flex flex-col items-center">
                   <span className="text-[#A8A594]">Weight (w)</span>
                   <span className="text-lg text-[#5A5A40] mt-1">{w.toFixed(2)}</span>
               </div>
               <div className="bg-[#F1F0E8] p-3 rounded-xl border border-[#E2E1D5] flex flex-col items-center">
                   <span className="text-[#A8A594]">Bias (b)</span>
                   <span className="text-lg text-[#5A5A40] mt-1">{b.toFixed(2)}</span>
               </div>
               <div className="bg-[#F1F0E8] p-3 rounded-xl border border-[#E2E1D5] flex flex-col items-center">
                   <span className="text-[#A8A594]">MSE (Loss)</span>
                   <span className="text-lg text-[#8C8C64] mt-1">{mse.toFixed(0)}</span>
               </div>
           </div>
           
           <div className="flex justify-center mt-6">
              <button onClick={clearPoints} className="px-4 py-2 bg-white border border-[#E2E1D5] rounded-full text-xs font-bold text-[#8C8C64] hover:bg-[#FDFBF7] transition">
                Clear Points
              </button>
           </div>
        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
