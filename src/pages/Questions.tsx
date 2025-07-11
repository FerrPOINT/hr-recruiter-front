import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { apiService } from '../services/apiService';
import { QuestionTypeEnum } from '../client/models/question-type-enum';
import toast from 'react-hot-toast';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Question } from '../client/models/question';

const Questions: React.FC = () => {
  const navigate = useNavigate();
  const { positionId } = useParams<{ positionId: string }>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState<{
    text: string;
    type: QuestionTypeEnum;
    order: number;
    isRequired: boolean;
  }>({
    text: '',
    type: QuestionTypeEnum.text,
    order: 1,
    isRequired: false,
  });

  useEffect(() => {
    if (!positionId) return;
    
    setLoading(true);
    (async () => {
      try {
        const [questionsData, positionData] = await Promise.all([
          apiService.getQuestions(parseInt(positionId)),
          apiService.getPosition(parseInt(positionId)),
        ]);
        setQuestions(questionsData.questions);
        setPosition(positionData);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Ошибка загрузки вопросов');
      } finally {
        setLoading(false);
      }
    })();
  }, [positionId]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionId) return;
    
    try {
      const newQuestion = await apiService.createQuestion(parseInt(positionId), {
        text: formData.text,
        type: formData.type as QuestionTypeEnum,
        order: questions.length + 1,
        isRequired: formData.isRequired,
      });
      setQuestions([...questions, newQuestion]);
      setShowCreateForm(false);
      setFormData({ text: '', type: QuestionTypeEnum.text, order: 1, isRequired: false });
      toast.success('Вопрос создан');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Ошибка создания вопроса');
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedQuestion = await apiService.updateQuestion(editingQuestion.id, {
        text: formData.text,
        type: formData.type as QuestionTypeEnum,
        order: formData.order,
        isRequired: formData.isRequired,
      });
      setQuestions(questions.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
      setEditingQuestion(null);
      setFormData({ text: '', type: QuestionTypeEnum.text, order: 1, isRequired: false });
      toast.success('Вопрос обновлен');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Ошибка обновления вопроса');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await apiService.deleteQuestion(parseInt(questionId));
        setQuestions(questions.filter(q => q.id !== questionId));
        toast.success('Вопрос удален');
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Ошибка удаления вопроса');
      }
    }
  };

  const openEditForm = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      type: question.type as QuestionTypeEnum,
      order: question.order,
      isRequired: question.isRequired || false,
    });
  };

  const moveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    const temp = newQuestions[currentIndex];
    newQuestions[currentIndex] = newQuestions[newIndex];
    newQuestions[newIndex] = temp;
    
    // Обновляем порядок
    newQuestions.forEach((q, index) => {
      q.order = index + 1;
    });
    
    setQuestions(newQuestions);
    
    // Обновляем в API
    try {
      await apiService.updateQuestion(parseInt(questionId), { order: newQuestions[currentIndex].order });
      await apiService.updateQuestion(newQuestions[newIndex].id, { order: newQuestions[newIndex].order });
    } catch (error) {
      console.error('Error updating question order:', error);
      toast.error('Ошибка обновления порядка вопросов');
    }
  };

  // Оптимизированная функция для batch обновления порядка вопросов
  const updateQuestionOrders = async (newQuestions: Question[]) => {
    try {
      const updates = newQuestions.map(q => 
        apiService.updateQuestion(q.id, { order: q.order })
      );
      await Promise.all(updates);
      console.log('Successfully updated question orders');
    } catch (error) {
      console.error('Error updating question orders:', error);
      toast.error('Ошибка обновления порядка вопросов');
    }
  };

  // Drag and drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((item) => item.id === active.id);
      const newIndex = questions.findIndex((item) => item.id === over?.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      
      // Обновляем порядок в состоянии
      setQuestions(newQuestions);
      
      // Batch обновление в базе данных
      updateQuestionOrders(newQuestions);
    }
  };

  if (!positionId) {
    return <div>Position ID is required</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
              <button onClick={() => navigate('/admin/vacancies')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад к вакансиям
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Вопросы для интервью</h1>
            {position && (
              <p className="text-gray-600 mt-1">Вакансия: {position.title}</p>
            )}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить вопрос
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Вопросы не добавлены. Создайте первый вопрос для этой вакансии.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.sort((a, b) => a.order - b.order).map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <MoveUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <MoveDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{question.order}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.type === QuestionTypeEnum.text ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === QuestionTypeEnum.text ? 'Текстовый' : 'Аудио'}
                        </span>
                        {question.isRequired && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Обязательный
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900">{question.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(question)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно создания/редактирования */}
        {(showCreateForm || editingQuestion) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-medium mb-4">
                {editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
              </h2>
              <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Текст вопроса</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="input-field"
                    rows={3}
                    required
                    placeholder="Введите текст вопроса..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип ответа</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionTypeEnum })}
                    className="input-field"
                  >
                    <option value={QuestionTypeEnum.text}>Текстовый</option>
                    <option value={QuestionTypeEnum.audio}>Аудио</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700">
                    Обязательный вопрос
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingQuestion ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingQuestion(null);
                      setFormData({ text: '', type: QuestionTypeEnum.text, order: 1, isRequired: false });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions; 