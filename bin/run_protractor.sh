#!/bin/sh
PORT=$1
USER=$2
PASSWORD=$3
npm run protractor -- --baseUrl=http://127.0.0.1:${PORT} --params.login.user=${USER} --params.login.password=${PASSWORD}
# run with directConnect = true:
#node_modules/protractor/bin/protractor --troubleshoot --baseUrl=http://127.0.0.1:${PORT} --params.login.user=${USER} --params.login.password=${PASSWORD}
