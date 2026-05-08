import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

export const TransformerVisualizer: React.FC = () => {
  const [activeWord, setActiveWord] = useState<number>(1); // default to "bank"
  
  const words = ['The', 'bank', 'of', 'the', 'river'];
  
  // Dummy attention scores matrix (rows = querying word, cols = keys attended to)
  // E.g., 'bank' query attending to 'river' has high score to contextualize it as river bank
  const attentionScores = [
    [1.0, 0.1, 0.0, 0.2, 0.0], // The
    [0.1, 1.0, 0.6, 0.1, 0.9], // bank (attends somewhat to "of", strongly to "river")
    [0.0, 0.2, 1.0, 0.2, 0.4], // of
    [0.4, 0.1, 0.1, 1.0, 0.6], // the
    [0.0, 0.5, 0.8, 0.2, 1.0], // river
  ];

  const pyCode = `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleSelfAttention(nn.Module):
    def __init__(self, embed_dim):
        super().__init__()
        # 线性映射生成 Query, Key, Value 向量池
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x):
        # x.shape = [batch_size, seq_len, embed_dim]
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)

        # 1. Q 与 所有的 K 进行点乘计算关联度 (dot product)
        # K.transpose 将进行矩阵转置以便相乘
        d_k = Q.size(-1)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)

        # 2. 将得分转化为 0-1 之间的权重 (对应可视化中线的粗细)
        attn_weights = F.softmax(scores, dim=-1)

        # 3. 将权重与 V 向量相乘，提取对方的信息融入自身
        # 这就是为什么 'bank' 会吸收 'river' 的语义特征
        output = torch.matmul(attn_weights, V)
        return output, attn_weights`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative min-h-[450px]">
        <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">MECHANISM // SELF_ATTENTION</div>
        
        <div className="mt-12 w-full max-w-xl text-center">
           <p className="text-sm text-[#8C8C64] font-serif italic mb-10">Hold cursor over a word to see its "Attention" (Query) across the sentence (Keys).</p>
           
           <div className="relative">
             {/* Render connection curves */}
             <svg className="absolute inset-0 -top-8 w-full h-[200px]" style={{ zIndex: 0, pointerEvents: 'none' }}>
                {words.map((_, i) => {
                  if (i === activeWord) return null; // Don't draw self-loop for clearer visual
                  const score = attentionScores[activeWord][i];
                  if (score < 0.1) return null;
                  
                  // Calculate positions based on index (rough estimation for layout)
                  const startX = 10 + (activeWord * 20)+'%';
                  const endX = 10 + (i * 20)+'%';
                  
                  return (
                    <motion.path 
                      key={i}
                      d={`M ${activeWord * 100 + 40} 40 C ${activeWord * 100 + 40} -60, ${i * 100 + 40} -60, ${i * 100 + 40} 40`}
                      fill="none" 
                      stroke="#8C8C64" 
                      strokeWidth={score * 8}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: score }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    />
                  )
                })}
             </svg>
             
             {/* Word Nodes */}
             <div className="flex justify-between relative z-10 w-full px-4">
                {words.map((word, i) => (
                  <motion.div 
                    key={i} 
                    onMouseEnter={() => setActiveWord(i)}
                    className={`flex flex-col items-center gap-3 cursor-pointer`}
                    animate={{ y: activeWord === i ? -5 : 0 }}
                  >
                    <div className={`px-4 py-2 rounded-xl text-lg font-serif transition-colors ${activeWord === i ? 'bg-[#5A5A40] text-white shadow-md' : 'bg-[#F1F0E8] text-[#5A5A40] hover:bg-[#EAE8DD]'}`}>
                      {word}
                    </div>
                    
                    {/* Display score */}
                    <motion.div 
                      key={`score-${activeWord}-${i}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: activeWord === i ? 0 : 1, scale: activeWord === i ? 0 : 1 }}
                      className="text-[10px] font-mono font-bold bg-[#FDFBF7] px-2 py-1 rounded border border-[#E2E1D5] text-[#8C8C64]"
                    >
                      {(attentionScores[activeWord][i] * 100).toFixed(0)}%
                    </motion.div>
                  </motion.div>
                ))}
             </div>
           </div>
           
           <div className="mt-16 bg-[#FDFBF7] border border-[#E2E1D5] p-5 rounded-2xl flex flex-col items-start text-sm">
             <div className="text-[10px] uppercase text-[#8C8C64] font-bold tracking-wider mb-2">Attention Map Insights</div>
             <p className="text-left text-[#6B6B5E] leading-relaxed">
                When querying <strong className="text-[#5A5A40] font-serif bg-[#F1F0E8] px-1 rounded">"{words[activeWord]}"</strong>, the model heavily attends to 
                <strong className="text-[#5A5A40] font-serif bg-[#F1F0E8] px-1 rounded mx-1">
                   "{words[attentionScores[activeWord].reduce((iMax, x, i, arr) => x > arr[iMax] && i !== activeWord ? i : iMax, activeWord === 0 ? 1 : 0)]}"
                </strong>
                to resolve its contextual meaning. By integrating the <span className="font-mono text-xs">Value</span> of this related word, the ambiguity of a "river bank" vs "financial bank" is shattered.
             </p>
           </div>
        </div>
      </div>
      <CodeExport code={pyCode} />
    </div>
  );
};
