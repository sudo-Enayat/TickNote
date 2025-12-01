import { AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { TaskItem } from './TaskItem';
import { useTasks } from '../../context/TaskContext';

export function TaskList() {
    const { tasks, lists, activeListId, reorderTasks, searchQuery, sortBy, showCompleted } = useTasks();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesList = activeListId === 'all' ? true : task.listId === activeListId;
        const matchesCompletion = showCompleted ? true : !task.completed;

        return matchesSearch && matchesList && matchesCompletion;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'manual') return 0;

        if (sortBy === 'priority') {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }

        if (sortBy === 'time-asc') {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // No due date = last
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
        }

        if (sortBy === 'time-desc') {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity; // No due date = last
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
            return dateB - dateA;
        }

        return 0;
    });

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || sortBy !== 'manual') return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const newSortedTasks = Array.from(sortedTasks);
        const [removed] = newSortedTasks.splice(sourceIndex, 1);
        newSortedTasks.splice(destinationIndex, 0, removed);

        const newOrderedIds = newSortedTasks.map(t => t.id);
        reorderTasks(newOrderedIds);
    };

    if (sortedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <p className="text-lg">No tasks found</p>
                <p className="text-sm">Create a new task to get started</p>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks" isDropDisabled={sortBy !== 'manual'}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 pb-20"
                    >
                        <AnimatePresence mode='popLayout'>
                            {sortedTasks.map((task, index) => (
                                <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={index}
                                    isDragDisabled={sortBy !== 'manual'}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="outline-none ring-0 focus:outline-none focus:ring-0"
                                            style={{
                                                ...provided.draggableProps.style,
                                                left: 'auto', // Fix for x-axis jump
                                                top: 'auto'   // Optional, depends on behavior
                                            }}
                                        >
                                            <TaskItem
                                                task={task}
                                                listColor={activeListId === 'all' ? tasks.find(t => t.id === task.id)?.listId && lists.find(l => l.id === task.listId)?.color : undefined}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </AnimatePresence>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
