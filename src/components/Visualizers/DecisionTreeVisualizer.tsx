import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const DecisionTreeVisualizer: React.FC = () => {
    // 1D split threshold
    const [splitX, setSplitX] = useState<number>(200);

    const data = [
        {x: 50, c: 0}, {x: 80, c: 0}, {x: 100, c: 0}, {x: 140, c: 1}, 
        {x: 180, c: 0}, {x: 250, c: 1}, {x: 280, c: 1}, {x: 330, c: 1}, {x: 360, c: 1}
    ];

    const left = data.filter(d => d.x <= splitX);
    const right = data.filter(d => d.x > splitX);

    const calcGini = (pts: any[]) => {
        if(pts.length === 0) return 0;
        const c0 = pts.filter(p => p.c === 0).length;
        const p0 = c0 / pts.length;
        const p1 = 1 - p0;
        return 1 - (p0*p0 + p1*p1);
    };

    const giniL = calcGini(left);
    const giniR = calcGini(right);
    const weightL = left.length / data.length;
    const weightR = right.length / data.length;
    const giniTotal = (giniL * weightL) + (giniR * weightR);

    const pyCode = `from sklearn.tree import DecisionTreeClassifier

# 树的深度越深，划分的条件越多，但也越容易过拟合
dt = DecisionTreeClassifier(max_depth=1, criterion='gini')
dt.fit(X, y)

# 打印模型找到的最佳切分点
print(f"最佳特征切分阈值: {dt.tree_.threshold[0]}")
print(f"根节点的不纯度 (Gini): {dt.tree_.impurity[0]}")`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">RULE-BASED // DECISION_TREE</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-8 max-w-sm text-center">Slide the threshold line. The tree seeks a split that minimizes the total weighted Gini Impurity (making sides as pure as possible).</p>

                    <div className="relative w-full max-w-[400px] h-[100px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl mb-4 p-4 shadow-inner">
                        {/* Data Points */}
                        {data.map((d, i) => (
                            <div key={i} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm" style={{ left: `${(d.x/400)*100}%`, background: d.c === 0 ? '#A56B6B' : '#8C8C64' }}></div>
                        ))}
                        
                        {/* Threshold Line */}
                        <div className="absolute top-0 bottom-0 w-[2px] bg-[#5A5A40]" style={{ left: `${(splitX/400)*100}%` }}>
                            <div className="absolute -top-3 -translate-x-1/2 text-[10px] font-mono bg-[#5A5A40] text-white px-1 rounded">x {'<='} {splitX}</div>
                        </div>
                    </div>

                    <input 
                        type="range" min="10" max="390" value={splitX} onChange={(e) => setSplitX(parseInt(e.target.value))}
                        className="w-full max-w-[400px] accent-[#5A5A40] mb-8"
                    />

                    <div className="flex w-full max-w-[400px] gap-4">
                        <div className="flex-1 bg-[#F1F0E8] rounded-xl p-4 border border-[#E2E1D5] flex flex-col items-center">
                            <div className="text-[10px] uppercase text-[#8C8C64] font-bold tracking-wider mb-2">Left Node</div>
                            <div className="flex gap-1 mb-2">
                                {left.length === 0 ? <span className="text-xs text-[#A8A594]">Empty</span> : left.map((d,i) => (
                                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: d.c === 0 ? '#A56B6B' : '#8C8C64' }}></div>
                                ))}
                            </div>
                            <div className="font-mono text-sm text-[#5A5A40]">Gini: {giniL.toFixed(3)}</div>
                        </div>

                        <div className="flex-1 bg-[#F1F0E8] rounded-xl p-4 border border-[#E2E1D5] flex flex-col items-center">
                            <div className="text-[10px] uppercase text-[#A56B6B] font-bold tracking-wider mb-2">Right Node</div>
                            <div className="flex gap-1 mb-2">
                                {right.length === 0 ? <span className="text-xs text-[#A8A594]">Empty</span> : right.map((d,i) => (
                                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: d.c === 0 ? '#A56B6B' : '#8C8C64' }}></div>
                                ))}
                            </div>
                            <div className="font-mono text-sm text-[#5A5A40]">Gini: {giniR.toFixed(3)}</div>
                        </div>
                    </div>

                    <div className="mt-6 font-mono font-bold text-lg text-[#5A5A40]">
                        Total Impurity:{' '}
                        <span className={giniTotal < 0.2 ? "text-[#8C8C64]" : "text-[#A56B6B]"}>
                            {giniTotal.toFixed(3)}
                        </span>
                    </div>

                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
