FROM centos:latest

RUN dnf update -y
RUN dnf install epel-release -y
RUN yum update -y
RUN yum install -y tar nspr-devel supervisor psmisc

RUN mkdir -p /var/log/supervisor
COPY configs/supervisord.conf /etc/supervisord.conf

WORKDIR /tmp
RUN curl -O http://download.macromedia.com/pub/adobemediaserver/5_0_8/AdobeMediaServer5_x64.tar.gz
WORKDIR /tmp/ams_latest
RUN tar zxvf ../AdobeMediaServer5_x64.tar.gz -C . --strip-components=1
RUN rm -Rf License.txt
RUN sed -i -e 's:read cont < /dev/tty:#read cont < /dev/tty:g' installAMS

COPY configs/installAMS.input installAMS.input

RUN ./installAMS < installAMS.input

RUN cp -a /opt/adobe/ams/samples/videoPlayer /opt/adobe/ams/webroot

RUN sed -i 's/<Allow>ping<\/Allow>/<Allow>All<\/Allow>/g' /opt/adobe/ams/conf/Users.xml
RUN sed -i 's/<Deny>All<\/Deny>/<Deny><\/Deny>/g' /opt/adobe/ams/conf/Users.xml

# CLEANUP
WORKDIR /tmp
RUN rm -Rf ams_latest AdobeMediaServer5_x64.tar.gz

VOLUME ["/opt/adobe/ams/applications"]

EXPOSE 80 1111 1935

CMD ["/usr/bin/supervisord"]
