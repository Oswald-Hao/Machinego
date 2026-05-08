import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ReLuVisualizer } from './components/Visualizers/ReLuVisualizer';
import { FeedForwardVisualizer } from './components/Visualizers/FeedForwardVisualizer';
import { CNNVisualizer } from './components/Visualizers/CNNVisualizer';
import { RNNVisualizer } from './components/Visualizers/RNNVisualizer';
import { TransformerVisualizer } from './components/Visualizers/TransformerVisualizer';
import { GradientDescentVisualizer } from './components/Visualizers/GradientDescentVisualizer';
import { LinearRegressionVisualizer } from './components/Visualizers/LinearRegressionVisualizer';
import { KMeansVisualizer } from './components/Visualizers/KMeansVisualizer';
import { DropoutVisualizer } from './components/Visualizers/DropoutVisualizer';
import { ResNetVisualizer } from './components/Visualizers/ResNetVisualizer';
import { GANVisualizer } from './components/Visualizers/GANVisualizer';
import { QLearningVisualizer } from './components/Visualizers/QLearningVisualizer';
import { QuizComponent } from './components/QuizComponent';
import { lessons } from './data/lessons';
import { Cpu, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentId, setCurrentId] = useState(lessons[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLesson = lessons.find(l => l.id === currentId)!;
  const currentIdx = lessons.findIndex(l => l.id === currentId);

  const renderContent = (content: string) => {
    return content.split('\n').filter(l => l.trim().length > 0).map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-[#2D2D2A] mt-8 mb-4 font-serif">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
         return <blockquote key={i} className="border-l-4 border-[#8C8C64] pl-4 italic text-[#8C8C64] my-4 text-sm bg-[#FDFBF7] p-3 rounded-r-lg">{line.replace('> ', '')}</blockquote>;
      }
      if (line.startsWith('* ')) {
         return (
           <li key={i} className="mb-2 text-[#6B6B5E] leading-relaxed font-sans text-sm ml-4 list-disc marker:text-[#8C8C64]">
             {line.replace('* ', '').split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[#2D2D2A] font-bold">{part}</strong> : <span key={j}>{part}</span>)}
           </li>
         );
      }
      return (
      <p key={i} className="mb-4 text-[#6B6B5E] leading-relaxed font-sans text-sm">
        {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[#2D2D2A] font-bold">{part}</strong> : <span key={j}>{part}</span>)}
      </p>
    )});
  };

  const VisualizerMap = {
    relu: ReLuVisualizer,
    ffn: FeedForwardVisualizer,
    cnn: CNNVisualizer,
    rnn: RNNVisualizer,
    transformer: TransformerVisualizer,
    optimizer: GradientDescentVisualizer,
    linear_regression: LinearRegressionVisualizer,
    kmeans: KMeansVisualizer,
    dropout: DropoutVisualizer,
    resnet: ResNetVisualizer,
    gan: GANVisualizer,
    qlearning: QLearningVisualizer,
  };

  const SelectedVisualizer = VisualizerMap[currentLesson.visualizerType];

  return (
    <div className="flex h-screen bg-[#F8F7F2] text-[#3D3D35] font-sans overflow-hidden">
      <Sidebar 
        lessons={lessons} 
        currentId={currentId} 
        onSelect={(id) => {
          setCurrentId(id);
          setMobileMenuOpen(false);
        }} 
      />

      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-50 bg-[#FDFBF7] border-b border-[#E2E1D5] p-4 flex justify-between items-center">
         <div className="flex items-center gap-2 text-[#5A5A40] font-bold">
          <Cpu className="w-6 h-6" />
          <span className="text-xl font-semibold tracking-tight text-[#2D2D2A]">NeuralQuest</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#8C8C64]">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {mobileMenuOpen && (
         <div className="md:hidden absolute top-16 left-0 right-0 bottom-0 z-40 bg-[#FDFBF7] overflow-y-auto">
            <div className="flex flex-col gap-1 p-4">
              {lessons.map((lesson, idx) => {
                const isActive = lesson.id === currentId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => { setCurrentId(lesson.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${isActive ? 'bg-[#F1F0E8] text-[#5A5A40] border border-[#5A5A40]' : 'text-[#8C8C64]'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${isActive ? 'bg-[#5A5A40] text-white' : 'border border-[#A8A594] text-[#8C8C64]'}`}>{idx + 1}</div>
                    <span>{lesson.title}</span>
                  </button>
                )
              })}
            </div>
         </div>
      )}

      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div 
             key={currentId}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
             className="max-w-6xl mx-auto p-6 md:p-12 lg:grid lg:grid-cols-12 gap-12"
          >
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 flex flex-col mb-12 lg:mb-0">
               <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#2D2D2A] mb-8 tracking-tight">{currentLesson.title}</h1>
               <div className="prose prose-slate max-w-none mb-8 text-[#6B6B5E]">
                 {renderContent(currentLesson.content)}
               </div>
               
               <QuizComponent {...currentLesson.quiz} />

               {/* Pagination footer */}
               <div className="mt-12 pt-8 border-t border-[#E2E1D5] flex justify-between">
                 <button 
                   disabled={currentIdx === 0}
                   onClick={() => setCurrentId(lessons[currentIdx - 1]?.id)}
                   className="disabled:opacity-20 text-[#8C8C64] hover:text-[#2D2D2A] transition font-mono text-sm"
                 >
                   &larr; 上一关
                 </button>
                 <button 
                   disabled={currentIdx === lessons.length - 1}
                   onClick={() => setCurrentId(lessons[currentIdx + 1]?.id)}
                   className="disabled:opacity-20 bg-[#5A5A40] text-white hover:bg-[#484833] px-6 py-2 rounded-full transition font-mono text-sm shadow-sm"
                 >
                   下一关 &rarr;
                 </button>
               </div>
            </div>

            {/* Right Interactive/Visualizer Column */}
            <div className="lg:col-span-7">
               <SelectedVisualizer />
            </div>

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
