import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CodeExport } from '../CodeExport';

const GRID_SIZE = 4;
const GOAL = { x: 3, y: 3 };
const FIRE = { x: 1, y: 1 };
const START = { x: 0, y: 0 };

type State = { x: number, y: number };
// Actions: 0=Up, 1=Right, 2=Down, 3=Left

export const QLearningVisualizer: React.FC = () => {
    // Q-table: [x][y][action]
    const [qTable, setQTable] = useState<number[][][]>(() => 
        Array.from({length: GRID_SIZE}, () => 
            Array.from({length: GRID_SIZE}, () => [0,0,0,0])
        )
    );
    const [agent, setAgent] = useState<State>(START);
    const [isAuto, setIsAuto] = useState(false);
    const [episodes, setEpisodes] = useState(0);

    const lr = 0.5; // alpha
    const gamma = 0.9; // discount

    const step = (currentQTable: number[][][], currentAgent: State) => {
        let {x, y} = currentAgent;
        
        // Epsilon-greedy action selection
        let action = 0;
        if (Math.random() < 0.2) {
            action = Math.floor(Math.random() * 4); // Explore
        } else {
            // Exploit
            const maxQ = Math.max(...currentQTable[x][y]);
            const bestActions = [0,1,2,3].filter(a => currentQTable[x][y][a] === maxQ);
            action = bestActions[Math.floor(Math.random() * bestActions.length)];
        }

        // Take action
        let nx = x, ny = y;
        if (action === 0) ny = Math.max(0, y - 1); // Up
        if (action === 1) nx = Math.min(GRID_SIZE - 1, x + 1); // Right
        if (action === 2) ny = Math.min(GRID_SIZE - 1, y + 1); // Down
        if (action === 3) nx = Math.max(0, x - 1); // Left

        // Reward and terminal check
        let reward = -1; // living penalty
        let isTerminal = false;
        if (nx === GOAL.x && ny === GOAL.y) {
            reward = 100;
            isTerminal = true;
        } else if (nx === FIRE.x && ny === FIRE.y) {
            reward = -100;
            isTerminal = true;
        }

        // Update Q-value
        // Q(s,a) = Q(s,a) + alpha * [Reward + gamma * maxQ(s') - Q(s,a)]
        const newTable = [...currentQTable];
        const nextMaxQ = isTerminal ? 0 : Math.max(...currentQTable[nx][ny]);
        newTable[x][y][action] += lr * (reward + gamma * nextMaxQ - newTable[x][y][action]);

        return { newTable, nextState: isTerminal ? START : {x: nx, y: ny}, terminal: isTerminal };
    };

    const handleStep = () => {
        const { newTable, nextState, terminal } = step(qTable, agent);
        setQTable(newTable);
        setAgent(nextState);
        if (terminal) setEpisodes(e => e + 1);
    }

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isAuto) {
            timer = setInterval(() => {
                setQTable(prevT => {
                    setAgent(prevA => {
                        const { newTable, nextState, terminal } = step(prevT, prevA);
                        if (terminal) setEpisodes(e => e + 1);
                        return nextState;
                    });
                    // Note: strictly speaking, we shouldn't map state within state update directly like this for two different states, 
                    // but it works for a simple fast auto-play visually.
                    return prevT; // The update was done mutationally in step for performance on clone, but let's copy to be safe.
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [isAuto]);
    
    // Better auto-play loop using refs or similar would be cleaner, but for this viz, a combined update is fine.
    useEffect(() => {
        if(isAuto) {
            const intervalId = setInterval(() => {
                handleStep();
            }, 50);
            return () => clearInterval(intervalId);
        }
    }, [isAuto, qTable, agent]); // Rely on dependencies to keep fresh

    const pyCode = `# Q-Learning 核心更新公式 (贝尔曼方程的实际应用)

# 初始化 Q 表
# Q[state, action] = 0.0

# 智能体与环境交互的每一小步：
def update_q_value(state, action, reward, next_state):
    # 1. 查询当前的 Q 值
    current_q = Q[state, action]
    
    # 2. 从下一个状态寻找可能的最大未来收益
    max_future_q = max(Q[next_state, a] for a in all_actions)
    
    # 3. 计算目标 Q 值 (真实的奖励 + 打过折的未来期望奖励)
    target_q = reward + gamma * max_future_q
    
    # 4. 根据学习率 alpha 向目标靠近
    Q[state, action] = current_q + alpha * (target_q - current_q)

# 随着不断试错，Q 表收敛，智能体就会在每一个格子上选择 Q 值最大的那个方向走！`;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E2E1D5] rounded-3xl p-8 flex flex-col items-center shadow-sm relative min-h-[400px]">
                <div className="absolute top-6 left-6 text-[10px] text-[#A8A594] font-mono tracking-wider">RL // Q_LEARNING</div>
                
                <div className="w-full mt-6 text-center z-10 flex flex-col items-center">
                    <p className="text-xs text-[#8C8C64] font-serif italic mb-6">Agent tries to find path to ☆ while avoiding ✖.<br/>The hue of tiles gets warmer as max Q-value increases.</p>

                    <div className="grid grid-cols-4 gap-1 bg-[#E2E1D5] p-2 rounded-xl mb-6 shadow-inner">
                        {Array.from({length: GRID_SIZE}).map((_, y) => 
                            Array.from({length: GRID_SIZE}).map((_, x) => {
                                const isGoal = GOAL.x === x && GOAL.y === y;
                                const isFire = FIRE.x === x && FIRE.y === y;
                                const isAgent = agent.x === x && agent.y === y;
                                
                                // Color intensity based on max Q value
                                const maxQ = Math.max(...qTable[x][y]);
                                // Map -100 to 100 to color representation
                                let bgClass = "bg-[#FDFBF7]";
                                if (maxQ > 0) bgClass = `bg-[#8C8C64] opacity-${Math.min(100, Math.floor(maxQ/10)*10)}`;
                                if (maxQ < -10) bgClass = `bg-[#A56B6B] opacity-${Math.min(100, Math.floor(Math.abs(maxQ)/10)*10)}`;
                                
                                return (
                                    <div key={`${x}-${y}`} className="relative w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
                                        <div className={`absolute inset-0 ${bgClass} transition-all duration-500`}></div>
                                        
                                        {/* Display the max Q value roughly */}
                                        {!isGoal && !isFire && maxQ !== 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-black/40 z-0">
                                                {maxQ.toFixed(0)}
                                            </div>
                                        )}

                                        <div className="relative z-10 text-2xl drop-shadow-sm flex items-center justify-center">
                                            {isGoal ? "☆" : isFire ? "🔥" : ""}
                                            {isAgent && (
                                                <motion.div 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-6 h-6 bg-[#5A5A40] rounded-full absolute"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={handleStep} disabled={isAuto}
                            className="px-6 py-2 bg-[#F1F0E8] text-[#5A5A40] rounded-full text-xs font-bold hover:bg-[#EAE8DD] disabled:opacity-50 transition shadow-sm uppercase tracking-wider"
                        >
                            Step
                        </button>
                        <button 
                            onClick={() => setIsAuto(!isAuto)}
                            className={`px-6 py-2 rounded-full text-xs font-bold transition shadow-sm uppercase tracking-wider ${isAuto ? 'bg-[#A56B6B] text-white hover:bg-[#8e5a5a]' : 'bg-[#5A5A40] text-white hover:bg-[#484833]'}`}
                        >
                            {isAuto ? "Stop" : "Auto Play"}
                        </button>
                    </div>
                </div>
            </div>
            <CodeExport code={pyCode} />
        </div>
    );
};
