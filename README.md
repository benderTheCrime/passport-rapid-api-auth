# passport-rapid-api-auth

[![Greenkeeper badge](https://badges.greenkeeper.io/benderTheCrime/passport-rapid-api-auth.svg)](https://greenkeeper.io/)

Provides an additional layer of security for RapidAPI APIs built on Node.js.

## Installation

```sh
npm i passport-rapid-api-auth
```

## Usage

```js
const passport = require('passport')
const {Strategy: RapidAPIPassportStrategy} = require('passport-rapid-api-auth')

const authParams = {
  passReqToCallback: false,
  proxySecret: 'RAPID_API_PROXY_SECRET',
}

passport.use('rapid-api', new Strategy(authParams, verify)

app.use(passport.initialize())
app.use(passport.session())

function verify(...args) {
  const [user, id, next] = args

  return next(null, {
    id,
    name: user.name,
    subscription: user.subscription,
    version: user.version,
  })
}
```

### RapidAPI Proxy Secret

> For security, you should protect your API by blocking requests that are not from the RapidAPI infrastructure. RapidAPI adds the "X-RapidAPI-Proxy-Secret" header on every request. This header has a unique value for each API. if this header is missing or has a different value from the value specified below, you should assume the request is not from RapidAPI infrastructure.

This value can be found under the "Settings" tab in your RapidAPI configuration.