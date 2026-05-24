export enum EventStatus {
  PLANNED = 'PLANNED',
  CANCELED = 'CANCELED',
}

export interface EventEntity {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  createdByUserId: number;
  status: EventStatus;
  participantIds: number[];
}
