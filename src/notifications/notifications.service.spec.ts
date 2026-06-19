import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const notifications = [
    { id: '1', userId: 'u1', isRead: false, title: 'T1', body: 'B1', createdAt: new Date() },
  ];

  const mockNotificationsRepo: any = {
    find: jest.fn().mockResolvedValue(notifications),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => notifications.find(n => n.id === id) || null),
    create: jest.fn(),
    save: jest.fn().mockImplementation((n) => Promise.resolve({ ...n })),
  };

  const mockPrefsRepo: any = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((p) => p),
    save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
  };

  beforeEach(() => {
    service = new NotificationsService(mockNotificationsRepo, mockPrefsRepo, { sendToUser: jest.fn() });
  });

  it('findForUser returns notifications', async () => {
    const res = await service.findForUser('u1');
    expect(res).toBe(notifications);
    expect(mockNotificationsRepo.find).toHaveBeenCalledWith({ where: { userId: 'u1' }, order: { createdAt: 'DESC' } });
  });

  it('markAsRead updates isRead', async () => {
    const res = await service.markAsRead('1');
    expect(res.isRead).toBe(true);
    expect(mockNotificationsRepo.save).toHaveBeenCalled();
  });

  it('getPreferences throws when missing', async () => {
    await expect(service.getPreferences('u1')).rejects.toThrow();
  });

  it('updatePreferences creates new prefs when missing', async () => {
    const p = await service.updatePreferences('u1', { emailEnabled: false } as any);
    expect(p.emailEnabled).toBe(false);
    expect(mockPrefsRepo.save).toHaveBeenCalled();
  });

  it('createNotification persists and returns', async () => {
    mockNotificationsRepo.create.mockImplementation((p) => ({ ...p, id: 'new' }));
    const payload = { userId: 'u1', type: 'INVITE', title: 'T2', body: 'B2' };
    const res = await service.createNotification(payload as any);
    expect(res.id).toBe('new');
    expect(mockNotificationsRepo.save).toHaveBeenCalled();
  });

  it('createNotification calls gateway', async () => {
    const gw = { sendToUser: jest.fn() };
    service = new NotificationsService(mockNotificationsRepo, mockPrefsRepo, gw as any);
    mockNotificationsRepo.create.mockImplementation((p) => ({ ...p, id: 'new2' }));
    const res = await service.createNotification({ userId: 'u1', type: 'INVITE', title: 'T3' } as any);
    expect(gw.sendToUser).toHaveBeenCalledWith('u1', expect.objectContaining({ id: 'new2' }));
  });
});
