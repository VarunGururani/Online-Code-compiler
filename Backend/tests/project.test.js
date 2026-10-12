const request = require('supertest');
const app = require('../src/app');

describe('Project Management API & Ownership Authorization', () => {
  let user1Cookie;
  let user2Cookie;
  let createdProjectId;

  beforeAll(async () => {
    // Create User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Developer One',
        email: `dev1.${Date.now()}@test.io`,
        password: 'Password123!',
      });
    user1Cookie = res1.headers['set-cookie'];

    // Create User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Developer Two',
        email: `dev2.${Date.now()}@test.io`,
        password: 'Password123!',
      });
    user2Cookie = res2.headers['set-cookie'];
  });

  it('POST /api/projects without session should return 401', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Secret Algorithm' });
    expect(res.status).toBe(401);
  });

  it('POST /api/projects with session should create project with initial starter file', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', user1Cookie)
      .send({
        name: 'Distributed Graph Solver',
        description: 'Shortest path computation',
        language: 'python',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Distributed Graph Solver');
    expect(res.body.files).toBeDefined();
    expect(res.body.files.length).toBeGreaterThan(0);
    expect(res.body.files[0].name).toBe('main.py');

    createdProjectId = res.body.id;
  });

  it('GET /api/projects should return only user 1 projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p) => p.id === createdProjectId)).toBe(true);
  });

  it('GET /api/projects/:projectId for User 2 should return 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  it('PATCH /api/projects/:projectId for owner should update project details', async () => {
    const res = await request(app)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Cookie', user1Cookie)
      .send({ name: 'Distributed Graph Solver v2' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Distributed Graph Solver v2');
  });

  it('DELETE /api/projects/:projectId for User 2 should return 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/projects/${createdProjectId}`)
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(403);
  });

  it('DELETE /api/projects/:projectId for owner should delete project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${createdProjectId}`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
