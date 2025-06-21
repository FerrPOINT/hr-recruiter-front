import {
  Branding,
  Candidate,
  Interview,
  Position,
  PositionStats,
  Question,
  User,
  CandidateStatusEnum,
  InterviewResultEnum,
  InterviewStatusEnum,
  QuestionTypeEnum,
  UserRoleEnum,
} from '../client';
import type { RoleEnum } from '../client/models/user';
import vacanciesData from './vacancies.json';
import { CheckCircle, XCircle, Clock, Briefcase, Users, TrendingUp } from 'lucide-react';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- DATA GENERATION & STATIC SETUP ---

// 1. Base Data & Generators
const mockTeam: User[] = [
  {
    id: '1',
    name: 'Алексей Жуков',
    role: 'admin' as RoleEnum,
    email: 'alex@azhukov.ru',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    language: 'Русский',
  },
  {
    id: '2',
    name: 'Анна Иванова',
    role: 'recruiter' as RoleEnum,
    email: 'anna@company.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    language: 'Русский',
  },
  {
    id: '3',
    name: 'Петр Петров',
    role: 'viewer' as RoleEnum,
    email: 'petr@company.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    language: 'Русский',
  },
];

const mockBranding: Branding = {
  id: 'branding-1',
  companyName: 'WMT Рекрутер',
  logoUrl: '',
  primaryColor: '#FF6600',
  secondaryColor: '#0055FF',
  emailSignature: 'С уважением, команда WMT Рекрутер',
};

const firstNames = ['Иван', 'Петр', 'Сергей', 'Анна', 'Мария', 'Елена', 'Дмитрий', 'Андрей', 'Ольга', 'Татьяна'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецова', 'Попова', 'Смирнова', 'Васильев', 'Соколов', 'Михайлова', 'Новиков'];

const defaultQuestions: Record<string, Question[]> = {
  p1: [
    { id: 'q1', positionId: 'p1', text: 'Как вы используете горутины для конкурентности в Go?', type: 'text' as QuestionTypeEnum, order: 1 },
    { id: 'q2', positionId: 'p1', text: 'Что такое каналы в Go и для чего они нужны?', type: 'text' as QuestionTypeEnum, order: 2 },
    { id: 'q3', positionId: 'p1', text: 'Опишите ваш опыт работы с PostgreSQL.', type: 'text' as QuestionTypeEnum, order: 3 },
  ],
  p2: [{ id: 'q4', positionId: 'p2', text: 'Что такое Virtual DOM в React?', type: 'text' as QuestionTypeEnum, order: 1 }],
  p3: [{ id: 'q7', positionId: 'p3', text: 'Что такое overfitting и как с ним бороться?', type: 'text' as QuestionTypeEnum, order: 1 }],
  p4: [{ id: 'q10', positionId: 'p4', text: 'Опишите ваш опыт в автоматизации тестирования API.', type: 'text' as QuestionTypeEnum, order: 1 }],
  p5: [{ id: 'q13', positionId: 'p5', text: 'Как вы приоритизируете гипотезы для проверки?', type: 'text' as QuestionTypeEnum, order: 1 }],
};

const generateUniqueCandidates = (count: number, positionId: string): Candidate[] => {
  const candidates: Candidate[] = [];
  const usedNames = new Set<string>();
  while (candidates.length < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      candidates.push({
        id: `c_${positionId}_${candidates.length + 1}`,
        firstName,
        lastName,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+79${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: 'in_progress' as CandidateStatusEnum,
        positionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return candidates;
};

const generateInterviewsForPosition = (positionId: string, positionCandidates: Candidate[], minScore: number): Interview[] => {
  const interviews: Interview[] = [];
  const interviewCount = Math.floor(Math.random() * 16) + 5;

  for (let i = 0; i < interviewCount; i++) {
    const candidate = positionCandidates[i % positionCandidates.length];
    if (!candidate) continue;
    
    const status = Math.random() < 0.5 ? InterviewStatusEnum.finished : InterviewStatusEnum.in_progress;
    let result: InterviewResultEnum | undefined = undefined;
    let aiScore = 0;
    
    if (status === InterviewStatusEnum.finished) {
      // Generate score between 5.0 and 9.5
      aiScore = +(5 + Math.random() * 4.5).toFixed(1);
      // Use the actual minScore from the vacancy
      result = aiScore >= minScore ? InterviewResultEnum.successful : InterviewResultEnum.unsuccessful;
    }
    
    const startedAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30);
    
    interviews.push({
      id: `i_${positionId}_${i+1}`,
      candidateId: candidate.id,
      positionId,
      status,
      result,
      startedAt: startedAt.toISOString(),
      finishedAt: status === 'finished' ? new Date(startedAt.getTime() + 1000 * 60 * 30).toISOString() : undefined,
      transcript: '...',
      audioUrl: '',
      aiScore,
      answers: [],
    });
  }
  return interviews;
};

// 2. Data Hydration & Population
const allCandidates: Candidate[] = [];
const allPositionInterviews: Record<string, Interview[]> = {};
const vacancies: Position[] = [];

// Create the specific, static candidate and interview for the welcome screen
const staticTestCandidate: Candidate = {
  id: 'c_p1_0',
  firstName: 'Иван',
  lastName: 'Тестовый',
  name: 'Иван Тестовый',
  email: 'ivan.test@example.com',
  phone: '+79991234567',
  status: CandidateStatusEnum.in_progress,
  positionId: 'p1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const staticTestInterview: Interview = {
    id: 'i_p1_0',
    candidateId: staticTestCandidate.id,
    positionId: 'p1',
    status: InterviewStatusEnum.in_progress,
    result: undefined,
    startedAt: new Date().toISOString(),
    transcript: '...',
    aiScore: 0,
    answers: [],
};

// First, populate vacancies from static data
vacanciesData.forEach((vac) => {
  vacancies.push({
    ...(vac as any),
    candidates: [],
    stats: {
      positionId: vac.id,
      interviewsTotal: 0,
      interviewsInProgress: 0,
      interviewsSuccessful: 0,
      interviewsUnsuccessful: 0,
    },
    team: mockTeam,
    branding: mockBranding,
  });
});

// Then, generate interviews using the actual minScore from vacancies
vacancies.forEach((vacancy) => {
  const positionId = vacancy.id;
  
  // Generate dynamic candidates for CRM views
  const dynamicCandidates = generateUniqueCandidates(20, positionId);

  // For p1, ensure our static candidate is included
  const positionCandidates = positionId === 'p1' ? [staticTestCandidate, ...dynamicCandidates] : dynamicCandidates;
  allCandidates.push(...positionCandidates);

  // Generate dynamic interviews for CRM views
  const dynamicInterviews = generateInterviewsForPosition(positionId, positionCandidates, vacancy.minScore || 7.0);

  // For p1, ensure our static interview is included
  const positionInterviews = positionId === 'p1' ? [staticTestInterview, ...dynamicInterviews] : dynamicInterviews;
  allPositionInterviews[positionId] = positionInterviews;
  
  // Update vacancy with candidates and stats
  vacancy.candidates = positionCandidates;
  vacancy.stats = {
    positionId: positionId,
    interviewsTotal: positionInterviews.length,
    interviewsInProgress: positionInterviews.filter(i => i.status === 'in_progress').length,
    interviewsSuccessful: positionInterviews.filter(i => i.result === 'successful').length,
    interviewsUnsuccessful: positionInterviews.filter(i => i.result === 'unsuccessful').length,
  };
});

// --- API MOCK IMPLEMENTATION ---

export const mockApi = {
  async getPositions({ status = 'active', search = '', page = 1, size = 20 } = {}): Promise<{ items: Position[]; total: number }> {
    await delay(300);
    let filtered = vacancies.filter(v => v.status === status);
    if (search) filtered = filtered.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
    return { items: filtered.slice((page - 1) * size, page * size), total: filtered.length };
  },
  
  async getPosition(id: string): Promise<Position | undefined> {
    await delay(200);
    return vacancies.find(v => v.id === id);
  },
  
  async getCandidate(id: string): Promise<Candidate | undefined> {
    await delay(200);
    return allCandidates.find(c => c.id === id);
  },
  
  async getInterview(id: string): Promise<Interview | undefined> {
    await delay(200);
    const allInterviews = Object.values(allPositionInterviews).flat();
    console.log('mockApi.getInterview: searching for id:', id);
    console.log('mockApi.getInterview: available interviews:', allInterviews.map(i => i.id));
    const result = allInterviews.find(i => i.id === id);
    console.log('mockApi.getInterview: result:', result);
    return result;
  },
  
  async getInterviews(): Promise<any[]> {
    await delay(300);
    const allInterviews = Object.values(allPositionInterviews).flat();
    
    const enriched = allInterviews.map(interview => {
      const candidate = allCandidates.find(c => c.id === interview.candidateId);
      const position = vacancies.find(v => v.id === interview.positionId);
      return {
        id: interview.id,
        candidate: candidate?.name || 'Unknown Candidate',
        position: position?.title || 'Unknown Position',
        status: interview.result || interview.status,
        date: interview.startedAt,
        completionDate: interview.finishedAt,
        score: interview.aiScore || null,
        positionId: interview.positionId,
      }
    });

    return enriched;
  },
  
  async getPositionInterviews(positionId: string): Promise<Interview[]> {
    await delay(400);
    return allPositionInterviews[positionId] || [];
  },
  
  async getInterviewStats() {
    await delay(500);
    const allInterviews = Object.values(allPositionInterviews).flat();
    return allInterviews.map(interview => {
      const candidate = allCandidates.find(c => c.id === interview.candidateId);
      const position = vacancies.find(v => v.id === interview.positionId);
      return {
        id: interview.id,
        candidateName: candidate?.name || 'Unknown Candidate',
        positionTitle: position?.title || 'Unknown Position',
        status: interview.result || interview.status,
        score: interview.aiScore,
        createdAt: interview.startedAt,
        completedAt: interview.finishedAt,
      };
    });
  },
  
  async getQuestions(positionId: string): Promise<Question[]> {
    await delay(150);
    return defaultQuestions[positionId] || [];
  },

  async getRecentInterviews() {
    await delay(350);
    const allInterviews = Object.values(allPositionInterviews).flat();
    const recent = allInterviews
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 5);

    const enriched = recent.map(interview => {
      const candidate = allCandidates.find(c => c.id === interview.candidateId);
      const position = vacancies.find(v => v.id === interview.positionId);
      return {
        id: interview.id,
        candidate: candidate?.name || 'Unknown Candidate',
        position: position?.title || 'Unknown Position',
        status: interview.result || interview.status,
        date: interview.startedAt,
        completionDate: interview.finishedAt,
        score: interview.aiScore || null,
        positionId: interview.positionId,
      }
    });

    return enriched;
  },

  async getStats() {
    await delay(200);
    const allInterviews = Object.values(allPositionInterviews).flat();
    const successful = allInterviews.filter(i => i.result === 'successful').length;
    const totalPositions = vacancies.length;
    const totalCandidates = allCandidates.length;

    return [
        { name: 'Активные вакансии', value: totalPositions, icon: 'briefcase', href: '/vacancies', change: `+${Math.floor(Math.random() * 3)}`, changeType: 'positive' },
        { name: 'Всего кандидатов', value: totalCandidates, icon: 'users', href: '/interviews', change: `+${Math.floor(Math.random() * 10)}`, changeType: 'positive' },
        { name: 'Успешных интервью', value: successful, icon: 'check', href: '/reports', change: `+${Math.floor(Math.random() * 5)}`, changeType: 'positive' },
        { name: 'Средний балл', value: '7.8', icon: 'trending-up', href: '/reports', change: '+0.1', changeType: 'positive' },
    ];
  },
  
  async getReports() {
    await delay(200);
    const allInterviews = Object.values(allPositionInterviews).flat();
    return allInterviews.map(i => ({
      id: i.id,
      candidate: allCandidates.find(c => c.id === i.candidateId)?.name || '',
      position: vacancies.find(v => v.id === i.positionId)?.title || '',
      score: i.aiScore || 0,
      date: i.startedAt || '',
      completionDate: i.finishedAt || '',
      status: i.status === 'finished' ? 'Успешно' : 'В процессе',
    }));
  },

  getChecklist: async () => {
    await delay(100);
    return [
      { text: 'Вы используете последнюю версию браузера Chrome или Edge' },
      { text: 'Ваши колонки или наушники включены и работают' },
      { text: 'Ваш микрофон включен и работает' },
      { text: 'Вы в тихом помещении и готовы сконцентрироваться на собеседовании' },
    ];
  },

  getInviteInfo: async () => {
    await delay(50);
    return {
      language: 'Русский',
      questionsCount: 3, // based on defaultQuestions for p1
    };
  },
  
  async getTeam() {
    await delay(200);
    return mockTeam;
  },
  
  async getUserInfo() {
    await delay(100);
    return {
      email: 'ferruspoint@mail.ru',
      language: 'Русский',
    };
  },

  async getTariffInfo() {
    await delay(100);
    return {
      interviewsLeft: 2,
      until: '23.06.25',
    };
  },
  
  async getBranding() {
    await delay(200);
    return mockBranding;
  },

  async getAccount() {
    await delay(200);
    
    // Пытаемся получить данные пользователя из sessionStorage
    const currentUserStr = sessionStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        return {
          ...currentUser,
          phone: currentUser.phone || '+7 (999) 123-45-67' // добавляем телефон если его нет
        };
      } catch (e) {
        console.warn('Failed to parse currentUser from sessionStorage:', e);
      }
    }
    
    // Возвращаем дефолтные данные, если нет сохраненного пользователя
    return {
      id: 'user-1',
      name: 'Тестовый Пользователь',
      email: 'ferruspoint@mail.ru',
      role: UserRoleEnum.recruiter,
      avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      language: 'Русский',
      phone: '+7 (999) 123-45-67'
    };
  },

  async login(email: string, password: string) {
    await delay(500);
    const userEmail = email || 'test@example.com';
    
    // Создаем более реалистичного пользователя на основе email
    const userName = email ? email.split('@')[0] : 'Тестовый';
    const userRole = email?.includes('admin') ? UserRoleEnum.admin : email?.includes('viewer') ? UserRoleEnum.viewer : UserRoleEnum.recruiter;
    
    return { 
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        name: userName.charAt(0).toUpperCase() + userName.slice(1) + ' Пользователь',
        email: userEmail,
        role: userRole,
        avatarUrl: `https://randomuser.me/api/portraits/${userRole === UserRoleEnum.admin ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
        language: 'Русский'
      }
    };
  },

  async getArchive() {
    await delay(300);
    return [];
  },

  async getLearnMaterials() {
    await delay(200);
    return [
      { title: 'Видео: Как пользоваться платформой', url: 'https://www.youtube.com/', description: 'Краткое видео о возможностях и интерфейсе.' },
      { title: 'FAQ: Часто задаваемые вопросы', url: 'https://faq.example.com/', description: 'Ответы на популярные вопросы по работе с системой.' },
      { title: 'Гайд: Как создать вакансию', url: 'https://docs.example.com/', description: 'Пошаговая инструкция по созданию вакансии.' },
    ];
  },
  
  async generateQuestions({ description, questionsCount }: { description: string; questionsCount: number }): Promise<Question[]> {
    await delay(500);
    return Array.from({ length: questionsCount }, (_, i) => ({
      id: `gen${i+1}`,
      positionId: 'gen',
      text: `AI-вопрос #${i+1} по описанию: ${description}`,
      type: 'text' as QuestionTypeEnum,
      order: i+1,
    }));
  },

  // Аутентификация
  async logout(): Promise<void> {
    await delay(200);
    // В реальном API здесь была бы очистка токена
    return;
  },

  // Управление вакансиями
  async createPosition(positionData: any): Promise<Position> {
    await delay(500);
    const newPosition: Position = {
      id: `p${Date.now()}`,
      title: positionData.title,
      company: 'WMT Рекрутер',
      description: positionData.description || '',
      status: positionData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicLink: `https://hr-recruiter.com/position/${Date.now()}`,
      stats: {
        positionId: `p${Date.now()}`,
        interviewsTotal: 0,
        interviewsInProgress: 0,
        interviewsSuccessful: 0,
        interviewsUnsuccessful: 0,
      },
      team: mockTeam,
      branding: mockBranding,
      candidates: [],
      topics: positionData.topics || [],
      minScore: positionData.minScore || 7.0,
      avgScore: 0,
    };
    vacancies.push(newPosition);
    return newPosition;
  },

  async updatePosition(id: string, positionData: any): Promise<Position> {
    await delay(400);
    const position = vacancies.find(v => v.id === id);
    if (!position) throw new Error('Position not found');
    
    Object.assign(position, {
      ...positionData,
      updatedAt: new Date().toISOString(),
    });
    
    return position;
  },

  async deletePosition(id: string): Promise<void> {
    await delay(300);
    const index = vacancies.findIndex(v => v.id === id);
    if (index !== -1) {
      vacancies[index].status = 'archived';
    }
  },

  async getPositionPublicLink(id: string): Promise<{ publicLink: string }> {
    await delay(200);
    const position = vacancies.find(v => v.id === id);
    if (!position) throw new Error('Position not found');
    return { publicLink: position.publicLink || `https://hr-recruiter.com/position/${id}` };
  },

  async getPositionStats(id: string): Promise<any> {
    await delay(300);
    const position = vacancies.find(v => v.id === id);
    if (!position) throw new Error('Position not found');
    return position.stats;
  },

  // Управление вопросами
  async createQuestion(positionId: string, questionData: any): Promise<Question> {
    await delay(300);
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      positionId,
      text: questionData.text,
      type: questionData.type || 'text',
      order: questionData.order || 1,
      isRequired: questionData.isRequired || false,
    };
    
    if (!defaultQuestions[positionId]) {
      defaultQuestions[positionId] = [];
    }
    defaultQuestions[positionId].push(newQuestion);
    
    return newQuestion;
  },

  async updateQuestion(id: string, questionData: any): Promise<Question> {
    await delay(300);
    for (const positionId in defaultQuestions) {
      const questionIndex = defaultQuestions[positionId].findIndex(q => q.id === id);
      if (questionIndex !== -1) {
        Object.assign(defaultQuestions[positionId][questionIndex], questionData);
        return defaultQuestions[positionId][questionIndex];
      }
    }
    throw new Error('Question not found');
  },

  async deleteQuestion(id: string): Promise<void> {
    await delay(200);
    for (const positionId in defaultQuestions) {
      const questionIndex = defaultQuestions[positionId].findIndex(q => q.id === id);
      if (questionIndex !== -1) {
        defaultQuestions[positionId].splice(questionIndex, 1);
        return;
      }
    }
  },

  // Управление кандидатами
  async createCandidate(positionId: string, candidateData: any): Promise<Candidate> {
    await delay(400);
    const newCandidate: Candidate = {
      id: `c_${positionId}_${Date.now()}`,
      firstName: candidateData.name?.split(' ')[0] || 'Unknown',
      lastName: candidateData.name?.split(' ')[1] || 'Candidate',
      name: candidateData.name,
      email: candidateData.email || '',
      phone: candidateData.phone || '',
      status: 'new',
      positionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allCandidates.push(newCandidate);
    
    // Добавить кандидата к вакансии
    const position = vacancies.find(v => v.id === positionId);
    if (position && position.candidates) {
      position.candidates.push(newCandidate);
    }
    
    return newCandidate;
  },

  async updateCandidate(id: string, candidateData: any): Promise<Candidate> {
    await delay(300);
    const candidate = allCandidates.find(c => c.id === id);
    if (!candidate) throw new Error('Candidate not found');
    
    Object.assign(candidate, {
      ...candidateData,
      updatedAt: new Date().toISOString(),
    });
    
    return candidate;
  },

  async deleteCandidate(id: string): Promise<void> {
    await delay(200);
    const index = allCandidates.findIndex(c => c.id === id);
    if (index !== -1) {
      allCandidates.splice(index, 1);
    }
  },

  // Управление интервью
  async startInterview(candidateId: string): Promise<Interview> {
    await delay(500);
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const newInterview: Interview = {
      id: `i_${candidateId}_${Date.now()}`,
      candidateId,
      positionId: candidate.positionId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      transcript: '',
      aiScore: 0,
      answers: [],
    };
    
    if (!allPositionInterviews[candidate.positionId]) {
      allPositionInterviews[candidate.positionId] = [];
    }
    allPositionInterviews[candidate.positionId].push(newInterview);
    
    return newInterview;
  },

  async submitInterviewAnswer(candidateId: string, answerData: any): Promise<any> {
    await delay(300);
    const interview = Object.values(allPositionInterviews)
      .flat()
      .find(i => i.candidateId === candidateId && i.status === 'in_progress');
    
    if (!interview) throw new Error('Interview not found');
    
    const answer = {
      id: `ans_${Date.now()}`,
      interviewId: interview.id,
      questionId: answerData.questionId,
      answerText: answerData.answerText || '',
      audioUrl: answerData.audioUrl || '',
      transcript: answerData.transcript || '',
      createdAt: new Date().toISOString(),
    };
    
    if (interview.answers) {
      interview.answers.push(answer);
    }
    return answer;
  },

  async finishInterview(candidateId: string): Promise<Interview> {
    await delay(400);
    const interview = Object.values(allPositionInterviews)
      .flat()
      .find(i => i.candidateId === candidateId && i.status === 'in_progress');
    
    if (!interview) throw new Error('Interview not found');
    
    interview.status = 'finished';
    interview.finishedAt = new Date().toISOString();
    interview.aiScore = +(5 + Math.random() * 4.5).toFixed(1);
    interview.result = interview.aiScore >= 7.0 ? 'successful' : 'unsuccessful';
    
    return interview;
  },

  // Управление брендингом
  async updateBranding(brandingData: any): Promise<Branding> {
    await delay(300);
    Object.assign(mockBranding, brandingData);
    return mockBranding;
  },

  // Управление пользователями
  async getUsers(): Promise<User[]> {
    await delay(300);
    return mockTeam;
  },

  async createUser(userData: any): Promise<User> {
    await delay(400);
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: `https://randomuser.me/api/portraits/${userData.role === 'admin' ? 'men' : 'women'}/${Date.now() % 50}.jpg`,
      language: 'Русский',
    };
    mockTeam.push(newUser);
    return newUser;
  },

  async getUser(id: string): Promise<User | undefined> {
    await delay(200);
    return mockTeam.find(u => u.id === id);
  },

  async updateUser(id: string, userData: any): Promise<User> {
    await delay(300);
    const user = mockTeam.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    Object.assign(user, userData);
    return user;
  },

  async deleteUser(id: string): Promise<void> {
    await delay(200);
    const index = mockTeam.findIndex(u => u.id === id);
    if (index !== -1) {
      mockTeam.splice(index, 1);
    }
  },

  // Управление тарифами
  async getTariffs(): Promise<any[]> {
    await delay(300);
    return [
      { id: 't1', name: 'Базовый', features: ['5 интервью/месяц'], price: 0, isActive: true },
      { id: 't2', name: 'Профессиональный', features: ['50 интервью/месяц', 'AI анализ'], price: 5000, isActive: true },
      { id: 't3', name: 'Корпоративный', features: ['Неограниченно', 'AI анализ', 'Приоритетная поддержка'], price: 15000, isActive: true },
    ];
  },

  async createTariff(tariffData: any): Promise<any> {
    await delay(400);
    const newTariff = {
      id: `t${Date.now()}`,
      name: tariffData.name,
      features: tariffData.features || [],
      price: tariffData.price,
      isActive: tariffData.isActive || true,
    };
    return newTariff;
  },

  async updateTariff(id: string, tariffData: any): Promise<any> {
    await delay(300);
    // В реальном API здесь было бы обновление тарифа
    return { id, ...tariffData };
  },

  async deleteTariff(id: string): Promise<void> {
    await delay(200);
    // В реальном API здесь было бы удаление тарифа
  },

  // Статистика
  async getPositionsStats(): Promise<any[]> {
    await delay(300);
    return vacancies.map(v => v.stats);
  },

  async getCandidatesStats(): Promise<any> {
    await delay(300);
    const total = allCandidates.length;
    const inProgress = allCandidates.filter(c => c.status === 'in_progress').length;
    const finished = allCandidates.filter(c => c.status === 'finished').length;
    const hired = allCandidates.filter(c => c.status === 'hired').length;
    
    return { total, inProgress, finished, hired };
  },

  // AI сервисы
  async transcribeAudio(audioFile: File): Promise<{ transcript: string }> {
    await delay(1000);
    return { transcript: 'Это мок транскрипция аудио файла. В реальном API здесь была бы обработка аудио.' };
  },

  // НЕ УБИРАТЬ В МОКИ - это UI конфигурация для статусов интервью
  getInterviewStatusMap() {
    return {
      successful: { text: 'Успешно', icon: 'check-circle' },
      unsuccessful: { text: 'Неуспешно', icon: 'x-circle' },
      in_progress: { text: 'В процессе', icon: 'clock' },
      not_started: { text: 'Не начато', icon: 'clock' },
    };
  },

  // НЕ УБИРАТЬ В МОКИ - это UI конфигурация для иконок
  getIconMap() {
    return {
      briefcase: 'briefcase',
      users: 'users',
      check: 'check-circle',
      'trending-up': 'trending-up',
    };
  },

  // НЕ УБИРАТЬ В МОКИ - это генерация случайных имен
  getRandomNames() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return { firstName, lastName, fullName: `${firstName} ${lastName}` };
  },
};

// Debug: Log data initialization
console.log('mockApi: Data initialization complete');
console.log('mockApi: allPositionInterviews keys:', Object.keys(allPositionInterviews));
console.log('mockApi: p1 interviews:', allPositionInterviews['p1']?.map(i => i.id));
console.log('mockApi: staticTestInterview:', staticTestInterview); 