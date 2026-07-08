import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import ArticleSearchSelect from './ArticleSearchSelect';

export default function LessonEditor({ lessons, onChange }) {
  const lessonsArr = lessons || [];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lessonsArr);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered.map((l, i) => ({ ...l, order: i + 1 })));
  };

  const updateLesson = (index, field, val) => {
    onChange(lessonsArr.map((l, i) => i === index ? { ...l, [field]: val } : l));
  };

  const updateArticle = (index, articleId, articleTitle) => {
    onChange(lessonsArr.map((l, i) =>
      i === index ? { ...l, article_id: articleId, title: articleTitle || l.title } : l
    ));
  };

  const addLesson = () => {
    onChange([...lessonsArr, { order: lessonsArr.length + 1, article_id: '', title: '', duration: '' }]);
  };

  const removeLesson = (index) => {
    onChange(lessonsArr.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 })));
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lessons">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {lessonsArr.map((lesson, index) => (
                <Draggable key={`lesson-${index}`} draggableId={`lesson-${index}`} index={index}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.draggableProps}
                      className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <button {...p.dragHandleProps} className="mt-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 shrink-0">#{lesson.order || index + 1}</span>
                          <input type="text" value={lesson.title || ''} placeholder="Lesson title"
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <input type="text" value={lesson.duration || ''} placeholder="10 min"
                            onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <ArticleSearchSelect
                          value={lesson.article_id}
                          initialTitle={lesson.title}
                          onChange={(id, title) => updateArticle(index, id, title)}
                        />
                      </div>
                      <button onClick={() => removeLesson(index)} className="mt-2 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={addLesson}
        className="mt-3 flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
        <Plus className="w-4 h-4" /> Add Lesson
      </button>
    </div>
  );
}