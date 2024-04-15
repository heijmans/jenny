# Jenny

## How to run?

### Generate a Jenkins api token

- Click on your name (in the top-right corner) in Jenkins.
- Click on Configure.
- Click on API Token / Add new Token.
- Give it a name, e.g. jenny, and copy the token.

### Write a settings.json file

You need to replace all values with the right values for your Jenkins server and your account.

```json
{
  "server": "https://buildserver.example.com/jenkins",
  "username": "jan",
  "apitoken": "********",
}
```

### Install dependencies and start the dev server

```sh
npm install
npm run dev
```

Open [http://localhost:1667/](http://localhost:1667/) in your browser.

## TODO

- Better extraction of screenshots: get all the png's from artifacts, search the output for matching filenames.
- Add Blue Ocean links.

## Wishlist

- Make a tree view of the console text.
- Link to intellij? see https://stackoverflow.com/a/36582270 , https://stackoverflow.com/a/56066943 , https://plugins.jetbrains.com/plugin/19991-ide-remote-control/reviews .
- Handle jobs that are less or more than 3 levels deep.
