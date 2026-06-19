import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, lists and marks a notification', async () => {
    const user = await userRepo.save(userRepo.create({ email: 'e2e@example.com', passwordHash: 'x', firstName: 'E', lastName: '2' } as any));

    // create
    const createRes = await request(app.getHttpServer())
      .post('/notifications')
      .send({ userId: user.id, type: 'INVITE', title: 'Hello', body: 'Body' })
      .expect(201);

    expect(createRes.body.id).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/notifications')
      .query({ userId: user.id })
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThan(0);

    const id = createRes.body.id;
    const markRes = await request(app.getHttpServer())
      .post(`/notifications/${id}/read`)
      .query({ userId: user.id })
      .expect(201);

    expect(markRes.body.isRead).toBe(true);
  });
});
