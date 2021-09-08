FROM circleci/openjdk:11-buster-browsers

RUN sudo apt-get update

RUN sudo apt-get install -y postgresql-client