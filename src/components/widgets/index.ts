import BaseWidget from './BaseWidget';
import WidgetHeader from './WidgetHeader';
import VacancyListWidget from './VacancyListWidget';
import DashboardWidget from './DashboardWidget';
import ReportsWidget from './ReportsWidget';
import AccountWidget from './AccountWidget';
import StatsWidget from './StatsWidget';
import RecentInterviewsWidget from './RecentInterviewsWidget';
import InterviewListWidget from './InterviewListWidget';
import TeamWidget from './TeamWidget';
import CandidatesWidget from './CandidatesWidget';
import QuestionsWidget from './QuestionsWidget';
import CalendarWidget from './CalendarWidget';
import NotificationsWidget from './NotificationsWidget';
import InterviewReportWidget from './InterviewReportWidget';

export { default as BaseWidget } from './BaseWidget';
export { default as WidgetHeader } from './WidgetHeader';
export { default as VacancyListWidget } from './VacancyListWidget';
export { default as DashboardWidget } from './DashboardWidget';
export { default as ReportsWidget } from './ReportsWidget';
export { default as AccountWidget } from './AccountWidget';
export { default as StatsWidget } from './StatsWidget';
export { default as RecentInterviewsWidget } from './RecentInterviewsWidget';
export { default as InterviewListWidget } from './InterviewListWidget';
export { default as TeamWidget } from './TeamWidget';
export { default as CandidatesWidget } from './CandidatesWidget';
export { default as QuestionsWidget } from './QuestionsWidget';
export { default as CalendarWidget } from './CalendarWidget';
export { default as NotificationsWidget } from './NotificationsWidget';
export { default as InterviewReportWidget } from './InterviewReportWidget';

// Типы для виджетов
export interface WidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

// Конфигурация виджетов
export const WIDGET_CONFIGS = {
  'vacancy-list': {
    title: 'Список вакансий',
    description: 'Управление вакансиями и просмотр интервью',
    minWidth: 800,
    minHeight: 1000,
    defaultWidth: 800,
    defaultHeight: 1000
  },
  'vacancyList': { // camelCase поддержка
    title: 'Список вакансий',
    description: 'Управление вакансиями и просмотр интервью',
    minWidth: 900,
    minHeight: 1000,
    defaultWidth: 900,
    defaultHeight: 1000
  },
  'dashboard': {
    title: 'Общий дашборд',
    description: 'Общая статистика и метрики',
    minWidth: 600,
    minHeight: 400,
    defaultWidth: 700,
    defaultHeight: 500
  },
  'reports': {
    title: 'Отчеты',
    description: 'Аналитика и отчеты по собеседованиям',
    minWidth: 500,
    minHeight: 350,
    defaultWidth: 600,
    defaultHeight: 450
  },
  'account': {
    title: 'Профиль пользователя',
    description: 'Информация о пользователе и настройки',
    minWidth: 350,
    minHeight: 250,
    defaultWidth: 400,
    defaultHeight: 300
  },
  'stats': {
    title: 'Статистика',
    description: 'Детальная статистика с графиками',
    minWidth: 500,
    minHeight: 350,
    defaultWidth: 600,
    defaultHeight: 450
  },
  'recent-interviews': {
    title: 'Последние интервью',
    description: 'Список последних интервью с фильтрацией',
    minWidth: 400,
    minHeight: 300,
    defaultWidth: 500,
    defaultHeight: 400
  },
  'interview-list': {
    title: 'Список интервью',
    description: 'Управление интервью и сессиями',
    minWidth: 600,
    minHeight: 400,
    defaultWidth: 700,
    defaultHeight: 500
  },
  'interviewList': { // camelCase поддержка
    title: 'Список интервью',
    description: 'Управление интервью и сессиями',
    minWidth: 600,
    minHeight: 400,
    defaultWidth: 700,
    defaultHeight: 500
  },
  'team': {
    title: 'Команда',
    description: 'Управление участниками команды',
    minWidth: 500,
    minHeight: 350,
    defaultWidth: 600,
    defaultHeight: 450
  },
  'candidates': {
    title: 'Кандидаты',
    description: 'Управление кандидатами и их статусами',
    minWidth: 500,
    minHeight: 350,
    defaultWidth: 600,
    defaultHeight: 450
  },
  'questions': {
    title: 'Вопросы интервью',
    description: 'Управление вопросами для интервью',
    minWidth: 500,
    minHeight: 350,
    defaultWidth: 600,
    defaultHeight: 450
  },
  'calendar': {
    title: 'Календарь интервью',
    description: 'Календарь интервью и событий',
    minWidth: 600,
    minHeight: 400,
    defaultWidth: 700,
    defaultHeight: 500
  },
  'notifications': {
    title: 'Уведомления',
    description: 'Системные уведомления и события',
    minWidth: 350,
    minHeight: 250,
    defaultWidth: 400,
    defaultHeight: 300
  },
  'interview-report': {
    title: 'Отчет по собеседованиям',
    description: 'Глобальный отчет по всем собеседованиям с аналитикой',
    minWidth: 1000,
    minHeight: 700,
    defaultWidth: 1200,
    defaultHeight: 800
  }
} as const;

export type WidgetType = keyof typeof WIDGET_CONFIGS;

// Default export для совместимости с EditorCanvas.tsx
const widgetTypes = {
  'vacancy-list': {
    component: VacancyListWidget,
    config: WIDGET_CONFIGS['vacancy-list']
  },
  'vacancyList': {
    component: VacancyListWidget,
    config: WIDGET_CONFIGS['vacancyList']
  },
  'dashboard': {
    component: DashboardWidget,
    config: WIDGET_CONFIGS['dashboard']
  },
  'reports': {
    component: ReportsWidget,
    config: WIDGET_CONFIGS['reports']
  },
  'account': {
    component: AccountWidget,
    config: WIDGET_CONFIGS['account']
  },
  'stats': {
    component: StatsWidget,
    config: WIDGET_CONFIGS['stats']
  },
  'recent-interviews': {
    component: RecentInterviewsWidget,
    config: WIDGET_CONFIGS['recent-interviews']
  },
  'interview-list': {
    component: InterviewListWidget,
    config: WIDGET_CONFIGS['interview-list']
  },
  'interviewList': {
    component: InterviewListWidget,
    config: WIDGET_CONFIGS['interviewList']
  },
  'team': {
    component: TeamWidget,
    config: WIDGET_CONFIGS['team']
  },
  'candidates': {
    component: CandidatesWidget,
    config: WIDGET_CONFIGS['candidates']
  },
  'questions': {
    component: QuestionsWidget,
    config: WIDGET_CONFIGS['questions']
  },
  'calendar': {
    component: CalendarWidget,
    config: WIDGET_CONFIGS['calendar']
  },
  'notifications': {
    component: NotificationsWidget,
    config: WIDGET_CONFIGS['notifications']
  },
  'interview-report': {
    component: InterviewReportWidget,
    config: WIDGET_CONFIGS['interview-report']
  }
};

export default widgetTypes; 