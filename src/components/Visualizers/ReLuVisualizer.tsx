import React, { useState, useMemo } from 'react';
import { CodeExport } from '../CodeExport';

const VIEW_MIN_X = -10;
const VIEW_MAX_X = 10;
const VIEW_MIN_Y = -10;
const VIEW_MAX_Y = 10;

// Transforms standard coordinates to SVG viewBox coords
const mapX = (x: number) => ((x - VIEW_MIN_X) / (VIEW_MAX_X - VIEW_MIN_X)) * 400;
const mapY = (y: number) => 400 - ((y - VIEW_MIN_Y) / (VIEW_MAX_Y - VIEW_MIN_Y)) * 400; // Flip Y

export const ReLuVisualizer: React.FC = () => {
  const [params, setParams] = useState([
    { w: 1, b: -5 },
    { w: -2, b: -2 },
    { w: 1.5, b: 2 },
    { w: -0.5, b: 5 },
  ]);

  const updateParam = (idx: number, field: 'w' | 'b', val: number) => {
    const newParams = [...params];
    newParams[idx][field] = val;
    setParams(newParams);
  };

  // Replaced getPoints with inline useMemo

  const targetPoints = useMemo(() => {
    const pts = [];
    // Target is a slightly asymmetric U-curve
    for (let x = VIEW_MIN_X; x <= VIEW_MAX_X; x += 0.2) {
      // Create a complex curve that can be approximated by roughly 4 ReLUs
      // Target function approx: f(x) = 0.5*max(0, -x-5) + max(0, x-2) + 0.5*max(0, x-5) etc.
      // We will define specific ReLU parameters for target:
      // w1=-0.8,b1=-3 | w2=0.5,b2=-2 | w3=1.2,b3=2 | w4=1.5,b4=5
      const y = -1.2 * Math.max(0, -x - 2) + Math.max(0, x + 4) * 0.2 + 0.8 * Math.max(0, x - 2) + (-0.5) * Math.max(0, x - 6) + 4;
      pts.push({x, y: y});
    }
    return pts;
  }, []);

  const { points, reluPoints, mse } = useMemo(() => {
    const points = [];
    const reluPoints = [[], [], [], []] as {x: number, y: number}[][];
    let totalSqErr = 0;
    
    // Generate graph points
    let idx = 0;
    for (let x = VIEW_MIN_X; x <= VIEW_MAX_X; x += 0.2) {
      let sumY = 0;
      params.forEach((p, pIdx) => {
        const yLine = p.w * Math.max(0, x - p.b);
        sumY += yLine;
        reluPoints[pIdx].push({x, y: yLine});
      });
      points.push({x, y: sumY});
      
      const diff = sumY - targetPoints[idx].y;
      totalSqErr += diff * diff;
      idx++;
    }
    return { points, reluPoints, mse: totalSqErr / idx };
  }, [params, targetPoints]);

  const serializePath = (pts: {x: number, y: number}[]) => {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');
  };

  const colors = ['#8C8C64', '#A8A594', '#D4D1C5', '#5A5A40'];

  const pyCode = `import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# 构建包含 4 个神经元的单层 ReLU 网络
class ReLUNet(nn.Module):
    def __init__(self):
        super().__init__()
        # 1-Dimensional input, 4-Dimensional hidden
        self.linear1 = nn.Linear(1, 4)
        self.relu = nn.ReLU()
        # 4-Dimensional hidden to 1-Dimensional output (Sum)
        self.linear2 = nn.Linear(4, 1, bias=False)

    def forward(self, x):
        # 此时权重对应我们在可视化面板中调整的数值
        x = self.linear1(x)
        x = self.relu(x)
        x = self.linear2(x)
        return x

net = ReLUNet()`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">FUNCTION_VISUALIZER // MODE: RELU_SUPERPOSITION</div>
        
        {/* SVG Graph Plotter */}
        <div className="relative w-full aspect-square md:w-[400px] md:h-[400px] mt-8 bg-[#F8F7F2] rounded-2xl overflow-hidden border border-[#E2E1D5] flex-shrink-0">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Grid lines */}
            {[...Array.from({length: 21})].map((_, i) => (
              <line key={'v'+i} x1={i*20} y1={0} x2={i*20} y2={400} stroke="#E2E1D5" strokeWidth={i===10?2:0.5} />
            ))}
            {[...Array.from({length: 21})].map((_, i) => (
              <line key={'h'+i} x1={0} y1={i*20} x2={400} y2={i*20} stroke="#E2E1D5" strokeWidth={i===10?2:0.5} />
            ))}
            
            {/* Target function */}
            <path 
              d={serializePath(targetPoints)} 
              fill="none" 
              stroke="#D4D1C5" 
              strokeWidth={3} 
              strokeDasharray="6 6"
              opacity={0.6}
            />

            {/* Individual ReLUs */}
            {reluPoints.map((pts, i) => (
              <path 
                key={i} 
                d={serializePath(pts)} 
                fill="none" 
                stroke={colors[i]} 
                strokeWidth={2} 
                strokeDasharray="4 4"
                opacity={0.6}
              />
            ))}
            
            {/* Aggregated function */}
            <path 
              d={serializePath(points)} 
              fill="none" 
              stroke="#5A5A40" 
              strokeWidth={4} 
            />
          </svg>
          <div className="absolute top-2 right-2 text-[10px] text-[#A8A594] font-mono bg-[#FFFFFF]/80 p-1 px-2 rounded border border-[#E2E1D5]">X (-10 to 10), Y (-10 to 10)</div>
          
          <div className="absolute bottom-4 left-4 bg-[#FDFBF7] border border-[#E2E1D5] rounded-lg p-3 shadow-sm">
             <div className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C64] mb-1">Loss (MSE)</div>
             <div className={`text-2xl font-mono font-bold ${mse < 2 ? 'text-[#8C8C64]' : 'text-[#A56B6B]'}`}>
                {mse.toFixed(2)}
             </div>
             {mse < 2 && <div className="text-[10px] text-[#8C8C64] font-bold mt-1">✓ Perfect Match!</div>}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4 w-full mt-6 md:mt-8 pt-6 border-t border-[#F1F0E8] w-full">
          {params.map((p, i) => (
            <div key={i} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E2E1D5]">
              <div className="flex justify-between items-center mb-3" style={{color: colors[i]}}>
                <span className="font-bold text-xs uppercase tracking-wider">Unit_{i+1}</span>
                <span className="font-mono text-[10px] bg-[#F1F0E8] px-2 py-1 rounded">w: {p.w.toFixed(1)}, b: {p.b.toFixed(1)}</span>
              </div>
              <div className="flex flex-col gap-3 text-[10px] text-[#6B6B5E] font-mono">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>Weight</span></div>
                  <input type="range" min="-3" max="3" step="0.1" value={p.w} onChange={(e) => updateParam(i, 'w', parseFloat(e.target.value))} className="w-full accent-[#5A5A40]" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>Bias</span></div>
                  <input type="range" min="-10" max="10" step="0.5" value={p.b} onChange={(e) => updateParam(i, 'b', parseFloat(e.target.value))} className="w-full accent-[#5A5A40]" />
                </div>
              </div>
            </div>
          ))}
          <div className="col-span-2 bg-[#F1F0E8] text-[#5A5A40] border border-[#5A5A40]/20 rounded-xl p-4 text-[11px] font-mono flex items-center justify-center">
            Function: y = Σ w_i * max(0, x - b_i)
          </div>
        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
