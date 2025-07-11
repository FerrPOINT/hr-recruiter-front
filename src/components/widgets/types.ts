// Строгие типы для виджетов

// Импортируем сгенерированные типы
import type { 
  CandidateStatusEnum, 
  PositionStatusEnum, 
  InterviewStatusEnum, 
  InterviewResultEnum, 
  QuestionTypeEnum,
  RoleEnum
} from '../../client/models';

// Базовые типы данных
export interface Position {
  id: number;
  title: string;
  description?: string;
  status: PositionStatusEnum;
  company?: string;
  level?: 'junior' | 'middle' | 'senior' | 'lead';
  language?: string;
  createdAt: string;
  updatedAt: string;
  stats?: PositionStats;
}

export interface Interview {
  id: number;
  candidateId: number;
  positionId: number;
  status: InterviewStatusEnum;
  result?: InterviewResultEnum;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  transcript?: string;
  audioUrl?: string;
  videoUrl?: string;
  aiScore?: number;
  candidate?: Candidate;
  position?: Position;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
  email?: string;
  phone?: string;
  status: CandidateStatusEnum;
  positionId: number;
  createdAt: string;
  updatedAt: string;
  interview?: Interview;
}

export interface Question {
  id: number;
  positionId: number;
  text: string;
  type: QuestionTypeEnum;
  order: number;
  isRequired: boolean;
  evaluationCriteria?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleEnum;
  avatarUrl?: string;
  language?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Статистика
export interface PositionStats {
  positionId: number;
  interviewsTotal: number;
  interviewsSuccessful: number;
  interviewsInProgress: number;
  interviewsUnsuccessful: number;
}

export interface CandidateStats {
  total: number;
  inProgress: number;
  finished: number;
  hired: number;
  rejected?: number;
}

export interface InterviewStats {
  total: number;
  successful: number;
  unsuccessful: number;
  inProgress?: number;
  notStarted?: number;
  cancelled?: number;
}

export interface DashboardStats {
  positionsCount: number;
  candidatesCount: number;
  total: number;
}

// Аналитика
export interface AnalyticsData {
  candidates?: CandidateStats;
  interviews?: InterviewStats;
  positions?: PositionStats[];
}

// Активность
export interface ActivityItem {
  type: 'interview' | 'position' | 'candidate' | 'hired' | 'user';
  title: string;
  time: string;
  user: string;
  metadata?: Record<string, any>;
}

// Фильтры и сортировка
export type SortField = 'createdAt' | 'updatedAt' | 'title' | 'name' | 'status' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid' | 'calendar' | 'stats';

// Состояния виджетов
export interface WidgetState {
  loading: boolean;
  error: string | null;
  data: any;
}

// Пропсы для виджетов
export interface BaseWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

// Специфичные пропсы для виджетов
export interface DashboardWidgetProps extends BaseWidgetProps {
  positions?: Position[];
  interviews?: Interview[];
  candidates?: Candidate[];
  stats?: DashboardStats;
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface VacancyListWidgetProps extends BaseWidgetProps {
  positions?: Position[];
  interviews?: Interview[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface StatsWidgetProps extends BaseWidgetProps {
  stats?: DashboardStats;
  loading?: boolean;
  error?: string | null;
}

export interface ReportsWidgetProps extends BaseWidgetProps {
  reports?: any[];
  loading?: boolean;
  error?: string | null;
}

export interface AccountWidgetProps extends BaseWidgetProps {
  user?: User;
  loading?: boolean;
  error?: string | null;
}

export interface RecentInterviewsWidgetProps extends BaseWidgetProps {
  interviews?: Interview[];
  loading?: boolean;
  error?: string | null;
}

export interface TeamWidgetProps extends BaseWidgetProps {
  users?: User[];
  positions?: Position[];
  interviews?: Interview[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface CandidatesWidgetProps extends BaseWidgetProps {
  candidates?: Candidate[];
  positions?: Position[];
  interviews?: Interview[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface QuestionsWidgetProps extends BaseWidgetProps {
  questions?: Question[];
  positions?: Position[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface CalendarWidgetProps extends BaseWidgetProps {
  interviews?: Interview[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

export interface NotificationsWidgetProps extends BaseWidgetProps {
  notifications?: Notification[];
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
}

// Утилитарные типы
export type NotificationType = 'info' | 'success' | 'warning' | 'error'; 