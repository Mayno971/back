export interface EventEntity {
  id: number;
  title: string;
  description?: string;
  date: string;
  location: string;

  createdByUserId: number;
  status: 'DRAFT' | 'PUBLISHED';

  participants: number[];
}
