import { createApiClient } from '../client/apiClient';
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
  PaginatedResponse
} from '../client/models';

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
  private getApiClient() {
    // Получаем учетные данные из sessionStorage
    const username = sessionStorage.getItem('auth_username') || undefined;
    const password = sessionStorage.getItem('auth_password') || undefined;
    // Не передаём basePath, используем дефолт из apiClient
    return createApiClient(username, password);
  }

  // === AUTHENTICATION ===
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginRequest: LoginRequest = { email, password };
    const apiClient = createApiClient(email, password);
    const response = await apiClient.auth.login(loginRequest);
    return response.data;
  }

  async logout(): Promise<void> {
    const apiClient = this.getApiClient();
    await apiClient.auth.logout();
  }

  // === ACCOUNT ===
  async getAccount(): Promise<User> {
    const response = await this.getApiClient().account.getAccount();
    return response.data;
  }

  async updateAccount(userData: any): Promise<User> {
    const response = await this.getApiClient().account.updateAccount(userData);
    return response.data;
  }

  // === POSITIONS ===
  async getPositions(params?: { 
    status?: PositionStatusEnum; 
    search?: string; 
    page?: number; 
    size?: number 
  }): Promise<{ items: Position[]; total: number }> {
    console.log('getPositions called with params:', params);
    
    try {
      const response = await this.getApiClient().positions.listPositions(
        params?.status,
        params?.search,
        params?.page,
        params?.size
      );
      
      console.log('getPositions response:', response);
      const data = response.data as PositionsPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format with content, totalElements, etc.
      if (data.content && Array.isArray(data.content)) {
        console.log('Using OpenAPI spec format with content array');
        return {
          items: data.content || [],
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
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // If 400 error, try without status parameter
      if (error.response?.status === 400 && params?.status) {
        console.log('Retrying without status parameter...');
        try {
          const retryResponse = await this.getApiClient().positions.listPositions(
            undefined, // remove status
            params?.search,
            params?.page,
            params?.size
          );
          
          const retryData = retryResponse.data as PositionsPaginatedResponse;
          
          if (retryData.content && Array.isArray(retryData.content)) {
            return {
              items: retryData.content || [],
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
    const response = await this.getApiClient().positions.getPosition(id);
    return response.data;
  }

  async createPosition(positionData: PositionCreateRequest): Promise<Position> {
    console.log('Creating position with data:', positionData);
    console.log('Answer time being sent:', positionData.answerTime);
    const response = await this.getApiClient().positions.createPosition(positionData);
    console.log('Position created:', response.data);
    return response.data;
  }

  async updatePosition(id: number, positionData: PositionUpdateRequest): Promise<Position> {
    const response = await this.getApiClient().positions.updatePosition(id, positionData);
    return response.data;
  }

  async getPositionStats(id: number): Promise<any> {
    const response = await this.getApiClient().positions.getPositionStats(id);
    return response.data;
  }

  async getPositionPublicLink(id: number): Promise<{ publicLink: string }> {
    const response = await this.getApiClient().positions.getPositionPublicLink(id);
    const data = response.data as GetPositionPublicLink200Response;
    return {
      publicLink: data.publicLink || ''
    };
  }

  // === CANDIDATES ===
  async getCandidates(positionId: number): Promise<Candidate[]> {
    console.log('getCandidates called with positionId:', positionId);
    
    try {
      const response = await this.getApiClient().candidates.listPositionCandidates(positionId);
      console.log('getCandidates response:', response);
      const data = response.data as any;
      
      // OpenAPI spec defines Spring Boot Page format
      if (data.content && Array.isArray(data.content)) {
        console.log('Using OpenAPI spec format with content array');
        return data.content;
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        console.log('Using direct array format');
        return data;
      } else {
        console.error('Unexpected response format:', data);
        return [];
      }
    } catch (error: any) {
      console.error('getCandidates error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  async getCandidate(id: number): Promise<Candidate> {
    const response = await this.getApiClient().candidates.getCandidate(id);
    return response.data;
  }

  async createCandidate(positionId: number, candidateData: CandidateCreateRequest): Promise<Candidate> {
    const response = await this.getApiClient().candidates.createPositionCandidate(positionId, candidateData);
    return response.data;
  }

  async updateCandidate(id: number, candidateData: CandidateUpdateRequest): Promise<Candidate> {
    const response = await this.getApiClient().candidates.updateCandidate(id, candidateData);
    return response.data;
  }

  async deleteCandidate(id: number): Promise<void> {
    await this.getApiClient().candidates.deleteCandidate(id);
  }

  // === INTERVIEWS ===
  async getInterviews(params?: { 
    positionId?: number;
    candidateId?: number;
    page?: number; 
    size?: number 
  }): Promise<{ items: Interview[]; total: number }> {
    console.log('getInterviews called with params:', params);
    
    try {
      const response = await this.getApiClient().interviews.listInterviews(
        params?.positionId,
        params?.candidateId,
        params?.page,
        params?.size
      );
      
      console.log('getInterviews response:', response);
      const data = response.data as InterviewsPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format
      if (data.content && Array.isArray(data.content)) {
        console.log('Using OpenAPI spec format with content array');
        return {
          items: data.content || [],
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
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // If 400 error, try without optional parameters
      if (error.response?.status === 400) {
        console.log('Retrying without optional parameters...');
        try {
          const retryResponse = await this.getApiClient().interviews.listInterviews(
            undefined,
            undefined,
            params?.page,
            params?.size
          );
          
          const retryData = retryResponse.data as InterviewsPaginatedResponse;
          
          if (retryData.content && Array.isArray(retryData.content)) {
            return {
              items: retryData.content || [],
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
    console.log('getQuestions called with positionId:', positionId);
    
    try {
      // Используем правильный эндпоинт для получения вопросов с настройками
      const response = await this.getApiClient().questions.getPositionQuestionsWithSettings(positionId);
      console.log('getQuestions response:', response);
      const data = response.data;
      
      // Проверяем структуру ответа
      if (data.questions && Array.isArray(data.questions)) {
        console.log('Questions found:', data.questions.length);
        return {
          questions: data.questions || [],
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
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Fallback: попробуем старый эндпоинт
      try {
        console.log('Trying fallback endpoint...');
        const fallbackResponse = await this.getApiClient().questions.listPositionQuestions(positionId);
        const fallbackData = fallbackResponse.data;
        
        // Старый эндпоинт возвращает PaginatedResponse
        if (fallbackData.content && Array.isArray(fallbackData.content)) {
          console.log('Using fallback endpoint with content array');
          return {
            questions: fallbackData.content || [],
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
    const response = await this.getApiClient().questions.createPositionQuestion(positionId, questionData);
    return response.data;
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
    console.log('getUsers called');
    
    try {
      const response = await this.getApiClient().teamUsers.listUsers();
      console.log('getUsers response:', response);
      const data = response.data as UsersPaginatedResponse;
      
      // OpenAPI spec defines Spring Boot Page format
      if (data.content && Array.isArray(data.content)) {
        console.log('Using OpenAPI spec format with content array');
        return data.content;
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        console.log('Using direct array format');
        return data;
      } else {
        console.error('Unexpected response format:', data);
        return [];
      }
    } catch (error: any) {
      console.error('getUsers error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
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
    console.log('generatePosition called with:', { description, questionsCount, questionType });
    
    const request: PositionAiGenerationRequest = { 
      description,
      questionsCount,
      questionType
    };
    
    try {
      const response = await this.getApiClient().ai.generatePosition(request);
      console.log('generatePosition response:', response.data);
      return response.data;
    } catch (error: any) {
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

  // === DEFAULT API ===
  async getChecklist(): Promise<any[]> {
    const response = await this.getApiClient().interviews.getChecklist();
    return response.data;
  }

  async getInviteInfo(): Promise<any> {
    const response = await this.getApiClient().interviews.getInviteInfo();
    return response.data;
  }

  async getLearnMaterials(): Promise<any[]> {
    const response = await this.getApiClient().default.learnGet();
    return response.data;
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