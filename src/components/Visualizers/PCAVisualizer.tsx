import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const PCAVisualizer: React.FC = () => {
    const [angle, setAngle] = useState<number>(0); // 0 to 180 degrees

    // Gaussian point cloud, elongated along roughly 45 degrees
    const points = [];
    // Just hardcoding some points for safe determinism
    const raw = [
        [-40, -30], [-30, -35], [-20, -10], [-10, -5], [0, 5],
        [10, 15], [20, 10], [30, 25], [40, 35], [50, 40],
        [-15, -25], [5, -5], [25, 20], [35, 15], [-25, -15],
        [-5, 10], [15, 0]
    ];
    
    const thetaRad = (angle * Math.PI) / 180;
    const nx = Math.cos(thetaRad); // normal vector of the line
    const ny = Math.sin(thetaRad);

    let variance = 0;
    const projected = raw.map(p => {
        // Dot product to find length along the vector
        const dot = p[0] * nx + p[1] * ny;
        variance += dot * dot;
        // Projected coordinates
        return {
            x: dot * nx,
            y: dot * ny,
            origX: p[0],
            origY: p[1]
        };
    });
    variance = variance / raw.length; // Max is around 800-900 at 45 deg

    const pyCode = `from sklearn.decomposition import PCA
import numpy as np

# X 包含 N 个样本，每个样本是 D 维
# 我们想把极高维的数据降维到本质的 2 维上
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

# 打印这 2 个主成分到底保留了原始数据多少的信息量 (方差)
print(f"各主成分方差占比: {pca.explained_variance_ratio_}")
print(f"总保留信息量: {sum(pca.explained_variance_ratio_)*100:.1f}%")`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">DIMENSIONALITY // PCA</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center">Rotate the 1D projection axis. PCA seeks the axis where the projected data has the MAXIMUM variance (spread), preserving the most information.</p>
                    
                    <div className="relative w-[300px] h-[300px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-full overflow-hidden shadow-inner mb-6 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="-100 -100 200 200">
                            {/* Grid constraints */}
                            <line x1="-100" y1="0" x2="100" y2="0" stroke="#E2E1D5" strokeWidth="1" opacity="0.5"/>
                            <line x1="0" y1="-100" x2="0" y2="100" stroke="#E2E1D5" strokeWidth="1" opacity="0.5"/>

                            {/* Center Axis (Projection Line) */}
                            <line 
                                x1={-100 * nx} y1={-100 * ny} 
                                x2={100 * nx} y2={100 * ny} 
                                stroke="#5A5A40" strokeWidth="2" 
                            />

                            {/* Points and Projections */}
                            {projected.map((p, i) => (
                                <g key={i}>
                                    {/* Projection line */}
                                    <line 
                                        x1={p.origX} y1={p.origY} 
                                        x2={p.x} y2={p.y} 
                                        stroke="#D4D1C5" strokeWidth="1" strokeDasharray="2 2"
                                    />
                                    {/* Original Point */}
                                    <circle cx={p.origX} cy={p.origY} r="3" fill="#A8A594" opacity="0.4" />
                                    {/* Projected Point */}
                                    <circle cx={p.x} cy={p.y} r="4" fill="#8C8C64" />
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="w-full max-w-[300px] flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-[#A8A594] font-bold uppercase tracking-wider">Projection Angle</span>
                            <span className="text-sm font-mono text-[#5A5A40]">{angle}°</span>
                        </div>
                        <input 
                            type="range" min="0" max="180" step="1" 
                            value={angle} onChange={(e) => setAngle(parseInt(e.target.value))}
                            className="w-full accent-[#5A5A40]"
                        />

                        <div className="mt-4 bg-[#F1F0E8] rounded-xl p-4 border border-[#E2E1D5] flex justify-between items-center">
                            <span className="text-[10px] uppercase text-[#8C8C64] font-bold tracking-wider">Captured Variance</span>
                            {/* visual progress bar */}
                            <div className="w-32 h-2 bg-[#D4D1C5] rounded-full overflow-hidden">
                                <div className="h-full bg-[#8C8C64]" style={{ width: `${Math.min(100, (variance / 850) * 100)}%` }}></div>
                            </div>
                            <span className="font-mono text-[#5A5A40] text-sm">{Math.floor(variance)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
