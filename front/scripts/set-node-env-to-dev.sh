#!/bin/bash

# This is necessary because env variables set in docker compose file
# are valid only when NODE_ENV is set to development.
# When Production build is created, create-react-app set it to production


sed -i 's/NODE_ENV:\"production\"/NODE_ENV:\"development\"/g' ./build/static/js/*
