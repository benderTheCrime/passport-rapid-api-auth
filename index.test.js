const chai = require('chai')
const sinon = require('sinon')

const RapidAPIPassportStrategy = require('.')


describe('RapidAPIPassportStrategy', function() {
  describe('ctor', function() {
    beforeEach(function() {
      this.verify = sinon.stub()
    })
    it('checks for a new strategy with auth params and verify function', function() {
      const strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'}, this.verify)

      chai.assert.equal(strategy.secret, 'tacocat')
      chai.assert.equal(strategy.verify, this.verify)
    })
    it('checks for a new strategy without auth params', function() {
      const strategy = new RapidAPIPassportStrategy(null, this.verify)

      chai.assert.equal(strategy.secret, undefined)
      chai.assert.equal(strategy.verify, this.verify)
    })
    it('checks for a new strategy without a verify function and throws', function() {
      chai.assert.throws(function() {
        new RapidAPIPassportStrategy({proxySecret: 'tacocat'})
      }, TypeError, 'A verify parameter must be provided and be a valid function.');
    })
    it('checks for a new strategy without args and throws', function() {
      chai.assert.throws(function() {
        new RapidAPIPassportStrategy()
      }, TypeError, 'A verify parameter must be provided and be a valid function.');
    })
  })
  describe('authenticate', function() {
    beforeEach(function() {
      this.headers = {
        ['X-RapidAPI-Proxy-Secret']: 'tacocat',
        ['X-RapidAPI-Subscription']: 'FREE',
        ['X-RapidAPI-User']: 'test user',
        ['X-RapidAPI-Version']: '1.1.1',
      }
      this.verify = (user, _, done) => done(null, user);
      this.strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'}, this.verify)
      this.strategy.success = sinon.stub()
      this.strategy.error = sinon.stub()
      this.strategy.fail = sinon.stub()
    })
    it('checks proxy secret and calls passport success', function() {
      this.strategy.authenticate({headers: this.headers})
      chai.assert(this.strategy.success.calledOnceWith({
        subscription: 'FREE',
        name: 'test user',
        version: '1.1.1',
      }, {}))
      chai.assert(this.strategy.fail.notCalled)
    })
    it('checks error in verify and calls passport error', function() {
      const e = new Error('test')
      this.strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'}, (_, __, done) => done(e))
      this.strategy.success = sinon.stub()
      this.strategy.error = sinon.stub()
      this.strategy.authenticate({headers: this.headers})
      chai.assert(this.strategy.success.notCalled)
      chai.assert(this.strategy.error.calledOnceWith(e))
    })
    it('checks missing user in verify and calls passport error', function() {
      this.strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'}, (_, __, done) => done())
      this.strategy.success = sinon.stub()
      this.strategy.fail = sinon.stub()
      this.strategy.authenticate({headers: this.headers})
      chai.assert(this.strategy.success.notCalled)
      chai.assert(this.strategy.fail.calledOnceWith({
        errors: ['Missing user after validation.'],
        result: null,
      }, 401))
    })
    it('checks missing proxy secret and calls passport fail', function() {
      this.strategy.authenticate({headers: {}})
      chai.assert(this.strategy.success.notCalled)
      chai.assert(this.strategy.fail.calledOnceWith({
        errors: ['No RapidAPI Proxy Secret provided.'],
        result: null,
      }, 401))
    })
    it('checks incorrect proxy secret and calls passport fail', function() {
      this.headers['X-RapidAPI-Proxy-Secret'] = 'racecar'
      this.strategy.authenticate({headers: this.headers})
      chai.assert(this.strategy.success.notCalled)
      chai.assert(this.strategy.fail.calledOnceWith({
        errors: ['RapidAPI Proxy Secret is invalid.'],
        result: null,
      }, 401))
    })
  })
  describe('Strategy', function() {
    it('check that the static getter for strategy returns RapidAPIPassportStrategy', function() {
      chai.assert.equal(RapidAPIPassportStrategy, RapidAPIPassportStrategy.Strategy)
    })
  })
})