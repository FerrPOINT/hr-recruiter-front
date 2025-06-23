import { Branding } from '../client/models/branding';
import { Candidate } from '../client/models/candidate';
import { CandidateStatusEnum } from '../client/models/candidate-status-enum';
import { Interview } from '../client/models/interview';
import { InterviewStatusEnum } from '../client/models/interview-status-enum';
import { InterviewResultEnum } from '../client/models/interview-result-enum';
import { Position } from '../client/models/position';
import { Question } from '../client/models/question';
import { QuestionTypeEnum } from '../client/models/question-type-enum';
import { User } from '../client/models/user';
import { RoleEnum } from '../client/models/role-enum';
import { PositionStats } from '../client/models/position-stats';
import vacanciesData from './vacancies.json';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Анна Иванова',
    role: 'recruiter' as RoleEnum,
    email: 'anna@company.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    language: 'Русский',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Петр Петров',
    role: 'viewer' as RoleEnum,
    email: 'petr@company.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    language: 'Русский',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockBranding: Branding = {
  id: 'branding-1',
  companyName: 'WMT Рекрутер',
  logoUrl: '',
  primaryColor: '#FF6600',
  secondaryColor: '#0055FF',
  emailSignature: 'С уважением, команда WMT Рекрутер',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const firstNames = ['Иван', 'Петр', 'Сергей', 'Анна', 'Мария', 'Елена', 'Дмитрий', 'Андрей', 'Ольга', 'Татьяна'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецова', 'Попова', 'Смирнова', 'Васильев', 'Соколов', 'Михайлова', 'Новиков'];

const defaultQuestions: Record<string, Question[]> = {
  p1: [
    { 
      id: 'q1', 
      text: 'Как вы используете горутины для конкурентности в Go?', 
      type: 'text' as QuestionTypeEnum, 
      order: 1,
      isRequired: true,
      evaluationCriteria: 'Оценка понимания конкурентности в Go',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { 
      id: 'q2', 
      text: 'Что такое каналы в Go и для чего они нужны?', 
      type: 'text' as QuestionTypeEnum, 
      order: 2,
      isRequired: true,
      evaluationCriteria: 'Понимание механизмов коммуникации',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { 
      id: 'q3', 
      text: 'Опишите ваш опыт работы с PostgreSQL.', 
      type: 'text' as QuestionTypeEnum, 
      order: 3,
      isRequired: true,
      evaluationCriteria: 'Опыт работы с базами данных',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  p2: [{ 
    id: 'q4', 
    text: 'Что такое Virtual DOM в React?', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Понимание React архитектуры',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  p3: [{ 
    id: 'q7', 
    text: 'Что такое overfitting и как с ним бороться?', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Понимание машинного обучения',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  p4: [{ 
    id: 'q10', 
    text: 'Опишите ваш опыт в автоматизации тестирования API.', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Опыт автоматизации тестирования',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  p5: [{ 
    id: 'q13', 
    text: 'Как вы приоритизируете гипотезы для проверки?', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Аналитическое мышление',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  p6: [{ 
    id: 'q16', 
    text: 'Опишите ваш опыт работы с Terraform и инфраструктурой как код.', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Опыт работы с IaC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  p7: [{ 
    id: 'q19', 
    text: 'Расскажите о вашем подходе к созданию дизайн-систем.', 
    type: 'text' as QuestionTypeEnum, 
    order: 1,
    isRequired: true,
    evaluationCriteria: 'Понимание дизайн-систем',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
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
      videoUrl: '',
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
const positionStats: Record<string, PositionStats> = {};

// Create the specific, static candidate and interview for the welcome screen
const staticTestCandidate: Candidate = {
  id: 'c_p1_0',
  firstName: 'Иван',
  lastName: 'Тестовый',
  name: 'Иван Тестовый',
  email: 'ivan.test@example.com',
  phone: '+79991234567',
  status: CandidateStatusEnum.in_progress,
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
    audioUrl: '',
    videoUrl: '',
    aiScore: 0,
    answers: [],
};

// First, populate vacancies from static data
vacanciesData.forEach((vac) => {
  const positionId = vac.id;
  
  // Generate candidates for this position
  const dynamicCandidates = generateUniqueCandidates(20, positionId);
  const positionCandidates = positionId === 'p1' ? [staticTestCandidate, ...dynamicCandidates] : dynamicCandidates;
  allCandidates.push(...positionCandidates);

  // Generate interviews for this position
  const dynamicInterviews = generateInterviewsForPosition(positionId, positionCandidates, vac.minScore || 7.0);
  const positionInterviews = positionId === 'p1' ? [staticTestInterview, ...dynamicInterviews] : dynamicInterviews;
  allPositionInterviews[positionId] = positionInterviews;

  // Calculate stats
  const stats: PositionStats = {
    positionId,
    interviewsTotal: positionInterviews.length,
    interviewsInProgress: positionInterviews.filter(i => i.status === 'in_progress').length,
    interviewsSuccessful: positionInterviews.filter(i => i.result === 'successful').length,
    interviewsUnsuccessful: positionInterviews.filter(i => i.result === 'unsuccessful').length,
  };
  positionStats[positionId] = stats;

  // Calculate average score
  const finishedInterviews = positionInterviews.filter(i => i.status === 'finished');
  const avgScore = finishedInterviews.length > 0 
    ? +(finishedInterviews.reduce((sum, i) => sum + (i.aiScore || 0), 0) / finishedInterviews.length).toFixed(1)
    : 0;

  vacancies.push({
    id: vac.id,
    title: vac.title,
    description: vac.description,
    status: vac.status as any,
    topics: vac.topics || [],
    minScore: vac.minScore || 7.0,
    language: 'Русский',
    showOtherLang: false,
    tags: [],
    answerTime: vac.answerTime || 150,
    level: 'middle',
    saveAudio: true,
    saveVideo: true,
    randomOrder: false,
    questionType: 'В основном хард-скиллы',
    questionsCount: 5,
    checkType: 'AI + человек',
    company: 'WMT Рекрутер',
    publicLink: `https://hr-recruiter.com/position/${vac.id}`,
    avgScore,
    stats,
    team: mockTeam,
    branding: mockBranding,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

// --- API MOCK IMPLEMENTATION ---

export const mockApi = {
  async getPositions({ status = '', search = '', page = 1, size = 20 } = {}): Promise<{ items: Position[]; total: number }> {
    await delay(300);
    let filtered = vacancies;
    if (status) {
      filtered = filtered.filter(v => v.status === status);
    }
    if (search) filtered = filtered.filter(v => v.title?.toLowerCase().includes(search.toLowerCase()));
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
    await delay(400);
    const allInterviews = Object.values(allPositionInterviews).flat();
    const totalInterviews = allInterviews.length;
    const successfulInterviews = allInterviews.filter(i => i.result === 'successful').length;
    const inProgressInterviews = allInterviews.filter(i => i.status === 'in_progress').length;
    const totalCandidates = allCandidates.length;
    const hiredCandidates = allCandidates.filter(c => c.status === 'hired').length;

    return {
      totalInterviews,
      successfulInterviews,
      inProgressInterviews,
      totalCandidates,
      hiredCandidates,
      successRate: totalInterviews > 0 ? Math.round((successfulInterviews / totalInterviews) * 100) : 0,
    };
  },

  async getReports() {
    await delay(600);
    const allInterviews = Object.values(allPositionInterviews).flat();
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthInterviews = allInterviews.filter(interview => {
        const interviewDate = new Date(interview.startedAt);
        return interviewDate >= month && interviewDate <= monthEnd;
      });

      const successful = monthInterviews.filter(i => i.result === 'successful').length;
      const unsuccessful = monthInterviews.filter(i => i.result === 'unsuccessful').length;
      const avgScore = monthInterviews.length > 0 
        ? +(monthInterviews.reduce((sum, i) => sum + (i.aiScore || 0), 0) / monthInterviews.length).toFixed(1)
        : 0;

      months.push({
        month: month.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
        totalInterviews: monthInterviews.length,
        successful,
        unsuccessful,
        avgScore,
        dynamics: Math.floor(Math.random() * 30) - 10, // Random dynamics for demo
      });
    }

    return months;
  },

  async getTeam() {
    await delay(200);
    return mockTeam;
  },

  async getUserInfo() {
    await delay(150);
    return {
      phone: '+79991234567',
      preferences: {
        language: 'ru',
        notifications: true,
      }
    };
  },

  async getTariffInfo() {
    await delay(200);
    return {
      interviewsLeft: 150,
      until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async getBranding() {
    await delay(100);
    return mockBranding;
  },

  async getAccount() {
    await delay(200);
    return mockTeam[0]; // Return first user as current user
  },

  async updateAccount(userData: any) {
    await delay(300);
    // In a real app, this would update the user data
    return { ...mockTeam[0], ...userData };
  },

  async login(email: string, password: string) {
    await delay(500);
    
    // Mock authentication
    if (email === 'test@example.com' && password === 'password') {
      const user = mockTeam[0];
      const token = 'mock-jwt-token-' + Date.now();
      
      // Store token in sessionStorage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      return {
        token,
        user,
      };
    }
    try {
      const userEmail = email || 'test@example.com';
      const user = mockTeam.find(u => u.email === userEmail) || mockTeam[0];
      const token = 'mock-jwt-token-' + Date.now();
      
      // Store token in sessionStorage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      return {
        token,
        user,
      };
    } catch (error) {
      throw new Error('Login failed');
    }
  },

  async getArchive() {
    await delay(300);
    return vacancies.filter(v => v.status === 'archived');
  },

  async getLearnMaterials() {
    await delay(200);
    return [
      { title: 'Как проводить эффективные собеседования', url: '#', description: 'Основы проведения собеседований' },
      { title: 'AI в рекрутинге', url: '#', description: 'Использование ИИ для оценки кандидатов' },
    ];
  },

  async getChecklist() {
    await delay(100);
    return [
      { text: 'Вы используете последнюю версию браузера Chrome или Edge' },
      { text: 'Ваши колонки или наушники включены и работают' },
      { text: 'Ваш микрофон включен и работает' },
      { text: 'Вы в тихом помещении и готовы сконцентрироваться на собеседовании' },
    ];
  },

  async getInviteInfo() {
    await delay(50);
    return {
      language: 'Русский',
      questionsCount: 3, // based on defaultQuestions for p1
    };
  },

  async generateQuestions({ description, questionsCount }: { description: string; questionsCount: number }): Promise<Question[]> {
    await delay(500);
    return Array.from({ length: questionsCount }, (_, i) => ({
      id: `gen${i+1}`,
      text: `AI-вопрос #${i+1} по описанию: ${description}`,
      type: 'text' as QuestionTypeEnum,
      order: i+1,
      isRequired: true,
      evaluationCriteria: `Критерии оценки для вопроса #${i+1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  async logout(): Promise<void> {
    await delay(200);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
  },

  async createPosition(positionData: any): Promise<Position> {
    await delay(400);
    const newPosition: Position = {
      id: `p${Date.now()}`,
      title: positionData.title,
      description: positionData.description || '',
      status: positionData.status || 'active',
      topics: positionData.topics || [],
      minScore: positionData.minScore || 7.0,
      language: positionData.language || 'Русский',
      showOtherLang: positionData.showOtherLang || false,
      tags: positionData.tags || [],
      answerTime: positionData.answerTime || 150,
      level: positionData.level || 'middle',
      saveAudio: positionData.saveAudio !== false,
      saveVideo: positionData.saveVideo !== false,
      randomOrder: positionData.randomOrder || false,
      questionType: positionData.questionType || 'В основном хард-скиллы',
      questionsCount: positionData.questionsCount || 5,
      checkType: positionData.checkType || 'AI + человек',
      company: positionData.company || 'WMT Рекрутер',
      publicLink: `https://hr-recruiter.com/position/p${Date.now()}`,
      avgScore: 0,
      team: mockTeam,
      branding: mockBranding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    vacancies.push(newPosition);
    return newPosition;
  },

  async updatePosition(id: string, positionData: any): Promise<Position> {
    await delay(300);
    const index = vacancies.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Position not found');
    
    vacancies[index] = { ...vacancies[index], ...positionData, updatedAt: new Date().toISOString() };
    return vacancies[index];
  },

  async deletePosition(id: string): Promise<void> {
    await delay(200);
    const index = vacancies.findIndex(v => v.id === id);
    if (index !== -1) {
      vacancies.splice(index, 1);
    }
  },

  async getPositionPublicLink(id: string): Promise<{ publicLink: string }> {
    await delay(150);
    const position = vacancies.find(v => v.id === id);
    if (!position) throw new Error('Position not found');
    return { publicLink: position.publicLink || `https://hr-recruiter.com/position/${id}` };
  },

  async getPositionStats(id: string): Promise<any> {
    await delay(200);
    const position = vacancies.find(v => v.id === id);
    if (!position) throw new Error('Position not found');
    return positionStats[id];
  },

  async createQuestion(positionId: string, questionData: any): Promise<Question> {
    await delay(300);
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: questionData.text,
      type: questionData.type || 'text',
      order: questionData.order || 1,
      isRequired: questionData.isRequired !== false,
      evaluationCriteria: questionData.evaluationCriteria || 'Критерии оценки',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!defaultQuestions[positionId]) {
      defaultQuestions[positionId] = [];
    }
    defaultQuestions[positionId].push(newQuestion);
    return newQuestion;
  },

  async createPositionQuestion(positionId: string, questionData: any): Promise<Question> {
    return this.createQuestion(positionId, questionData);
  },

  async updateQuestion(id: string, questionData: any): Promise<Question> {
    await delay(250);
    // Find and update question in all position questions
    for (const positionId in defaultQuestions) {
      const index = defaultQuestions[positionId].findIndex(q => q.id === id);
      if (index !== -1) {
        defaultQuestions[positionId][index] = { 
          ...defaultQuestions[positionId][index], 
          ...questionData, 
          updatedAt: new Date().toISOString() 
        };
        return defaultQuestions[positionId][index];
      }
    }
    throw new Error('Question not found');
  },

  async deleteQuestion(id: string): Promise<void> {
    await delay(200);
    // Remove question from all position questions
    for (const positionId in defaultQuestions) {
      const index = defaultQuestions[positionId].findIndex(q => q.id === id);
      if (index !== -1) {
        defaultQuestions[positionId].splice(index, 1);
        break;
      }
    }
  },

  async createCandidate(positionId: string, candidateData: any): Promise<Candidate> {
    await delay(400);
    const newCandidate: Candidate = {
      id: `c_${positionId}_${Date.now()}`,
      firstName: candidateData.firstName || candidateData.name?.split(' ')[0] || '',
      lastName: candidateData.lastName || candidateData.name?.split(' ')[1] || '',
      name: candidateData.name,
      email: candidateData.email || '',
      phone: candidateData.phone || '',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allCandidates.push(newCandidate);
    return newCandidate;
  },

  async updateCandidate(id: string, candidateData: any): Promise<Candidate> {
    await delay(300);
    const index = allCandidates.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Candidate not found');
    
    allCandidates[index] = { ...allCandidates[index], ...candidateData, updatedAt: new Date().toISOString() };
    return allCandidates[index];
  },

  async deleteCandidate(id: string): Promise<void> {
    await delay(200);
    const index = allCandidates.findIndex(c => c.id === id);
    if (index !== -1) {
      allCandidates.splice(index, 1);
    }
  },

  async startInterview(candidateId: string): Promise<Interview> {
    await delay(500);
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found');

    const newInterview: Interview = {
      id: `i_${candidateId}_${Date.now()}`,
      candidateId,
      positionId: 'p1', // Default position for demo
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      transcript: '',
      audioUrl: '',
      videoUrl: '',
      aiScore: 0,
      answers: [],
    };

    if (!allPositionInterviews['p1']) {
      allPositionInterviews['p1'] = [];
    }
    allPositionInterviews['p1'].push(newInterview);

    return newInterview;
  },

  async submitInterviewAnswer(candidateId: string, answerData: any): Promise<any> {
    await delay(300);
    // In a real app, this would save the answer
    return { success: true };
  },

  async finishInterview(candidateId: string): Promise<Interview> {
    await delay(400);
    const allInterviews = Object.values(allPositionInterviews).flat();
    const interview = allInterviews.find(i => i.candidateId === candidateId && i.status === 'in_progress');
    
    if (!interview) throw new Error('Interview not found');
    
    interview.status = 'finished';
    interview.finishedAt = new Date().toISOString();
    interview.aiScore = +(5 + Math.random() * 4.5).toFixed(1);
    interview.result = interview.aiScore >= 7.0 ? 'successful' : 'unsuccessful';
    
    return interview;
  },

  async updateBranding(brandingData: any): Promise<Branding> {
    await delay(300);
    Object.assign(mockBranding, brandingData, { updatedAt: new Date().toISOString() });
    return mockBranding;
  },

  async getUsers(): Promise<User[]> {
    await delay(200);
    return mockTeam;
  },

  async createUser(userData: any): Promise<User> {
    await delay(400);
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
      language: 'Русский',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockTeam.push(newUser);
    return newUser;
  },

  async getUser(id: string): Promise<User | undefined> {
    await delay(150);
    return mockTeam.find(u => u.id === id);
  },

  async updateUser(id: string, userData: any): Promise<User> {
    await delay(300);
    const index = mockTeam.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockTeam[index] = { ...mockTeam[index], ...userData, updatedAt: new Date().toISOString() };
    return mockTeam[index];
  },

  async deleteUser(id: string): Promise<void> {
    await delay(200);
    const index = mockTeam.findIndex(u => u.id === id);
    if (index !== -1) {
      mockTeam.splice(index, 1);
    }
  },

  async getTariffs(): Promise<any[]> {
    await delay(200);
    return [
      { id: '1', name: 'Базовый', price: 0, features: ['5 собеседований в месяц'], isActive: true },
      { id: '2', name: 'Профессиональный', price: 2990, features: ['50 собеседований в месяц', 'AI анализ'], isActive: true },
      { id: '3', name: 'Корпоративный', price: 9990, features: ['Безлимитные собеседования', 'Приоритетная поддержка'], isActive: true },
    ];
  },

  async createTariff(tariffData: any): Promise<any> {
    await delay(400);
    const newTariff = {
      id: `t${Date.now()}`,
      name: tariffData.name,
      price: tariffData.price,
      features: tariffData.features || [],
      isActive: tariffData.isActive !== false,
    };
    return newTariff;
  },

  async updateTariff(id: string, tariffData: any): Promise<any> {
    await delay(300);
    return { id, ...tariffData };
  },

  async deleteTariff(id: string): Promise<void> {
    await delay(200);
    // In a real app, this would delete the tariff
  },

  async getPositionsStats(): Promise<any[]> {
    await delay(300);
    return Object.values(positionStats);
  },

  async getCandidatesStats(): Promise<any> {
    await delay(300);
    return {
      total: allCandidates.length,
      inProgress: allCandidates.filter(c => c.status === 'in_progress').length,
      finished: allCandidates.filter(c => c.status === 'finished').length,
      hired: allCandidates.filter(c => c.status === 'hired').length,
    };
  },

  async transcribeAudio(audioFile: File): Promise<{ transcript: string }> {
    await delay(1000);
    return { transcript: 'Это транскрипция аудио файла. В реальном приложении здесь был бы результат распознавания речи.' };
  },

  getInterviewStatusMap() {
    return {
      not_started: { text: 'Не начато', color: 'gray' },
      in_progress: { text: 'В процессе', color: 'yellow' },
      finished: { text: 'Завершено', color: 'green' },
    };
  },

  getIconMap() {
    return {
      not_started: '⏳',
      in_progress: '🔄',
      finished: '✅',
      successful: '🎉',
      unsuccessful: '❌',
    };
  },

  getRandomNames() {
    return {
      firstNames,
      lastNames,
    };
  },
};

// Debug: Log data initialization
console.log('mockApi: Data initialization complete');
console.log('mockApi: allPositionInterviews keys:', Object.keys(allPositionInterviews));
console.log('mockApi: p1 interviews:', allPositionInterviews['p1']?.map(i => i.id));
console.log('mockApi: staticTestInterview:', staticTestInterview); 