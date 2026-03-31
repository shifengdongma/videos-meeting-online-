import api from './client'
import type { MeetingItem } from './meetings'
import type { LiveItem } from './live'

export interface PlaybackItem {
  id: number
  title: string
  record_url: string
  start_time: string
  type: 'meeting' | 'live'
}

export const fetchMeetingPlaybacks = async () => {
  const { data } = await api.get<MeetingItem[]>('/meetings')
  return data.filter(item => item.record_url).map(item => ({
    id: item.id,
    title: item.title,
    record_url: item.record_url!,
    start_time: item.start_time,
    type: 'meeting' as const
  }))
}

export const fetchLivePlaybacks = async () => {
  const { data } = await api.get<LiveItem[]>('/live-streams')
  return data.filter(item => item.record_url).map(item => ({
    id: item.id,
    title: item.title,
    record_url: item.record_url!,
    start_time: item.start_time,
    type: 'live' as const
  }))
}

export const fetchAllPlaybacks = async () => {
  const meetings = await fetchMeetingPlaybacks()
  const lives = await fetchLivePlaybacks()
  return [...meetings, ...lives].sort((a, b) =>
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  )
}