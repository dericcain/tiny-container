# Tiny Container

[![Coverage Status](https://coveralls.io/repos/github/dericgw/tiny-container/badge.svg?branch=master)](https://coveralls.io/github/dericgw/tiny-container?branch=master)

🚦 A very small (~500B) IoC Container the is easy to use and makes all your dreams come true

## Features

- Small (~500B) so it does not affect your size budget
- Easy to use because the API surface is tiny
- Fast because of lazy instantiation (does not instantiate until needed)
- Type safe because it is written in Typescript
- Keeps your code nice and decoupled

## Installation

`npm i tiny-container` or `yarn add tiny-container`

Then, you can import it using `import { Container } from 'tiny-container';`

## Api

The `Container` has three instance methods available. This means that the `Container` has to
be instantiated, e.g., `const container = new Container();`.

### `register`

The `register` method adds the class to the list of container services.

> NOTE: When using `register`, an new instance will be created every time the class is retrieved. If
> you only need a single instance to ever be created, use `singleton`.

#### Parameters

| Name         | Type       | Required | Description                                                                                                                                                          |
| ------------ | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name         | `string`   | true     | This is the lookup name of the class being added                                                                                                                     |
| class        | class      | true     | This is the uninstantiated class that is being registered                                                                                                            |
| dependencies | `string[]` | false    | These are the dependencies that will be injected into the constructor of the class. These must also be registered with the container using `register` or `singleton` |

#### Usage

```js
const container = new Container();

// No dependencies
container.register('apiService', ApiService);

// Has "apiService" as a dependency
container.register('fileService', FileService, ['apiService']);

// This will not work and will throw an error because the "serviceThatDoesNotExist" has
// not been registered with the Container.
container.register('queryService', QueryService, ['serviceThatDoesNotExist']);
```

### `singleton`

The `singleton` method adds the class to the list of container services, but makes sure it is only
ever instantiated once. Once it has been instantiated, the same instance will be returned each
time.

#### Parameters

| Name         | Type       | Required | Description                                                                                                                                                          |
| ------------ | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name         | `string`   | true     | This is the lookup name of the class being added                                                                                                                     |
| class        | class      | true     | This is the uninstantiated class that is being registered                                                                                                            |
| dependencies | `string[]` | false    | These are the dependencies that will be injected into the constructor of the class. These must also be registered with the container using `register` or `singleton` |

#### Usage

```js
const container = new Container();

// No dependencies
container.singleton('apiService', ApiService);

// Has "apiService" as a dependency
container.singleton('fileService', FileService, ['apiService']);

// This will not work and will throw an error because the "serviceThatDoesNotExist" has
// not been registered with the Container.
container.singleton('queryService', QueryService, ['serviceThatDoesNotExist']);
```

### `get`

The `get` method retrieves an instantiated class from the container's services with all of the
dependencies injected. It also has a second parameter, which is an object, that allows the passing
in of more dependencies. This makes the container very flexible.

#### Parameters

| Name                   | Type                      | Required | Description                                                                                                                                                          |
| ---------------------- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                   | `string`                  | true     | This is the lookup name of the class being retrieved. It is the same name used when registering the service.                                                         |
| additionalDependencies | `object{ [string]: any }` | false    | This is an object of additional dependencies that need to be passed in. The key of the object will be name of the dependency and the property will be the dependency |

#### Usage

```js
// Somewhere that needs the ApiService
import axios from 'axios';

const apiService = container.get('apiService', { request: axios });

apiService.request.get('https://api.domain.com/users/1');

// In the ApiService...
export default class ApiService {
  // Notice the name "request" here matches the key of the object passed in as the second parameter
  // in the "get" method above.
  constructor({ request }) {
    this.request = request;
  }
}
```

## Example

Tiny Container is very easy to use. You add your dependencies to the container and then retrieve
them when you need to use them. All of the dependencies will be injected via the constructor
so your code is nice and decoupled. This makes testing super easy.

The first thing you need to do is create the container:

`src/bootstrap.js`

```js
import { Container } from 'tiny-container';

import ApiService from '../services/api';
import FileService from '../services/file';
import Store from '../stores';

const container = new Container();

// The first param is the name of the service. That is how you will retrieve the service later,
// so it may be a good idea to create a "const" or "enum" with the names
// (I'll show an example later)
container.register('apiService', ApiService);
container.register('fileService', FileService);

// Notice the third parameter and how I am using the same names as I did previously.
// That is important. Now, our "Store" will have access to both the "apiService" and
// the "fileService" via its constructor.
container.singleton('store', Store, ['apiService', 'fileService']);

// We need to export the container so we can retrieve our dependencies later
export default container;
```

Now we will use our container to instantiate our dependencies.

`src/index.js`

```jsx harmony
import React from 'react';
import { render } from 'ReactDOM';

import App from './app';
import container from './bootstrap';

// Notice how the use of the name 'store' is the same as in our bootstrap.js file
const store = container.get('store');

render(<App store={store} />, document.getElementById('root'));
```

Now, let's see how dependencies are injected into the `Store`.

`src/stores/index.js`

```js
export default class Store {
  // The first parameter is an object with the dependencies that were declared in the array, as
  // the third argument of "register" or "singleton"
  constructor({ apiService, fileService }) {
    this.apiService = apiService;
    this.fileService = fileService;
  }
}
```

## Recipes

### Defining Service Names

Since the names of the services are important, it is a good idea to use an exported `const` or an
`enum` with the names:

```js
import { Container } from 'tiny-container';

import ApiService from '../services/api';
import FileService from '../services/file';
import Store from '../stores';

const container = new Container();

// Use this wherever you register or retrieve your service
export const SERVICES = {
  apiService: 'apiService',
  fileService: 'fileService',
  store: 'store',
};

container.register(SERVICES.apiService, ApiService);
container.register(SERVICES.fileService, FileService);
container.singleton(SERVICES.store, Store, [SERVICES.apiService, SERVICES.fileService]);

export default container;
```

In Typescript:

```typescript
import { Container } from 'tiny-container';

import ApiService from '../services/api';
import FileService from '../services/file';
import Store from '../stores';

const container = new Container();

// Use this wherever you register or retrieve your service
export enum SERVICES {
  ApiService = 'apiService',
  FileService = 'fileService',
  Store = 'store',
}

container.register(SERVICES.ApiService, ApiService);
container.register(SERVICES.FileService, FileService);
container.singleton(SERVICES.Store, Store, [SERVICES.ApiService, SERVICES.FileService]);

export default container;
```

### Connecting MobX stores

Tiny Container is perfect for MobX and hooking up the stores and their dependencies. This is where
the idea of this library started.

`src/services/api.js`

```js
export default class ApiService {
  get() {
    // Could be a GET fetch call
  }

  post() {
    // Could be a POST fetch call
  }
}
```

`src/bootstrap.js`

```js
import { Container } from 'tiny-container';

import ApiService from '../services/api';
import UserStore from './stores/user';

const container = new Container();

container.register('apiService', ApiService);
container.singleton('userStore', UserStore, ['apiService']);

export default container;
```

`src/stores/user.js`

```js
export default class UserStore {
  constructor({ rootStore, apiService }) {
    // We need access to our root store so we can talk to other stores
    this.rootStore = rootStore;
    // We have access to the apiService because of our bootstrap file above
    this.apiService = apiService;
  }
}
```

`src/stores/root.js`

```js
export default class RootStore {
  constructor() {
    // Pass in the root store as a dependency to the get method so it is injected in the constructor
    // of our UserStore
    this.userStore = container.get('userStore', { rootStore: this });
  }
}
```

`src/index.jsx`

```jsx harmony
import React from 'react';
import { render } from 'ReactDOM';
import { Provider } from 'mobx-react';

import App from './app';
import RootStore from './stores/root';

// We don't add the RootStore to the container because we do not want to create a cyclic dependency
// since we need to use the container in the RootStore to resolve the other stores
const store = new RootStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

## Issues

Open up an issue if you find one. If you can provide a reproduction, then please do. You can use [codesandbox.io](codesandbox.io) for this.

## Contributing

Every merge into master will publish a new release to NPM. In order to know which version should be should be published,
i.e., patch, minor, major, this repo uses keywords in the git commits.

- No keyword - patch
- "feat" or "feature" - minor
- "BREAKING CHANGES" - major

## License (MIT)

[Check it out here.](./LICENSE.md)
