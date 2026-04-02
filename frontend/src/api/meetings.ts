import api from './client'

export interface MeetingItem {
  id: number
  title: string
  address: string | null
  start_time: string
  end_time: string
  earliest_entry_time: string | null
  is_published: boolean
  host_id: number
  status: 'scheduled' | 'ongoing' | 'ended'
  record_url: string | null
  created_at: string
}

export interface MeetingParticipant {
  id: number
  meeting_id: number
  name: string
  phone: string | null
  department: string | null
  user_id: number | null
  created_at: string
}

export interface MeetingModule {
  id: number
  meeting_id: number
  module_name: string
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface MeetingDetail extends MeetingItem {
  participants: MeetingParticipant[]
  modules: MeetingModule[]
}

export interface MeetingCreatePayload {
  title: string
  address?: string | null
  start_time: string
  end_time: string
  earliest_entry_time?: string | null
  record_url?: string | null
}

export interface MeetingUpdatePayload {
  title?: string
  address?: string | null
  start_time?: string
  end_time?: string
  earliest_entry_time?: string | null
  status?: 'scheduled' | 'ongoing' | 'ended'
  record_url?: string | null
}

export interface MeetingModuleUpdatePayload {
  id?: number
  module_name?: string
  icon?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface MeetingParticipantCreatePayload {
  name: string
  phone?: string | null
  department?: string | null
  user_id?: number | null
}

export const fetchMeetings = async (params?: { id?: number; title?: string; is_published?: boolean }) => {
  const { data } = await api.get<MeetingItem[]>('/meetings', { params })
  return data
}

export const fetchMeetingDetail = async (meetingId: number) => {
  const { data } = await api.get<MeetingDetail>(`/meetings/${meetingId}`)
  return data
}

export const createMeeting = async (payload: MeetingCreatePayload) => {
  const { data } = await api.post<MeetingItem>('/meetings', payload)
  return data
}

export const updateMeeting = async (meetingId: number, payload: MeetingUpdatePayload) => {
  const { data } = await api.put<MeetingItem>(`/meetings/${meetingId}`, payload)
  return data
}

export const publishMeeting = async (meetingId: number, isPublished: boolean) => {
  const { data } = await api.put<MeetingItem>(`/meetings/${meetingId}/publish`, { is_published: isPublished })
  return data
}

export const deleteMeeting = async (meetingId: number) => {
  await api.delete(`/meetings/${meetingId}`)
}

// === 参会人员管理 ===

export const fetchParticipants = async (meetingId: number) => {
  const { data } = await api.get<MeetingParticipant[]>(`/meetings/${meetingId}/participants`)
  return data
}

export const createParticipant = async (meetingId: number, payload: MeetingParticipantCreatePayload) => {
  const { data } = await api.post<MeetingParticipant>(`/meetings/${meetingId}/participants`, payload)
  return data
}

export const batchCreateParticipants = async (meetingId: number, participants: MeetingParticipantCreatePayload[]) => {
  const { data } = await api.post<MeetingParticipant[]>(`/meetings/${meetingId}/participants/batch`, { participants })
  return data
}

export const importParticipants = async (meetingId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<MeetingParticipant[]>(`/meetings/${meetingId}/participants/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export const deleteParticipant = async (meetingId: number, participantId: number) => {
  await api.delete(`/meetings/${meetingId}/participants/${participantId}`)
}

export const fetchParticipantTemplate = async (meetingId: number) => {
  const { data } = await api.get<{ columns: string[]; example: Record<string, string>[]; tips: string[] }>(
    `/meetings/${meetingId}/participants/template`
  )
  return data
}

// === 会议模块管理 ===

export const fetchModules = async (meetingId: number) => {
  const { data } = await api.get<MeetingModule[]>(`/meetings/${meetingId}/modules`)
  return data
}

export const updateModule = async (meetingId: number, moduleId: number, payload: MeetingModuleUpdatePayload) => {
  const { data } = await api.put<MeetingModule>(`/meetings/${meetingId}/modules/${moduleId}`, payload)
  return data
}

export const batchUpdateModules = async (meetingId: number, modules: MeetingModuleUpdatePayload[]) => {
  const { data } = await api.put<MeetingModule[]>(`/meetings/${meetingId}/modules/batch`, { modules })
  return data
}