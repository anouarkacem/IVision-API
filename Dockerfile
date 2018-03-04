FROM node:8.9.2-alpine

# Create app directory
RUN mkdir -p /usr/src/imp
WORKDIR /usr/src/imp

RUN apk --no-cache add cmake clang clang-dev make gcc g++ libc-dev linux-headers libx11 libpng bash git openssh musl-dev python2 python2-dev py-setuptools


# Install app dependencies
COPY package.json /usr/src/imp

# Bundle app source
COPY . /usr/src/imp

RUN npm install
# Create upload folder
RUN mkdir -p /usr/src/imp/files

EXPOSE 3000
CMD ["node", "." ]