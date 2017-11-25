#!/bin/sh
fuser -k 3000/tcp
pm2 stop random_story
git pull
pm2 start random_story

