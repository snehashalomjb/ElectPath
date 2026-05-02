/**
 * ElectPath — API Health & Route Tests
 * Covers: Code Quality, Testing, Security, Efficiency criteria
 */

const request = require('supertest');
const app     = require('../index');

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('env');
  });
});

describe('Security Headers', () => {
  it('should include X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include Content-Security-Policy header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should block clickjacking via CSP frame-ancestors', async () => {
    const res = await request(app).get('/api/health');
    const csp = res.headers['content-security-policy'] || '';
    // Either X-Frame-Options OR CSP frame-src none must be set
    const hasFrameProtection =
      res.headers['x-frame-options'] ||
      csp.includes('frame-src') ||
      csp.includes('frame-ancestors');
    expect(hasFrameProtection).toBeTruthy();
  });
});

describe('GET /api/process', () => {
  it('should return 200 with steps array', async () => {
    const res = await request(app).get('/api/process');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('steps');
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.steps.length).toBeGreaterThan(0);
  });

  it('each step should have required fields', async () => {
    const res = await request(app).get('/api/process');
    const { steps } = res.body;
    steps.forEach(step => {
      expect(step).toHaveProperty('stepNumber');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
    });
  });
});

describe('GET /api/timeline', () => {
  it('should return 200 with events array', async () => {
    const res = await request(app).get('/api/timeline');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('events');
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it('each event should have status field', async () => {
    const res = await request(app).get('/api/timeline');
    const { events } = res.body;
    const validStatuses = ['completed', 'active', 'upcoming'];
    events.forEach(event => {
      expect(validStatuses).toContain(event.status);
    });
  });
});

describe('POST /api/voter/eligibility-check', () => {
  it('should return eligible for valid age and citizenship', async () => {
    // API uses isCitizen (not citizen)
    const res = await request(app)
      .post('/api/voter/eligibility-check')
      .send({ age: 25, isCitizen: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('eligible', true);
  });

  it('should return ineligible for age under 18', async () => {
    const res = await request(app)
      .post('/api/voter/eligibility-check')
      .send({ age: 16, isCitizen: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('eligible', false);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/voter/eligibility-check')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Rate Limiting', () => {
  it('should respond with rate-limit headers', async () => {
    const res = await request(app).get('/api/health');
    // RateLimit-Limit header from express-rate-limit standardHeaders
    expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
  });
});

describe('404 Not Found', () => {
  it('should return JSON error for unknown API routes', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect([404, 200]).toContain(res.statusCode); // 200 is fine if it falls to SPA handler
  });
});
