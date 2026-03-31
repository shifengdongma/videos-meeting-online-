import api from './client'

export interface LiveItem {
  id: number
  title: string
  host_id: number
  start_time: string
  room_code: string
  record_url?: string | null
  parent_id?: number | null
}

export const fetchLiveStreams = async () => {
  const { data } = await api.get<LiveItem[]>('/live-streams')
  return data
}

export const fetchLiveStream = async (id: number) => {
  const { data } = await api.get<LiveItem>(`/live-streams/${id}`)
  return data
}

export const createLiveStream = async (payload: { title: string; record_url?: string | null; parent_id?: number | null }) => {
  const { data } = await api.post<LiveItem>('/live-streams', payload)
  return data
}

export const fetchSubVenues = async (streamId: number) => {
  const { data } = await api.get<LiveItem[]>(`/live-streams/${streamId}/sub-venues`)
  return data
}
