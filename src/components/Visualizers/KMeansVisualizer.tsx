import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeExport } from '../CodeExport';

type Point = { x: number; y: number; cluster?: number };
type Centroid = { x: number; y: number };

export const KMeansVisualizer: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([
        { x: 50, y: 50 }, { x: 70, y: 60 }, { x: 40, y: 80 },
        { x: 300, y: 250 }, { x: 320, y: 220 }, { x: 280, y: 260 },
        { x: 200, y: 50 }, { x: 230, y: 80 }, { x: 180, y: 70 }
    ]);
    const [centroids, setCentroids] = useState<Centroid[]>([]);
    const [stepPhase, setStepPhase] = useState<'init' | 'assign' | 'update'>('init');
    const colors = ['#8C8C64', '#D9A066', '#5A5A40'];

    const handleStep = () => {
        if (centroids.length === 0) {
            // Init with 3 somewhat dispersed points to guarantee convergence speed
            setCentroids([
                { x: 100, y: 100 },
                { x: 250, y: 150 },
                { x: 150, y: 200 }
            ]);
            setStepPhase('assign');
            return;
        }

        if (stepPhase === 'assign') {
            // Assign points to nearest centroid
            const newPoints = points.map(p => {
                let minDst = Infinity;
                let cIdx = 0;
                centroids.forEach((c, idx) => {
                    const d = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
                    if (d < minDst) { minDst = d; cIdx = idx; }
                });
                return { ...p, cluster: cIdx };
            });
            setPoints(newPoints);
            setStepPhase('update');
        } else {
            // Update centroids
            const newC = centroids.map((c, idx) => {
                const clusterPts = points.filter(p => p.cluster === idx);
                if (clusterPts.length === 0) return c;
                const sumX = clusterPts.reduce((acc, p) => acc + p.x, 0);
                const sumY = clusterPts.reduce((acc, p) => acc + p.y, 0);
                return { x: sumX / clusterPts.length, y: sumY / clusterPts.length };
            });
            setCentroids(newC);
            setStepPhase('assign');
        }
    };

    const handleAddPoint = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints([...points, { x, y }]);
    };

    const pyCode = `from sklearn.cluster import KMeans
import numpy as np

# 数据只有特征 X，没有标准答案 (无监督学习 Unsupervised Learning)
X = np.array([[p['x'], p['y']] for p in points])

# 定义 KMeans 模型，设定我们想要寻找 3 个聚类簇 (Clusters)
kmeans = KMeans(n_clusters=3, random_state=0, n_init="auto")

# 拟合数据，算法会自动迭代：计算距离 -> 重新分配 -> 移动中心点
kmeans.fit(X)

print(f"最终的三个聚类中心: {kmeans.cluster_centers_}")
print(f"每个样本被分配的聚类编号: {kmeans.labels_}")`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">UNSUPERVISED // K_MEANS</div>
                
                <div className="w-full mt-6">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-4 text-center">Click to add unclassified points. Then click 'Next Step' to iteratively find 3 clusters.</p>
                    
                    <div className="flex justify-center w-full relative">
                        <div className="relative border-2 border-[#E2E1D5] rounded-xl w-[400px] h-[300px] bg-[#FDFBF7] overflow-hidden">
                            <svg width="400" height="300" className="absolute inset-0 cursor-crosshair" onClick={handleAddPoint}>
                                {points.map((p, i) => (
                                    <motion.circle
                                        key={`p-${i}`}
                                        cx={p.x} cy={p.y} r={4}
                                        fill={p.cluster !== undefined ? colors[p.cluster] : '#A8A594'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, fill: p.cluster !== undefined ? colors[p.cluster] : '#A8A594' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ))}
                                
                                {centroids.map((c, i) => (
                                    <motion.g
                                        key={`c-${i}`}
                                        initial={{ x: c.x, y: c.y, scale: 0 }}
                                        animate={{ x: c.x, y: c.y, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 100 }}
                                    >
                                        {/* Cross symbol for centroid */}
                                        <path d="M -8 -8 L 8 8 M -8 8 L 8 -8" stroke={colors[i]} strokeWidth="3" strokeLinecap="round" />
                                    </motion.g>
                                ))}
                            </svg>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 gap-4">
                        <button 
                            onClick={handleStep} 
                            className="px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                        >
                            {stepPhase === 'init' ? 'Init Centroids (K=3)' : stepPhase === 'assign' ? '1. Assign Points' : '2. Update Centroids'}
                        </button>
                        <button 
                            onClick={() => { setCentroids([]); setPoints(points.map(p => ({x: p.x, y: p.y}))); setStepPhase('init'); }} 
                            className="px-6 py-2 bg-[#F1F0E8] border border-[#E2E1D5] rounded-full text-[10px] text-[#8C8C64] hover:bg-[#EAE8DD] transition uppercase tracking-wider font-bold"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
