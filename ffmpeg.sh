#!/bin/bash

"ffmpeg" -re -f lavfi -i color=c=red:s=1280x720:r=25/1 -c:v h264 -t 60 -f flv "rtmp://localhost/live/channel?password=password"
