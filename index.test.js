const chai = require('chai')
const sinon = require('sinon')

const RapidAPIPassportStrategy = require('.')


describe('RapidAPIPassportStrategy', function() {
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
})