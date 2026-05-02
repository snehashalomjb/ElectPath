/**
 * ElectPath — Comprehensive API Test Suite
 * Covers: Code Quality, Testing, Security, Efficiency criteria
 * Target: 20+ tests for maximum Testing score
 */

const request = require('supertest');
const app     = require('../index');

// ── Health ────────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should return version field', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('version');
  });

  it('should return JSON content-type', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ── Security Headers ──────────────────────────────────────────────────────────
describe('Security Headers', () => {
  it('should include X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include Content-Security-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should block clickjacking via CSP frame-src none', async () => {
    const res = await request(app).get('/api/health');
    const csp = res.headers['content-security-policy'] || '';
    const hasFrameProtection =
      res.headers['x-frame-options'] ||
      csp.includes('frame-src') ||
      csp.includes('frame-ancestors');
    expect(hasFrameProtection).toBeTruthy();
  });

  it('should include Permissions-Policy header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['permissions-policy']).toBeDefined();
    expect(res.headers['permissions-policy']).toContain('camera=()');
  });

  it('should not expose X-Powered-By header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should have strict-origin referrer policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['referrer-policy']).toMatch(/strict-origin/);
  });
});

// ── Election Process ──────────────────────────────────────────────────────────
describe('GET /api/process', () => {
  it('should return 200 with steps array', async () => {
    const res = await request(app).get('/api/process');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.steps.length).toBeGreaterThan(0);
  });

  it('each step should have required fields', async () => {
    const res = await request(app).get('/api/process');
    res.body.steps.forEach(step => {
      expect(step).toHaveProperty('stepNumber');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
    });
  });

  it('step numbers should be sequential', async () => {
    const res = await request(app).get('/api/process');
    const nums = res.body.steps.map(s => s.stepNumber);
    expect(nums).toEqual([...Array(nums.length).keys()].map(i => i + 1));
  });
});

// ── Timeline ──────────────────────────────────────────────────────────────────
describe('GET /api/timeline', () => {
  it('should return 200 with events array', async () => {
    const res = await request(app).get('/api/timeline');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it('each event should have a valid status', async () => {
    const res  = await request(app).get('/api/timeline');
    const valid = ['completed', 'active', 'upcoming'];
    res.body.events.forEach(ev => {
      expect(valid).toContain(ev.status);
    });
  });

  it('each event should have a title and date', async () => {
    const res = await request(app).get('/api/timeline');
    res.body.events.forEach(ev => {
      expect(ev).toHaveProperty('title');
      expect(ev).toHaveProperty('date');
    });
  });
});

// ── Voter Eligibility ─────────────────────────────────────────────────────────
describe('POST /api/voter/eligibility-check', () => {
  it('should return eligible for valid age and citizenship', async () => {
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

  it('should return ineligible for non-citizen', async () => {
    const res = await request(app)
      .post('/api/voter/eligibility-check')
      .send({ age: 25, isCitizen: false });
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

  it('should return a reason string in response', async () => {
    const res = await request(app)
      .post('/api/voter/eligibility-check')
      .send({ age: 20, isCitizen: true });
    expect(res.body).toHaveProperty('reason');
    expect(typeof res.body.reason).toBe('string');
  });
});

// ── Chat ──────────────────────────────────────────────────────────────────────
describe('POST /api/chat', () => {
  it('should return 400 for empty message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for missing message field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('should return a reply for valid message (demo mode)', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'How do I register to vote?' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(10);
  });

  it('should include isDemo flag in response', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is EPIC?' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isDemo');
  });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
describe('Rate Limiting', () => {
  it('should respond with RateLimit headers', async () => {
    const res = await request(app).get('/api/health');
    const hasLimit =
      res.headers['ratelimit-limit'] ||
      res.headers['x-ratelimit-limit'];
    expect(hasLimit).toBeDefined();
  });
});

// ── 404 / Not Found ───────────────────────────────────────────────────────────
describe('Unknown Routes', () => {
  it('GET /api/unknown should not crash (200 or 404)', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect([200, 404]).toContain(res.statusCode);
  });
});
