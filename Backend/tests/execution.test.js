const request = require('supertest');
const app = require('../src/app');

jest.setTimeout(15000);

describe('Code Execution Engine API', () => {
  let userCookie;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Runner Tester',
        email: `runner.tester.${Date.now()}@test.io`,
        password: 'Password123!',
      });
    userCookie = res.headers['set-cookie'];
  });

  it('POST /api/executions without authentication should return 401', async () => {
    const res = await request(app)
      .post('/api/executions')
      .send({
        language: 'python',
        code: 'print("Hello")',
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/executions with invalid language should return 400', async () => {
    const res = await request(app)
      .post('/api/executions')
      .set('Cookie', userCookie)
      .send({
        language: 'bash',
        code: 'echo "unsafe"',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Language must be one of');
  });

  it('POST /api/executions should execute Python code successfully', async () => {
    const res = await request(app)
      .post('/api/executions')
      .set('Cookie', userCookie)
      .send({
        language: 'python',
        code: 'print("Hello, Cloud IDE!")',
        stdin: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.execution).toBeDefined();
    expect(res.body.execution.status).toBe('completed');
    expect(res.body.execution.exitCode).toBe(0);
    expect(res.body.execution.stdout).toContain('Hello');
  });

  it('POST /api/executions should execute C++ code successfully', async () => {
    const res = await request(app)
      .post('/api/executions')
      .set('Cookie', userCookie)
      .send({
        language: 'cpp',
        code: `#include <iostream>
int main() {
    std::cout << "Computed checksum: 150\\n";
    return 0;
}`,
        stdin: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.execution.status).toBe('completed');
    expect(res.body.execution.exitCode).toBe(0);
  });

  it('POST /api/executions should execute Java code successfully', async () => {
    const res = await request(app)
      .post('/api/executions')
      .set('Cookie', userCookie)
      .send({
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Sum of squares: 338350");
    }
}`,
        stdin: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.execution.status).toBe('completed');
  });

  it('POST /api/executions with syntax error should report status failed and stderr', async () => {
    const res = await request(app)
      .post('/api/executions')
      .set('Cookie', userCookie)
      .send({
        language: 'python',
        code: 'import non_existent_pkg\nprint("test")',
        stdin: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.execution.status).toBe('failed');
    expect(res.body.execution.exitCode).not.toBe(0);
    expect(res.body.execution.stderr).toBeDefined();
  });

  it('GET /api/executions should list user execution audit history', async () => {
    const res = await request(app)
      .get('/api/executions')
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
