#!/bin/bash

cp -a /opt/adobe/ams/samples/videoPlayer /opt/adobe/ams/webroot

sed -i 's/<Allow>ping<\/Allow>/<Allow>All<\/Allow>/g' /opt/adobe/ams/conf/Users.xml
sed -i 's/<Deny>All<\/Deny>/<Deny><\/Deny>/g' /opt/adobe/ams/conf/Users.xml
