# stats-node-ams

## Overview

Statistics server/api counterpart for stats-node specifically designed for Adobe Media Server. Comes with action script application that manages channels, streamers, clients and allows API to collect IPs.

### Requirements

- Node.js >= 8
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

http://localhost:8080/videoPlayer/videoplayer.html?source=rtmp://localhost/live/channel&type=live

```
default adobe player
```

`./ffmpeg.sh`

```
stream to the server to test the api
```
