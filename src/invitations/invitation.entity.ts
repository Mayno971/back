export interface Invitation {
  id: number;
  eventId: number;
  invitedUserId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  expiresAt: Date;
}
