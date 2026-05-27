export interface AppError {
  message: string
  code?: string
  details?: string
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public code: string = 'ANALYSIS_ERROR',
    public details?: string
  ) {
    super(message)
    this.name = 'AnalysisError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AnalysisError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateFileSize = (
  sizeInBytes: number,
  maxSizeInMB: number = 10
): boolean => {
  return sizeInBytes <= maxSizeInMB * 1024 * 1024
}

export const validateFileType = (
  fileName: string,
  allowedTypes: string[]
): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return allowedTypes.includes(extension || '')
}

export const sanitizeContent = (content: string, maxLength: number = 5000): string => {
  return content.trim().substring(0, maxLength)
}
