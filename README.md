# Authz

[![Build Status](https://travis-ci.org/joebalancio/authz.svg)](https://travis-ci.org/joebalancio/authz)

## API
### `authz.create(options)`
Creates an `authorizer`. An authorizer can pass in options that affect the `authorizer` globally.

### `authorizer.registerVoter(name, voter)`
Registers a `voter` function with the given `name`. The signature for `voter` is `(subject, action, resource, context) => {}` and should return a value or promise.

### `authorizer.registerPoll(subject, action, resource, voters, options)`
Registers a poll to later decide if a given `subject` can take `action` on a `resource` by `voters`. The `subject`, `action`, and `resource` can be anything that the `voters` will understand. `voters` must be a string or array referencing voters that were previously registered.

### options
**`strategy`**: a strategy can be AFFIRMATIVE, CONSENSUS, or UNANIMOUS. Where AFFIRMATIVE grants access if at least one voter grants access. Where CONSENSUS grants access if a majority of voters grant access. Where UNANIMOUS grant access if all voters grant access.

### `authorizer.registerContextParser(resolver)`
Registers a function that creates a context object. This is used to create an object that every voter should understand. The resolver gets passed arbitrary data as passed from the `context` argument in the `decide()` function. This allows the authorizer to work in any environment: Express, Hapi, or plain. If no context resolver is registered, then a default will be used which is a passthrough function.

### `authorizer.decide(subject, action, resource, context)`
Creates a decision based on `subject`, `action`, `resource`, and `context`. The `authorizer` looks up a registered poll that matches `subject`, `action`, and `resource`. Then it creates a context using the context resolver. Then determines whether to grant or deny access based on the strategy and voting outcome. Returns a promise that is resolved with the outcome, or rejected with an error.
