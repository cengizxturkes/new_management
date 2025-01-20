export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data?: T;
  length?: number;
  error?: any;
  timestamp: string;
}

export class ApiResponseBuilder<T> {
  private response: ApiResponse<T>;

  constructor() {
    this.response = {
      isSuccess: true,
      message: '',
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  success(isSuccess: boolean): ApiResponseBuilder<T> {
    this.response.isSuccess = isSuccess;
    return this;
  }

  withMessage(message: string): ApiResponseBuilder<T> {
    this.response.message = message;
    return this;
  }

  withStatusCode(statusCode: number): ApiResponseBuilder<T> {
    this.response.statusCode = statusCode;
    return this;
  }

  withData(data: T): ApiResponseBuilder<T> {
    this.response.data = data;
    if (Array.isArray(data)) {
      this.response.length = data.length;
    }
    return this;
  }

  withError(error: any): ApiResponseBuilder<T> {
    this.response.error = error;
    this.response.isSuccess = false;
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
} 