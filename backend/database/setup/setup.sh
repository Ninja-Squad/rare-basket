#!/bin/bash

# creates the user and database for given environment
# this script must be executed by an admin user with peer authentication access.
# It can typically be executed from the root of the project using
# ENV=beta ./setup.sh


[ -z ${ENV} ] && echo "ENV variable is not set. Exiting" && exit 1

createuser "rarebasket_${ENV}" -P -e

createdb -O "rarebasket_${ENV}" "rarebasket_${ENV}"
createdb -O "rarebasket_${ENV}" "rarebasket_test_${ENV}"
