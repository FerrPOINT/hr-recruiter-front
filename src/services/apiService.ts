import { apiClient, type ApiClient } from '../client/apiClient';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  mapCandidateStatusEnum,
  mapPositionStatusEnum,
  mapInterviewStatusEnum,
  mapInterviewResultEnum,
  mapRoleEnum,
  mapQuestionTypeEnum
} from '../utils/enumMapper';
import { 
  Position, 
  PositionCreateRequest, 
  PositionUpdateRequest,
  Candidate,
  CandidateCreateRequest,
  CandidateUpdateRequest,
  Interview,
  InterviewAnswerCreateRequest,
  Question,
  QuestionCreateRequest,
  User,
  Branding,
  BrandingUpdateRequest,
  LoginRequest,
  AuthResponse,
  PositionStatusEnum,
  GetPositionPublicLink200Response,
  TranscribeAudio200Response,
  TranscribeAnswerWithAI200Response,
  BaseQuestionFields,
  PositionDataGenerationRequest,
  PositionDataGenerationResponse,
  PositionAiGenerationRequest,
  PositionAiGenerationResponse,
  PaginatedResponse,
  VoiceMessage,
  VoiceSessionResponse,
  VoiceSessionStatus,
  InterviewAnswer
} from '../client/models';
import type { ListPositionsOwnerEnum } from '../client/apis/positions-api';

// Type definitions for paginated responses
interface PositionsPaginatedResponse extends PaginatedResponse {
  content: Position[];
}

interface InterviewsPaginatedResponse extends PaginatedResponse {
  content: Interview[];
}

interface UsersPaginatedResponse extends PaginatedResponse {
  content: User[];
}

class ApiService {
  private lastToken: string | null = null;

  // Get API client with current token
  getApiClient(): ApiClient {
    const currentToken = useAuthStore.getState().token;
    this.lastToken = currentToken;
    return apiClient;
  }

  // === AUTHENTICATION ===
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginRequest: LoginRequest = { email, password };
    // For login, we don't need token yet, so we can use the global client
    const response = await apiClient.auth.login(loginRequest);
    return response.data;
  }

  // Force refresh API client (useful after login/logout)
  refreshApiClient() {
    console.log('🔍 refreshApiClient - No longer needed, using global apiClient');
    // The global apiClient automatically gets the current token from the store
  }

  async logout(): Promise<void> {
    await apiClient.auth.logout();
  }

  // === ACCOUNT ===
  async getAccount(): Promise<User> {
    const response = await apiClient.account.getAccount();
    return response.data;
  }

  async updateAccount(userData: any): Promise<User> {
    const response = await apiClient.account.updateAccount(userData);
    return response.data;
  }

  // === POSITIONS ===
  async getPositions(params?: { 
    status?: PositionStatusEnum; 
    search?: string; 
    page?: number; 
    size?: number;
    owner?: ListPositionsOwnerEnum;
  }): Promise<{ items: Position[]; total: number }> {
    try {
      const response = await apiClient.positions.listPositions(
        params?.status,
        params?.owner,
        params?.search,
        params?.page,
        params?.size
      );
      
      const data = response.data as PositionsPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format with content, totalElements, etc.
      if (data.content && Array.isArray(data.content)) {
        // Безопасно маппим enum'ы для каждой позиции
        const items = data.content.map(position => ({
          ...position,
          status: mapPositionStatusEnum(position.status)
        }));
        
        return {
          items: items || [],
          total: data.totalElements || 0
        };
      } else {
        // Fallback for unexpected format
        console.error('Unexpected response format:', data);
        return {
          items: [],
          total: 0
        };
      }
    } catch (error: any) {
      console.error('getPositions error:', error);
      
      // If 400 error, try without status parameter
      if (error.response?.status === 400 && params?.status) {
        try {
          const retryResponse = await apiClient.positions.listPositions(
            undefined, // remove status
            params?.owner,
            params?.search,
            params?.page,
            params?.size
          );
          
          const retryData = retryResponse.data as PositionsPaginatedResponse;
          
          if (retryData.content && Array.isArray(retryData.content)) {
            // Безопасно маппим enum'ы для каждой позиции
            const items = retryData.content.map(position => ({
              ...position,
              status: mapPositionStatusEnum(position.status)
            }));
            
            return {
              items: items || [],
              total: retryData.totalElements || 0
            };
          } else {
            return {
              items: [],
              total: 0
            };
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  async getPosition(id: number): Promise<Position> {
    const response = await apiClient.positions.getPosition(id);
    return response.data;
  }

  async createPosition(positionData: PositionCreateRequest): Promise<Position> {
    console.log('🔍 createPosition - Starting with token:', useAuthStore.getState().token ? 'present' : 'missing');
    try {
      const response = await apiClient.positions.createPosition(positionData);
      console.log('🔍 createPosition - Success');
      return response.data;
    } catch (error: any) {
      console.error('🔍 createPosition - Error:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async updatePosition(id: number, positionData: PositionUpdateRequest): Promise<Position> {
    const response = await apiClient.positions.updatePosition(id, positionData);
    return response.data;
  }

  async getPositionStats(id: number): Promise<any> {
    const response = await apiClient.positions.getPositionStats(id);
    return response.data;
  }

  async getPositionPublicLink(id: number): Promise<{ publicLink: string }> {
    const response = await apiClient.positions.getPositionPublicLink(id);
    const data = response.data as GetPositionPublicLink200Response;
    return {
      publicLink: data.publicLink || ''
    };
  }

  // === CANDIDATES ===
  async getCandidates(positionId: number): Promise<Candidate[]> {
    try {
      const response = await apiClient.candidates.listPositionCandidates(positionId);
      const data = response.data as any;
      
      // OpenAPI spec defines Spring Boot Page format
      let candidates: any[] = [];
      if (data.content && Array.isArray(data.content)) {
        candidates = data.content;
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        candidates = data;
      } else {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      // Безопасно маппим enum'ы для каждого кандидата
      return candidates.map(candidate => ({
        ...candidate,
        status: mapCandidateStatusEnum(candidate.status)
      }));
    } catch (error: any) {
      console.error('getCandidates error:', error);
      
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  async getCandidate(id: number): Promise<Candidate> {
    const response = await apiClient.candidates.getCandidate(id);
    return response.data;
  }

  async createCandidate(positionId: number, candidateData: CandidateCreateRequest): Promise<Candidate> {
    // Удаляем поле source, если оно пустое или не задано
    const { source, ...rest } = candidateData as any;
    const dataToSend = (source === undefined || source === null || source === '') ? rest : { ...rest, source };
    const response = await apiClient.candidates.createPositionCandidate(positionId, dataToSend);
    return response.data;
  }

  async updateCandidate(id: number, candidateData: CandidateUpdateRequest): Promise<Candidate> {
    const response = await apiClient.candidates.updateCandidate(id, candidateData);
    return response.data;
  }

  async deleteCandidate(id: number): Promise<void> {
    await apiClient.candidates.deleteCandidate(id);
  }

  // === INTERVIEWS ===
  async getInterviews(params?: { 
    positionId?: number;
    candidateId?: number;
    page?: number; 
    size?: number 
  }): Promise<{ items: Interview[]; total: number }> {
    try {
      const response = await apiClient.interviews.listInterviews(
        params?.positionId,
        params?.candidateId,
        params?.page,
        params?.size
      );
      
      const data = response.data as InterviewsPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format
      if (data.content && Array.isArray(data.content)) {
        // Безопасно маппим enum'ы для каждого интервью
        const items = data.content.map(interview => ({
          ...interview,
          status: mapInterviewStatusEnum(interview.status),
          result: interview.result ? mapInterviewResultEnum(interview.result) : undefined
        }));
        
        return {
          items: items || [],
          total: data.totalElements || 0
        };
      } else {
        console.error('Unexpected response format:', data);
        return {
          items: [],
          total: 0
        };
      }
    } catch (error: any) {
      console.error('getInterviews error:', error);
      
      // If 400 error, try without optional parameters
      if (error.response?.status === 400) {
        try {
          const retryResponse = await this.getApiClient().interviews.listInterviews(
            undefined, // remove positionId
            undefined, // remove candidateId
            params?.page,
            params?.size
          );
          
          const retryData = retryResponse.data as InterviewsPaginatedResponse;
          
          if (retryData.content && Array.isArray(retryData.content)) {
            // Безопасно маппим enum'ы для каждого интервью
            const items = retryData.content.map(interview => ({
              ...interview,
              status: mapInterviewStatusEnum(interview.status),
              result: interview.result ? mapInterviewResultEnum(interview.result) : undefined
            }));
            
            return {
              items: items || [],
              total: retryData.totalElements || 0
            };
          } else {
            return {
              items: [],
              total: 0
            };
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  async getInterview(id: number): Promise<any> {
    const response = await this.getApiClient().interviews.getInterview(id);
    return response.data;
  }

  async startInterview(candidateId: number): Promise<Interview> {
    const response = await this.getApiClient().interviews.createInterviewFromCandidate(candidateId);
    return response.data;
  }

  async finishInterview(interviewId: number): Promise<Interview> {
    // Завершаем интервью, устанавливая статус finished и дату завершения
    const response = await this.getApiClient().interviews.finishInterview(interviewId);
    return response.data;
  }

  async submitInterviewAnswer(interviewId: number, answerData: InterviewAnswerCreateRequest): Promise<Interview> {
    const response = await this.getApiClient().interviews.submitInterviewAnswer(interviewId, answerData);
    return response.data;
  }

  async getPositionInterviews(positionId: number): Promise<Interview[]> {
    const response = await this.getApiClient().interviews.listPositionInterviews(positionId);
    return response.data;
  }

  // === QUESTIONS ===
  async getQuestions(positionId: number): Promise<{ questions: Question[]; interviewSettings: { answerTime?: number; language?: string; saveAudio?: boolean; saveVideo?: boolean; randomOrder?: boolean; minScore?: number } }> {
    try {
      // Используем правильный эндпоинт для получения вопросов с настройками
      const response = await this.getApiClient().questions.getPositionQuestionsWithSettings(positionId);
      const data = response.data;
      
      // Проверяем структуру ответа
      if (data.questions && Array.isArray(data.questions)) {
        // Безопасно маппим enum'ы для каждого вопроса
        const questions = data.questions.map((question: any) => ({
          ...question,
          type: mapQuestionTypeEnum(question.type)
        }));
        
        return {
          questions: questions || [],
          interviewSettings: {
            ...data.interviewSettings,
            minScore: (data.interviewSettings as any)?.minScore || 0
          }
        };
      } else {
        console.error('Unexpected response format for questions:', data);
        return {
          questions: [],
          interviewSettings: {
            minScore: 0
          }
        };
      }
    } catch (error: any) {
      console.error('getQuestions error:', error);
      
      // Fallback: попробуем старый эндпоинт
      try {
        console.log('Trying fallback endpoint...');
        const fallbackResponse = await this.getApiClient().questions.listPositionQuestions(positionId);
        const fallbackData = fallbackResponse.data;
        
        // Старый эндпоинт возвращает PaginatedResponse
        if (fallbackData.content && Array.isArray(fallbackData.content)) {
          console.log('Using fallback endpoint with content array');
          // Безопасно маппим enum'ы для каждого вопроса
          const questions = fallbackData.content.map((question: any) => ({
            ...question,
            type: mapQuestionTypeEnum(question.type)
          }));
          
          return {
            questions: questions || [],
            interviewSettings: {
              minScore: 0
            }
          };
        } else {
          console.error('Fallback endpoint also failed with unexpected format:', fallbackData);
          return {
            questions: [],
            interviewSettings: {
              minScore: 0
            }
          };
        }
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError);
        return {
          questions: [],
          interviewSettings: {
            minScore: 0
          }
        };
      }
    }
  }

  async createQuestion(positionId: number, questionData: QuestionCreateRequest): Promise<Question> {
    console.log('🔍 createQuestion - Starting with token:', useAuthStore.getState().token ? 'present' : 'missing');
    console.log('🔍 createQuestion - Position ID:', positionId);
    
    // Get the API client and log its configuration
    const apiClient = this.getApiClient();
    console.log('🔍 createQuestion - API client obtained, lastToken:', this.lastToken ? `${this.lastToken.substring(0, 20)}...` : 'null');
    
    try {
      const response = await apiClient.questions.createPositionQuestion(positionId, questionData);
      console.log('🔍 createQuestion - Success');
      return response.data;
    } catch (error: any) {
      console.error('🔍 createQuestion - Error:', error.response?.status, error.response?.data);
      console.error('🔍 createQuestion - Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  async updateQuestion(id: number, questionData: BaseQuestionFields): Promise<Question> {
    const response = await this.getApiClient().questions.updateQuestion(id, questionData);
    return response.data;
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.getApiClient().questions.deleteQuestion(id);
  }

  // === TEAM & USERS ===
  async getUsers(): Promise<User[]> {
    try {
      const response = await this.getApiClient().teamUsers.listUsers();
      const data = response.data as UsersPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format
      let users: any[] = [];
      if (data.content && Array.isArray(data.content)) {
        users = data.content;
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        users = data;
      } else {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      // Безопасно маппим enum'ы для каждого пользователя
      return users.map(user => ({
        ...user,
        role: mapRoleEnum(user.role)
      }));
    } catch (error: any) {
      console.error('getUsers error:', error);
      
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  async createUser(userData: any): Promise<User> {
    const response = await this.getApiClient().teamUsers.createUser(userData);
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.getApiClient().teamUsers.getUser(id);
    return response.data;
  }

  async updateUser(id: number, userData: any): Promise<User> {
    const response = await this.getApiClient().teamUsers.updateUser(id, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.getApiClient().teamUsers.deleteUser(id);
  }

  async getTeam(): Promise<User[]> {
    const response = await this.getApiClient().teamUsers.getTeam();
    return response.data;
  }

  // === SETTINGS ===
  async getBranding(): Promise<Branding> {
    const response = await this.getApiClient().settings.getBranding();
    return response.data;
  }

  async updateBranding(brandingData: BrandingUpdateRequest): Promise<Branding> {
    const response = await this.getApiClient().settings.updateBranding(brandingData);
    return response.data;
  }

  async getTariffs(): Promise<any[]> {
    const response = await this.getApiClient().settings.listTariffs();
    return response.data;
  }

  async getTariffInfo(): Promise<any> {
    const response = await this.getApiClient().settings.getTariffInfo();
    return response.data;
  }

  // === ANALYTICS & REPORTS ===
  async getStats(): Promise<any> {
    const response = await this.getApiClient().analyticsReports.getPositionsStats();
    return response.data;
  }

  async getReports(): Promise<any[]> {
    const response = await this.getApiClient().analyticsReports.getReports();
    return response.data;
  }

  async getMonthlyReport(year: number, month: number): Promise<any> {
    const response = await this.getApiClient().analyticsReports.getReports();
    return response.data;
  }

  // === AI ===
  async generatePosition(description: string, questionsCount?: number, questionType?: string): Promise<PositionAiGenerationResponse> {
    console.log('🔍 generatePosition - Starting with token:', useAuthStore.getState().token ? 'present' : 'missing');
    console.log('generatePosition called with:', { description, questionsCount, questionType });
    
    const request: PositionAiGenerationRequest = { 
      description,
      questionsCount,
      questionType
    };
    
    try {
      const response = await this.getApiClient().ai.generatePosition(request);
      console.log('🔍 generatePosition - Success');
      console.log('generatePosition response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔍 generatePosition - Error:', error.response?.status, error.response?.data);
      console.error('generatePosition error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  }

  async generatePositionData(description: string, existingData?: any): Promise<PositionDataGenerationResponse> {
    console.log('generatePositionData called with:', { description, existingData });
    
    const request: PositionDataGenerationRequest = { 
      description,
      existingData
    };
    
    try {
      const response = await this.getApiClient().ai.generatePositionData(request);
      console.log('generatePositionData response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('generatePositionData error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  }

  async transcribeAudio(audioFile: File): Promise<{ transcript: string }> {
    console.log('=== TRANSCRIBE AUDIO SERVICE START ===');
    console.log('Audio file details:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      lastModified: audioFile.lastModified
    });
    
    // Проверяем размер файла
    if (audioFile.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    if (audioFile.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Audio file is too large (max 50MB)');
    }
    
    try {
      console.log('Calling ai.transcribeAudio...');
      
      // Создаем FormData для проверки
      const formData = new FormData();
      formData.append('audio', audioFile);
      console.log('FormData created with audio file');
      console.log('FormData entries:');
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      });
      
      const response = await this.getApiClient().ai.transcribeAudio(audioFile);
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      const data = response.data as TranscribeAudio200Response;
      console.log('Parsed data:', data);
      console.log('Data transcript:', data.transcript);
      
      console.log('=== TRANSCRIBE AUDIO SERVICE END ===');
      
      return {
        transcript: data.transcript || 'Текст не распознан'
      };
    } catch (error: any) {
      console.error('=== TRANSCRIBE AUDIO SERVICE ERROR ===');
      console.error('Error details:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  }

  async transcribeInterviewAnswer(audioFile: File, interviewId: number, questionId: number): Promise<{ success: boolean; formattedText: string; interviewAnswerId: string }> {
    console.log('=== TRANSCRIBE INTERVIEW ANSWER SERVICE START ===');
    console.log('Audio file details:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      lastModified: audioFile.lastModified
    });
    console.log('Interview ID:', interviewId, 'Question ID:', questionId);
    
    // Проверяем размер файла
    if (audioFile.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    if (audioFile.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Audio file is too large (max 50MB)');
    }
    
    try {
      console.log('Calling ai.transcribeAnswerWithAI...');
      
      // Создаем FormData для проверки
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      formData.append('interviewId', interviewId.toString());
      formData.append('questionId', questionId.toString());
      console.log('FormData created with audio file and IDs');
      console.log('FormData entries:');
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      });
      
      const response = await this.getApiClient().ai.transcribeAnswerWithAI(audioFile, interviewId, questionId);
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      const data = response.data as TranscribeAnswerWithAI200Response;
      console.log('Parsed data:', data);
      console.log('Data success:', data.success);
      console.log('Data formattedText:', data.formattedText);
      console.log('Data interviewAnswerId:', data.interviewAnswerId);
      
      console.log('=== TRANSCRIBE INTERVIEW ANSWER SERVICE END ===');
      
      return {
        success: data.success || false,
        formattedText: data.formattedText || 'Текст не распознан',
        interviewAnswerId: String(data.interviewAnswerId || '')
      };
    } catch (error: any) {
      console.error('=== TRANSCRIBE INTERVIEW ANSWER SERVICE ERROR ===');
      console.error('Error details:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  }

  // === VOICE INTERVIEWS ===
  async createVoiceSession(interviewId: number, options?: any): Promise<VoiceSessionResponse> {
    const response = await this.getApiClient().voiceInterviews.createVoiceSession(interviewId, options);
    return response.data;
  }

  async endVoiceSession(interviewId: number): Promise<void> {
    await this.getApiClient().voiceInterviews.endVoiceSession(interviewId);
  }

  async getNextQuestion(interviewId: number): Promise<VoiceMessage> {
    const response = await this.getApiClient().voiceInterviews.getNextQuestion(interviewId);
    return response.data;
  }

  async getVoiceSessionStatus(interviewId: number): Promise<VoiceSessionStatus> {
    const response = await this.getApiClient().voiceInterviews.getVoiceSessionStatus(interviewId);
    return response.data;
  }

  async saveVoiceAnswer(interviewId: number, questionId: number, voiceMessage: VoiceMessage): Promise<InterviewAnswer> {
    const response = await this.getApiClient().voiceInterviews.saveVoiceAnswer(interviewId, questionId, voiceMessage);
    return response.data;
  }

  // === MISSING ENDPOINTS ===
  
  // Positions
  async partialUpdatePosition(id: number, status: PositionStatusEnum): Promise<Position> {
    const response = await this.getApiClient().positions.partialUpdatePosition(id, { status });
    return response.data;
  }

  // Questions
  async getPositionQuestionsWithSettings(positionId: number): Promise<any> {
    const response = await this.getApiClient().questions.getPositionQuestionsWithSettings(positionId);
    return response.data;
  }

  // Account
  async getUserInfo(): Promise<any> {
    const response = await this.getApiClient().account.getUserInfo();
    return response.data;
  }

  // Analytics & Reports
  async getInterviewsStats(): Promise<any> {
    const response = await this.getApiClient().analyticsReports.getInterviewsStats();
    return response.data;
  }

  // Settings
  async createTariff(tariffData: any): Promise<any> {
    const response = await this.getApiClient().settings.createTariff(tariffData);
    return response.data;
  }

  async updateTariff(id: number, tariffData: any): Promise<any> {
    const response = await this.getApiClient().settings.updateTariff(id, tariffData);
    return response.data;
  }

  // Candidates
  async authCandidate(authData: any): Promise<any> {
    const response = await this.getApiClient().candidates.authCandidate(authData);
    return response.data;
  }

  // === GENERIC HTTP METHODS ===
  async get(url: string, config?: any): Promise<any> {
    const response = await axios.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    const response = await axios.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    const token = useAuthStore.getState().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.put(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers }
    });
    return response;
  }

  async delete(url: string, config?: any): Promise<any> {
    const token = useAuthStore.getState().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.delete(url, {
      ...config,
      headers: { ...headers, ...config?.headers }
    });
    return response;
  }

  // === UTILITY METHODS ===
  getInterviewStatusMap() {
    return {
      'in_progress': 'В процессе',
      'finished': 'Завершено',
      'cancelled': 'Отменено'
    };
  }

  getIconMap() {
    return {
      'in_progress': '🔄',
      'finished': '✅',
      'cancelled': '❌',
      'hired': '🎉',
      'rejected': '👎'
    };
  }
}

// Экспортируем единственный экземпляр сервиса
export const apiService = new ApiService(); 