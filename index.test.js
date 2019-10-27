const chai = require('chai')
const sinon = require('sinon')

const RapidAPIPassportStrategy = require('.')


describe('RapidAPIPassportStrategy', function() {
  describe('ctor', function() {
    beforeEach(function() {
      this.verify = sinon.stub()
    })
    it('test constructor success', function() {
      const strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'}, this.verify)

      chai.assert.equal(strategy.secret, 'tacocat')
      chai.assert.equal(strategy.verify, this.verify)
    })
    it('test constructor without params', function() {
      const strategy = new RapidAPIPassportStrategy(null, this.verify)

      chai.assert.equal(strategy.secret, undefined)
      chai.assert.equal(strategy.verify, this.verify)
    })
    it('test constructor without verify', function() {
      const strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'})

      chai.assert.equal(strategy.secret, 'tacocat')
      chai.assert.equal(strategy.verify, undefined)
    })
    it('test constructor without args', function() {
      const strategy = new RapidAPIPassportStrategy()

      chai.assert.equal(strategy.secret, undefined)
      chai.assert.equal(strategy.verify, undefined)
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
      this.strategy = new RapidAPIPassportStrategy({proxySecret: 'tacocat'})
      this.strategy.success = sinon.stub()
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