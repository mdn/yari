# Yari Lambda Functions

This `aws-lambda` folder contains one or more sub-folders each of which may
define a unique AWS Lambda function used by Yari. A sub-folder defines an AWS
Lambda function if it contains the following:

- an `index.js` file containing the code of the Lambda function
- a `package.json` file which defines the Lambda function's dependencies as well
  as a `make-package` command that when run creates an AWS Lambda deployment
  package (Zip file) containing the function's code (`index.js`) and
  dependencies (`node_modules/*`). Also, you'll need to specify the function's
  AWS `name` and `region` under the `aws` property within the `package.json`
  file (see example below).

  Here's an example `package.json` file:

  ```json
  {
    "description": "Defines the deployment package for this AWS Lambda function.",
    "private": true,
    "main": "index.js",
    "license": "MPL-2.0",
    "scripts": {
      "make-package": "yarn install && zip -r -X function.zip . -i index.js 'node_modules/*'"
    },
    "dependencies": {
      "sanitize-filename": "^1.6.3"
    },
    "engines": {
      "node": "14.x"
    },
    "aws": {
      "name": "mdn-content-origin-request",
      "region": "us-east-1"
    }
  }
  ```

## Updating Lambda Functions in AWS

The command:

```sh
cd deployer
poetry run deployer update-lambda-functions
```

will discover every folder that contains a Lambda function, create a deployment
package (Zip file) for each one by running:

```sh
yarn make-package
```

and if the deployment package is different from what is already in AWS, it will
upload and publish a new version.

## Debugging the `content-origin-request` handler

You can simulate what Lambda@Edge does, but on your laptop. To start it, run:

```sh
cd aws-lambda
cd content-origin-request
yarn install
yarn serve
```

This will start a server at <http://localhost:7000>. It's meant to work much the
same as when our Lambda@Edge function is run within AWS. To test it, try:

```sh
curl -I http://localhost:7000/EN-us/docs/Foo/
```

It doesn't actually look things up on disk like CloudFront + Lambda@Edge can do.
But it's a great tool for end-to-end testing our redirect rules.

### An important caveat about `@yari-internals`

The `yarn serve` server will automatically restart itself if a change is made to
the `index.js` or the `server.js` code. But, if you make an edit to any of the
`/libs/**/index.js` files (they're called `@yari-internal/...` from within the
code), then the only way to get them to become the latest version is to run:

```sh
yarn install --force
```

This is necessary because they're not versioned.

### Headers

All the headers that the Express server receives it replicates. This means you
can test things like this:

```sh
curl -I -H 'accept-language: fr' -H 'cookie: preferredlocale=de' http://localhost:7000/docs/Web
```
