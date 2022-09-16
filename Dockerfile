FROM circleci/openjdk:11-buster-browsers

RUN sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4EB27DB2A3B88B8B

RUN sudo apt-get update

RUN sudo apt-get install -y postgresql-client