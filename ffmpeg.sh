#!/bin/bash
"/d/install/ffmpeg/ffmpeg.exe" -re -f lavfi -i color=c=black:s=1280x720:r=25/1 -c:v h264 -t 60 -f flv "rtmp://localhost/live/channel?password=password"
