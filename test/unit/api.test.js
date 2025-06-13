import { app } from '../../index.js';
import { expect } from 'chai';
import request from 'supertest';

describe('API Tests', () => {
	it('GET / should return 302', (done) => {
		request(app)
		.get('/')
		.expect(302)
		.end((err, res) => {
			if (err) return done(err);
			done();
		});
	});

	it('GET /login should return 200', (done) => {
		request(app)
		.get('/login')
		.expect(200)
		.end((err, res) => {
			if (err) return done(err);
			done();
		});
	});
});