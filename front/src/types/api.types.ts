/** 백엔드 공통 에러 응답 형식 (back/internal/handler 와 맞춘다) */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
