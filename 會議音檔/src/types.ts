export interface Meeting {
  id: string;
  title: string;
  createdAt: string; // ISO timestamp
  duration: number; // in seconds
  transcript: string;
  summary: string;
  language?: string; // language code or label
}
