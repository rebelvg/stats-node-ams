#!/bin/bash

"ffmpeg" -re -stream_loop -1 -f lavfi -i color=c=red:s=1280x720:r=25/1 -c:v h264 -f flv "rtmp://localhost/live/channel?password=password"
