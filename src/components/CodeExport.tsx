import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  code: string;
}

export const CodeExport: React.FC<Props> = ({ code }) => {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E2E1D5] bg-[#2D2D2A] mt-4 shadow-sm">
      <div className="flex px-4 py-3 bg-[#3D3D35] border-b border-[#2D2D2A] text-[11px] text-[#D4D1C5] font-mono items-center justify-between uppercase tracking-wider font-bold">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          PyTorch 生成代码
        </span>
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-[#D4D1C5]/30 bg-[#A56B6B]"></div>
          <div className="w-2.5 h-2.5 rounded-full border border-[#D4D1C5]/30 bg-[#D9A066]"></div>
          <div className="w-2.5 h-2.5 rounded-full border border-[#D4D1C5]/30 bg-[#8C8C64]"></div>
        </div>
      </div>
      <SyntaxHighlighter
        language="python"
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
