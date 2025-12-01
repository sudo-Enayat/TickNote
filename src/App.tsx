import { MainLayout } from './components/Layout/MainLayout';
import { TaskList } from './components/Task/TaskList';
import { AddTask } from './components/Task/AddTask';
import { Bucket } from './components/UI/Bucket';
import { FocusTimer } from './components/Task/FocusTimer';
import { useTasks } from './context/TaskContext';
import { FocusProvider } from './context/FocusContext';
import { ArrowUpDown, Calendar, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from './utils/cn';

import { useNotification } from './hooks/useNotification';

import { useState } from 'react';
import { SplashScreen } from './components/UI/SplashScreen';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { lists, activeListId, sortBy, setSortBy } = useTasks();
  const [isLoading, setIsLoading] = useState(true);
  useNotification();
  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  return (
    <FocusProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" onComplete={() => setIsLoading(false)} />
        ) : (
          <MainLayout key="main">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{activeList.name}</h2>
                <p className="text-white/60">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setSortBy('manual')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    sortBy === 'manual' ? "bg-white/20 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title="Manual Order"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSortBy(sortBy === 'time-asc' ? 'time-desc' : 'time-asc')}
                  className={cn(
                    "p-2 rounded-md transition-all flex items-center gap-1",
                    sortBy.startsWith('time') ? "bg-white/20 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title="Sort by Time"
                >
                  <Calendar className="w-4 h-4" />
                  {sortBy === 'time-asc' && <ArrowUp className="w-3 h-3" />}
                  {sortBy === 'time-desc' && <ArrowDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    sortBy === 'priority' ? "bg-white/20 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title="Sort by Priority"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24">
              <div className="max-w-3xl mx-auto">
                <AddTask />
                <div className="mt-6">
                  <TaskList />
                </div>
              </div>
            </div>

            <Bucket />
          </MainLayout>
        )}
      </AnimatePresence>

      <FocusTimer />
    </FocusProvider>
  );
}

export default App;
