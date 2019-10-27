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
    it('test auth strategy success', function() {
      this.strategy.authenticate({headers: this.headers})
      chai.assert(this.strategy.success.calledOnceWith({
        subscription: 'FREE',
        name: 'test user',
        version: '1.1.1',
      }, {}))
    })
  })
})