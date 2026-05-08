import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const SVMVisualizer: React.FC = () => {
    const [optimized, setOptimized] = useState(false);

    // Initial naive line
    const naiveLine = { x1: 200, y1: 0, x2: 200, y2: 300, nx: 1, ny: 0, offset: 0 };
    // Optimized line (SVM max margin)
    // equation approx: y = x/2 + 100 => x - 2y + 200 = 0
    const optLine = { x1: 50, y1: 125, x2: 350, y2: 275, nx: 0.5, ny: -1, offset: 40 };

    const line = optimized ? optLine : naiveLine;

    const pyCode = `from sklearn.svm import SVC
import numpy as np

# 我们有两个类别的特征点
X = np.array([[50, 150], [100, 180], [300, 80], [350, 120]])
y = np.array([0, 0, 1, 1])

# 初始化支持向量机，使用线性核构建超平面
# C是惩罚系数，值越大，对错分的容忍度越低 (Hard Margin)
model = SVC(kernel='linear', C=1.0)
model.fit(X, y)

# 打印法向量 w 和截距 b
print(f"超平面法向量 (w): {model.coef_}")
print(f"截距 (b): {model.intercept_}")

# 究竟是哪些点支撑起了这个分类界限？
print(f"支持向量 (Support Vectors): \\n{model.support_vectors_}")`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">CLASSIFICATION // SVM</div>
                
                <div className="w-full mt-6 text-center z-10 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6">SVM seeks avoiding merely dividing the data, but maximizing the structural margin (the safety gap) between classes.</p>
                    
                    <div className="relative w-full max-w-[400px] h-[300px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] mb-6">
                        <svg className="absolute inset-0 w-full h-full">
                            {/* Margin Area (Background) */}
                            {optimized && (
                                <motion.polygon 
                                    points={`${optLine.x1 - optLine.offset/2},${optLine.y1 + optLine.offset} 
                                             ${optLine.x2 - optLine.offset/2},${optLine.y2 + optLine.offset} 
                                             ${optLine.x2 + optLine.offset/2},${optLine.y2 - optLine.offset} 
                                             ${optLine.x1 + optLine.offset/2},${optLine.y1 - optLine.offset}`}
                                    fill="#EAE8DD" opacity="0.4"
                                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 1 }}
                                />
                            )}

                            {/* Hyperplane */}
                            <motion.line 
                                animate={{ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 }}
                                transition={{ type: "spring", stiffness: 60 }}
                                stroke="#5A5A40" strokeWidth="3"
                            />

                            {/* Margins */}
                            {optimized && (
                                <>
                                    <motion.line 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                        x1={line.x1 - line.offset/2} y1={line.y1 + line.offset} x2={line.x2 - line.offset/2} y2={line.y2 + line.offset}
                                        stroke="#8C8C64" strokeWidth="1" strokeDasharray="5 5"
                                    />
                                    <motion.line 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                        x1={line.x1 + line.offset/2} y1={line.y1 - line.offset} x2={line.x2 + line.offset/2} y2={line.y2 - line.offset}
                                        stroke="#8C8C64" strokeWidth="1" strokeDasharray="5 5"
                                    />
                                </>
                            )}

                            {/* Blue Points (Class 0) */}
                            <g fill="#A56B6B">
                                <circle cx="80" cy="150" r="6" />
                                <circle cx="120" cy="80" r="6" />
                                <circle cx="150" cy="220" r="6" />
                                <circle cx="180" cy="170" r="6" />
                            </g>
                            {/* Gold Points (Class 1) */}
                            <g fill="#8C8C64">
                                <circle cx="280" cy="100" r="6" />
                                <circle cx="320" cy="200" r="6" />
                                <circle cx="350" cy="150" r="6" />
                                <circle cx="260" cy="250" r="6" />
                            </g>

                            {/* Highlight Support Vectors */}
                            {optimized && (
                                <g fill="none" stroke="#5A5A40" strokeWidth="2" strokeDasharray="2 2">
                                    <motion.circle cx="180" cy="170" r="10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type:"spring", delay: 0.5 }} />
                                    <motion.circle cx="280" cy="100" r="10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type:"spring", delay: 0.6 }} />
                                    <motion.circle cx="260" cy="250" r="10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type:"spring", delay: 0.7 }} />
                                </g>
                            )}
                        </svg>

                        {optimized && (
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <div className="text-[10px] text-[#A8A594] font-mono bg-white/80 px-2 py-0.5 rounded shadow-sm border border-[#E2E1D5]">Margin Area: Maximized</div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-3 h-3 rounded-full border-2 border-[#5A5A40] border-dashed flex items-center justify-center"></div>
                                    <span className="text-[10px] uppercase text-[#8C8C64] font-bold">Support Vector</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setOptimized(!optimized)}
                        className="px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                    >
                        {optimized ? "Revert to Naive Split" : "Optimize Hyperplane (Max Margin)"}
                    </button>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
