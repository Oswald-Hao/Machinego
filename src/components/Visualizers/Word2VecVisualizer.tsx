import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const Word2VecVisualizer: React.FC = () => {
    const [step, setStep] = useState(0);

    // Coordinate space mapping
    const pts = {
        man: {x: 100, y: 220},
        woman: {x: 100, y: 100},
        king: {x: 300, y: 220},
        queen: {x: 300, y: 100}
    };

    const pyCode = `from gensim.models import Word2Vec

# 假设我们在海量维基百科文本上训练了一个词向量模型
# 我们现在要测试它的内在数学逻辑
# most_similar 方法中的 positive 和 negative 就是数学加减！
# 寻找: X = King - Man + Woman

result = model.wv.most_similar(positive=['king', 'woman'], negative=['man'], topn=1)

print("King - Man + Woman = ?")
print(f"Prediction: {result[0][0]} (Similarity: {result[0][1]:.3f})")

# Result: Queen (0.852)`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">EMBEDDINGS // WORD2VEC</div>
                
                <div className="w-full mt-6 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6 text-center max-w-sm">Words are mapped to dense high-dimensional vectors. Semantic relationships become literal spatial geometry.</p>
                    
                    <div className="relative w-full max-w-[400px] h-[300px] bg-[#FDFBF7] border border-[#E2E1D5] rounded-xl overflow-hidden shadow-inner mb-6">
                        <svg className="absolute inset-0 w-full h-full">
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#8C8C64" />
                                </marker>
                                <marker id="arrow-man" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#A56B6B" />
                                </marker>
                            </defs>

                            {/* Gender Vectors */}
                            {step >= 1 && (
                                <motion.line 
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                                    x1={pts.man.x} y1={pts.man.y} x2={pts.woman.x} y2={pts.woman.y + 20} 
                                    stroke="#8C8C64" strokeWidth="2" markerEnd="url(#arrow)"
                                />
                            )}
                            {step >= 2 && (
                                <motion.line 
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                                    x1={pts.king.x} y1={pts.king.y} x2={pts.queen.x} y2={pts.queen.y + 20} 
                                    stroke="#8C8C64" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="4 4"
                                />
                            )}

                            {/* Royalty Vectors */}
                            {step >= 3 && (
                                <motion.line 
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                                    x1={pts.man.x} y1={pts.man.y} x2={pts.king.x - 20} y2={pts.king.y} 
                                    stroke="#A56B6B" strokeWidth="2" markerEnd="url(#arrow-man)"
                                />
                            )}
                            {step >= 3 && (
                                <motion.line 
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                                    x1={pts.woman.x} y1={pts.woman.y} x2={pts.queen.x - 20} y2={pts.queen.y} 
                                    stroke="#A56B6B" strokeWidth="2" markerEnd="url(#arrow-man)" strokeDasharray="4 4"
                                />
                            )}

                            {/* The Words */}
                            <g className="font-mono text-sm font-bold" fill="#5A5A40">
                                <circle cx={pts.man.x} cy={pts.man.y} r="4" />
                                <text x={pts.man.x - 15} y={pts.man.y + 20}>Man</text>

                                <circle cx={pts.king.x} cy={pts.king.y} r="4" />
                                <text x={pts.king.x - 20} y={pts.king.y + 20}>King</text>

                                <circle cx={pts.woman.x} cy={pts.woman.y} r="4" />
                                <text x={pts.woman.x - 20} y={pts.woman.y - 15}>Woman</text>

                                <circle cx={pts.queen.x} cy={pts.queen.y} r="4" />
                                {step >= 2 && (
                                    <motion.text initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} transition={{delay:0.8}} x={pts.queen.x - 20} y={pts.queen.y - 15} fill="#8C8C64">Queen</motion.text>
                                )}
                            </g>
                        </svg>

                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-white/80 rounded border border-[#E2E1D5] text-[10px] font-mono text-[#5A5A40]">
                            {step === 0 && "Wait to extract features..."}
                            {step === 1 && "Extracted Vector: ↑ Gender (Male to Female)"}
                            {step === 2 && "Applying Gender Vector to 'King'..."}
                            {step >= 3 && "Extracted Vector: → Royalty (Common to Royal)"}
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep(s => (s + 1) % 4)}
                        className="px-6 py-2 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold hover:bg-[#484833] transition shadow-sm uppercase tracking-wider"
                    >
                        {step === 3 ? "Reset Space" : "Compute Next Vector"}
                    </button>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
