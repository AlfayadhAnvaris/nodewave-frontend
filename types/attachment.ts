export interface TaskAttachment {
  id: string
  task_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  created_at: string
  uploader: {
    id: string
    name: string
    email: string
  }
}
