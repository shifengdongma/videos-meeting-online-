import api from './client'

export interface UploadResult {
  url: string
  filename: string
  stored_filename: string
  size: number
  type: 'image' | 'file'
  content_type: string
}

export const uploadFile = async (file: File): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<UploadResult>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}