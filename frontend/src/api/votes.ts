import api from './client'

export interface VoteOption {
  id: number
  content: string
}

export interface VoteResultOption {
  id: number
  content: string
  count: number
  ratio: number
}

export interface VoteItem {
  id: number
  meeting_id: number
  topic: string
  description: string | null
  start_time: string | null
  end_time: string | null
  max_votes: number
  remarks: string | null
  created_at: string
  status: 'voting' | 'ended'
  options: VoteOption[]
  submitted: boolean
  results: VoteResultOption[]
}

export interface VoteCreatePayload {
  meeting_id: number
  topic: string
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  max_votes?: number
  remarks?: string | null
  options: Array<{ content: string }>
}

export const fetchVotes = async (meetingId: number) => {
  const { data } = await api.get<VoteItem[]>(`/votes/meeting/${meetingId}`)
  return data
}

export const createVote = async (payload: VoteCreatePayload) => {
  const { data } = await api.post<VoteItem>('/votes', payload)
  return data
}

export const submitVote = async (voteId: number, option_id: number) => {
  const { data } = await api.post<{ options: VoteResultOption[] }>(`/votes/${voteId}/submit`, { option_id })
  return data
}

export const endVote = async (voteId: number) => {
  const { data } = await api.put<VoteItem>(`/votes/${voteId}/end`)
  return data
}