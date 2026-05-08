import React from 'react';
import { Lesson } from '../types';
import { BookOpen, Map, Compass, Cpu } from 'lucide-react';

interface Props {
  lessons: Lesson[];
  currentId: string;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<Props> = ({ lessons, currentId, onSelect }) => {
  return (
    <div className="w-full md:w-64 bg-[#FDFBF7] border-r border-[#E2E1D5] flex flex-col flex-shrink-0 h-auto md:h-screen overflow-y-auto hidden md:flex">
      <div className="p-6 border-b border-[#E2E1D5]">
        <div className="flex items-center gap-3 text-[#5A5A40] font-bold tracking-tight text-xl font-sans">
          <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-[#F8F7F2] font-bold text-lg">N</div>
          <span className="text-xl font-semibold tracking-tight text-[#2D2D2A]">NeuralQuest</span>
        </div>
        <div className="text-[#8C8C64] text-xs mt-3 uppercase tracking-widest font-bold">Learning Path</div>
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {lessons.map((lesson, idx) => {
          const isActive = lesson.id === currentId;
          return (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${isActive ? 'bg-[#F1F0E8] text-[#5A5A40] border border-[#5A5A40]/20' : 'text-[#8C8C64] hover:bg-[#EAE8DD] hover:text-[#5A5A40]'}`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isActive ? 'bg-[#5A5A40] text-white' : 'border border-[#A8A594] text-[#8C8C64]'}`}>
                {idx + 1}
              </div>
              <span className="font-sans text-sm font-medium">{lesson.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};
