# stats-node-ams

## Overview

Statistics server/api counterpart for stats-node specifically designed for Adobe Media Server. Comes with action script application that manages channels, streamers, clients and allows API to collect IPs.

### Requirements

- Node.js LTS
- Yarn

### Links

- [Adobe Media Server](http://www.adobe.com/products/adobe-media-server-family.html)
- [Stats Node](https://github.com/rebelvg/stats-node)

## Usage

### Run

```
yarn docker
yarn install
yarn start
```

### Test

http://localhost:8080/ams_adminConsole.htm

```
login: admin
password: 123456789
```

```
stream to the server to test the api


./stream.sh
```

```
subscribe by running

streamlink "rtmp://localhost/live/channel live=1" best

or by opening the default adobe player (requires flash)

http://localhost:8080/videoPlayer/videoplayer.html?source=rtmp://localhost/live/channel&type=live
```
