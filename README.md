# nani
What's Crunchyroll?

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Features
- Fast, modern and responsive interface
- Stream\* and search anime
- Manage your queue
- Much more...

<sub>* Streaming will not work on many newer shows from the website, sadly Crunchyroll is adding CORS headers. I'm working on a public solution for this.</sub>

## Development
To run in development, run
```sh
yarn start
```

## Building
To build static files, run
```sh
yarn build
```

## Deployment
This is meant to be deployed on Netlify, to take advantage of their proxy feature to allow for full HTTPS.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/destruc7i0n/nani)

## Thanks
* [Umi](https://github.com/remixz/umi/) for design ideas and some API functions

## License
MIT