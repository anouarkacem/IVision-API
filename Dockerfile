FROM node:8.9.2-alpine

# Create app directory
RUN mkdir -p /usr/src/imp
WORKDIR /usr/src/imp

# Install app dependencies
COPY package.json /usr/src/imp
RUN npm install

# Bundle app source
COPY . /usr/src/imp

# Create upload folder
RUN mkdir -p /usr/src/imp/files

EXPOSE 3000
CMD ["node", "." ]