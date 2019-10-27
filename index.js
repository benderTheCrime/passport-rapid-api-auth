const PassportStrategy = require('passport-strategy')

const isPlainObject = require('is-plain-obj')

module.exports = class RapidAPIPassportStrategy extends PassportStrategy {
  constructor(params, verify) {
    super(params, verify)

    if (isPlainObject(params)) {
      this.secret = params.proxySecret
    }

    if (typeof verify === 'function') {
      this.verify = verify
    }
  }

  authenticate(req) {
    const normalizedHeaders = normalizeHeaders(req.headers)

    // X-RapidAPI-Proxy-Secret
    // This is a secret unique key for every API that is appended by the proxy 
    // on every request. For high security, you can validate this secret 
    // server-side and check if it equals the key shown in the API Admin 
    // (under the 'Settings' tab at provider.rapidapi.com).
    const secret = getRapidAPIProxySecret(normalizedHeaders)

    if (secret) {
      if (this.secret === secret) {
        return this.success({
          // X-RapidAPI-User
          // The name of the user that's making the request.
          name: getRapidAPIUser(normalizedHeaders),

          // X-RapidAPI-Subscription
          // The name of the subscription (if any). The values can be:
          // * FREE
          // * BASIC
          // * PREMIUM
          // * ULTRA
          // * CUSTOM (if the user is subscribed to a custom plan.)
          subscription: getRapidAPISubscription(normalizedHeaders),

          // X-RapidAPI-Version
          // The version of the proxy.
          version: getRapidAPIVersion(normalizedHeaders),
        }, {})
      }

      const e = new Error('RapidAPI Proxy Secret is invalid.')
      return this.fail({
        errors: [e.message],
        result: null,
      }, 401)
    }

    const e = new Error('No RapidAPI Proxy Secret provided.')
    return this.fail({
      errors: [e.message],
      result: null,
    }, 401)
  }

  static get Strategy() {
    return RapidAPIPassportStrategy
  }
}

function getRapidAPIProxySecret(headers) {
  return headers['x-rapidapi-proxy-secret'] || null
}

function getRapidAPISubscription(headers) {
  return headers ['x-rapidapi-subscription'] || null
}

function getRapidAPIUser(headers) {
  return headers['x-rapidapi-user'] || null
}

function getRapidAPIVersion(headers) {
  return headers ['x-rapidapi-version'] || null
}

function normalizeHeaders(headers) {
  return Object.keys(headers).reduce(normalize, {})

  function normalize(normalizedHeaders, key) {
    normalizedHeaders[key.toLowerCase()] = headers[key]
    return normalizedHeaders
  }
}