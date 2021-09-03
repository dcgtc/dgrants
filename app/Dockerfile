FROM node:slim

COPY . /app
WORKDIR /app

RUN apt update
RUN apt install git -y

RUN curl https://get.volta.sh | bash

RUN export VOLTA_HOME=$HOME/.volta
RUN export PATH=$VOLTA_HOME/bin:$PATH

#RUN npm install -g lerna yarn

#RUN yarn
#RUN yarn build
