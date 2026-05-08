import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const GNNVisualizer: React.FC = () => {
    const [passed, setPassed] = useState(false);

    // 4 Nodes: Center, N1, N2, N3
    // Colors represent internal feature states (e.g., Red=1, Green=2, Blue=3)
    const n1 = {x: 100, y: 80, c: '#A56B6B'};  // Top Left, Red
    const n2 = {x: 100, y: 220, c: '#8C8C64'}; // Bottom Left, Gold
    const n3 = {x: 300, y: 150, c: '#6d8c64'}; // Right, Greenish
    const center = {x: 200, y: 150};           // Center, initially empty/grey

    const pyCode = `import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

class GNN_Network(torch.nn.Module):
    def __init__(self, num_node_features, num_classes):
        super().__init__()
        # 这是一个图卷积层 (Graph Convolution)
        self.conv1 = GCNConv(num_node_features, 16)
        self.conv2 = GCNConv(16, num_classes)

    def forward(self, data):
        # x 是所有节点的特征矩阵，edge_index 是定义哪些节点相连的关系网
        x, edge_index = data.x, data.edge_index

        # 核心：每次经过 GCN 卷积层，节点都会向邻居发送自己的特征，并把收到的特征聚合（Message Passing）
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)

        return F.log_softmax(x, dim=1)`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">GRAPH // MESSAGE_PASSING</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center max-w-sm">"Tell me who your friends are, and I will tell you who you are." Nodes aggregate feature vectors from their connected neighbors.</p>
                    
                    <div className="relative w-full max-w-[400px] h-[300px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden shadow-inner mb-6">
                        <svg className="absolute inset-0 w-full h-full">
                            {/* Edges */}
                            <line x1={n1.x} y1={n1.y} x2={center.x} y2={center.y} stroke="#D4D1C5" strokeWidth="3" />
                            <line x1={n2.x} y1={n2.y} x2={center.x} y2={center.y} stroke="#D4D1C5" strokeWidth="3" />
                            <line x1={n3.x} y1={n3.y} x2={center.x} y2={center.y} stroke="#D4D1C5" strokeWidth="3" />

                            {/* Message Passing Animation (Tiny dots flowing) */}
                            <AnimatePresence>
                                {passed && (
                                    <>
                                        <motion.circle cx={n1.x} cy={n1.y} r="5" fill={n1.c} initial={{x:0, y:0}} animate={{x: center.x-n1.x, y: center.y-n1.y}} transition={{duration: 1, ease:"easeInOut"}} onAnimationComplete={() => {}} />
                                        <motion.circle cx={n2.x} cy={n2.y} r="5" fill={n2.c} initial={{x:0, y:0}} animate={{x: center.x-n2.x, y: center.y-n2.y}} transition={{duration: 1, ease:"easeInOut"}} />
                                        <motion.circle cx={n3.x} cy={n3.y} r="5" fill={n3.c} initial={{x:0, y:0}} animate={{x: center.x-n3.x, y: center.y-n3.y}} transition={{duration: 1, ease:"easeInOut"}} />
                                    </>
                                )}
                            </AnimatePresence>

                            {/* Nodes */}
                            <circle cx={n1.x} cy={n1.y} r="20" fill={n1.c} stroke="#fff" strokeWidth="4" className="shadow-lg" />
                            <circle cx={n2.x} cy={n2.y} r="20" fill={n2.c} stroke="#fff" strokeWidth="4" />
                            <circle cx={n3.x} cy={n3.y} r="20" fill={n3.c} stroke="#fff" strokeWidth="4" />

                            {/* Center Node (aggregates) */}
                            <circle cx={center.x} cy={center.y} r="24" fill={passed ? "#A8A594" : "#E2E1D5"} stroke="#fff" strokeWidth="4" />

                        </svg>

                        {/* Center Node Pie Chart representation of mixed features */}
                        {passed && (
                            <motion.div 
                                className="absolute pointer-events-none rounded-full overflow-hidden flex"
                                style={{ width: 36, height: 36, left: center.x - 18, top: center.y - 18 }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1 }}
                            >
                                <div className="flex-1 h-full" style={{background: n1.c}}></div>
                                <div className="flex-1 h-full" style={{background: n2.c}}></div>
                                <div className="flex-1 h-full" style={{background: n3.c}}></div>
                            </motion.div>
                        )}
                        
                    </div>

                    <button 
                        onClick={() => setPassed(!passed)}
                        className="px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                    >
                        {passed ? "Reset Graph" : "Aggregate Neighbors (GCN)"}
                    </button>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
