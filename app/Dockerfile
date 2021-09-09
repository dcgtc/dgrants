FROM node:slim

RUN apt update
RUN apt install git -y

RUN curl https://get.volta.sh | bash

RUN export VOLTA_HOME=$HOME/.volta
RUN export PATH=$VOLTA_HOME/bin:$PATH
