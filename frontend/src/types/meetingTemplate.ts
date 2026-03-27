export interface MeetingTemplateItem {
  id: number
  name: string
  description: string | null
  default_title: string | null
  default_duration_minutes: number | null
  capacity_label: string | null
  record_url: string | null
  tags: string[]
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export interface MeetingTemplatePayload {
  name: string
  description: string | null
  default_title: string | null
  default_duration_minutes: number | null
  capacity_label: string | null
  record_url: string | null
  tags: string[]
  is_active: boolean
}

export interface UseMeetingTemplatePayload {
  title?: string | null
  start_time: string
  end_time?: string | null
  record_url?: string | null
}
