# nani
What's Crunchyroll?

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Images
![Dashboard](https://i.imgur.com/AhcLPOn.png)
![Queue](https://i.imgur.com/b9anAaK.png)
![Series](https://i.imgur.com/nI5euO6.png)
![Video](https://i.imgur.com/kad1azD.png)

There are a few more here: https://imgur.com/a/R5cNW

## Features
- Fast, modern, and responsive interface
- Stream\* and search anime
- Manage your queue
- MyAnimeList & AniList updating support
- Much more...

<sub>* Streaming will not work on many newer shows in the browser. Use the desktop app.</sub>

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

To build the desktop app, run
```sh
cd desktop
yarn install
yarn build
```
Install what is in the `dist` folder.

## Deployment
This is meant to be deployed on Netlify, to take advantage of their proxy feature and functions.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/destruc7i0n/nani)

## Thanks
* [Umi](https://github.com/remixz/umi/) for design ideas and some API functions

## Contributing
Contributions are definitely welcome!

## License
MIT