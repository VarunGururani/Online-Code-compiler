const request = require('supertest');
const app = require('../src/app');

describe('File Management API & Path Traversal Protection', () => {
  let userCookie;
  let unauthorizedCookie;
  let projectId;
  let fileId;

  beforeAll(async () => {
    // Register owner
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'File Owner',
        email: `file.owner.${Date.now()}@test.io`,
        password: 'Password123!',
      });
    userCookie = res1.headers['set-cookie'];

    // Register other user
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other Dev',
        email: `other.dev.${Date.now()}@test.io`,
        password: 'Password123!',
      });
    unauthorizedCookie = res2.headers['set-cookie'];

    // Create project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Cookie', userCookie)
      .send({ name: 'File Test Project', language: 'python' });

    projectId = projRes.body.id;
  });

  it('POST /api/projects/:projectId/files should create a new source file', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set('Cookie', userCookie)
      .send({
        name: 'utils.py',
        path: '/utils.py',
        content: 'def helper(): return 42\n',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('utils.py');
    expect(res.body.content).toContain('helper');
    fileId = res.body.id;
  });

  it('POST /api/projects/:projectId/files should prevent path traversal', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set('Cookie', userCookie)
      .send({
        name: 'malicious.py',
        path: '/../../etc/shadow',
        content: 'malicious',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('path traversal');
  });

  it('POST /api/projects/:projectId/files should return 409 for duplicate path', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set('Cookie', userCookie)
      .send({
        name: 'utils.py',
        path: '/utils.py',
        content: 'duplicate',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  it('PATCH /api/files/:fileId should update file contents (Monaco Editor save)', async () => {
    const res = await request(app)
      .patch(`/api/files/${fileId}`)
      .set('Cookie', userCookie)
      .send({
        content: 'def helper(): return 100\n',
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toContain('100');
  });

  it('PATCH /api/files/:fileId from unauthorized user should return 403', async () => {
    const res = await request(app)
      .patch(`/api/files/${fileId}`)
      .set('Cookie', unauthorizedCookie)
      .send({
        content: 'tampered content',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  it('DELETE /api/files/:fileId should delete the file', async () => {
    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
