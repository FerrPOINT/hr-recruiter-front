// Безопасный маппер для enum'ов
// Обрабатывает случаи когда в базе данных есть значения, которых нет в enum'ах

import { 
  CandidateStatusEnum, 
  PositionStatusEnum, 
  InterviewStatusEnum, 
  InterviewResultEnum, 
  QuestionTypeEnum,
  RoleEnum
} from '../client/models';

// Удалить все, что связано с SourceEnum и маппингом поля source.

// Безопасный маппер для CandidateStatusEnum
export function mapCandidateStatusEnum(value: string | null | undefined): CandidateStatusEnum {
  if (!value) return CandidateStatusEnum.new;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'new':
      return CandidateStatusEnum.new;
    case 'in_progress':
      return CandidateStatusEnum.in_progress;
    case 'finished':
      return CandidateStatusEnum.finished;
    case 'rejected':
      return CandidateStatusEnum.rejected;
    case 'hired':
      return CandidateStatusEnum.hired;
    default:
      console.warn(`Unknown candidate status: "${value}", mapping to new`);
      return CandidateStatusEnum.new;
  }
}

// Безопасный маппер для PositionStatusEnum
export function mapPositionStatusEnum(value: string | null | undefined): PositionStatusEnum {
  if (!value) return PositionStatusEnum.active;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'active':
      return PositionStatusEnum.active;
    case 'paused':
      return PositionStatusEnum.paused;
    case 'archived':
      return PositionStatusEnum.archived;
    default:
      console.warn(`Unknown position status: "${value}", mapping to active`);
      return PositionStatusEnum.active;
  }
}

// Безопасный маппер для InterviewStatusEnum
export function mapInterviewStatusEnum(value: string | null | undefined): InterviewStatusEnum {
  if (!value) return InterviewStatusEnum.not_started;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'not_started':
      return InterviewStatusEnum.not_started;
    case 'in_progress':
      return InterviewStatusEnum.in_progress;
    case 'finished':
      return InterviewStatusEnum.finished;
    default:
      console.warn(`Unknown interview status: "${value}", mapping to not_started`);
      return InterviewStatusEnum.not_started;
  }
}

// Безопасный маппер для InterviewResultEnum
export function mapInterviewResultEnum(value: string | null | undefined): InterviewResultEnum | undefined {
  if (!value) return undefined;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'successful':
      return InterviewResultEnum.successful;
    case 'unsuccessful':
      return InterviewResultEnum.unsuccessful;
    case 'error':
      return InterviewResultEnum.error;
    default:
      console.warn(`Unknown interview result: "${value}", returning undefined`);
      return undefined;
  }
}

// Безопасный маппер для RoleEnum
export function mapRoleEnum(value: string | null | undefined): RoleEnum {
  if (!value) return RoleEnum.viewer;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'admin':
      return RoleEnum.admin;
    case 'recruiter':
      return RoleEnum.recruiter;
    case 'viewer':
      return RoleEnum.viewer;
    default:
      console.warn(`Unknown role: "${value}", mapping to viewer`);
      return RoleEnum.viewer;
  }
}

// Безопасный маппер для QuestionTypeEnum
export function mapQuestionTypeEnum(value: string | null | undefined): QuestionTypeEnum {
  if (!value) return QuestionTypeEnum.text;
  
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'text':
      return QuestionTypeEnum.text;
    case 'audio':
      return QuestionTypeEnum.audio;
    case 'video':
      return QuestionTypeEnum.video;
    case 'choice':
      return QuestionTypeEnum.choice;
    default:
      console.warn(`Unknown question type: "${value}", mapping to text`);
      return QuestionTypeEnum.text;
  }
}

// Универсальный маппер для всех enum'ов
export function safeMapEnum<T extends string>(
  value: string | null | undefined, 
  enumType: Record<string, T>, 
  defaultValue: T,
  enumName: string
): T {
  if (!value) return defaultValue;
  
  // Проверяем, есть ли значение в enum
  const enumValues = Object.values(enumType);
  if (enumValues.includes(value as T)) {
    return value as T;
  }
  
  // Если нет, логируем и возвращаем дефолт
  console.warn(`Unknown ${enumName} value: "${value}", using default: "${defaultValue}"`);
  return defaultValue;
} 