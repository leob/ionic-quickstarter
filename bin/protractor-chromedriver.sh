#!/bin/sh
# http://stackoverflow.com/questions/31662828/how-to-access-chromedriver-logs-for-protractor-test/31840996#31840996
NODE_MODULES="$(dirname $0)/../node_modules"
# PATH TO CHROME DRIVER CHANGED - see: http://stackoverflow.com/a/39897937/2474068
#CHROMEDRIVER="${NODE_MODULES}/protractor/selenium/chromedriver"
CHROMEDRIVER="${NODE_MODULES}/protractor/node_modules/webdriver-manager/selenium/chromedriver_2.25"

#LOGFILE="_chromedriver.$$.log"
#LOG="_logs/$LOGFILE"
#LAST="_logs/_chromedriver.log"
#ln -s $LOGFILE $LAST

LOG="_logs/_chromedriver.log"

fatal() {
    # Dump to stderr because that seems reasonable
    echo >&2 "$0: ERROR: $*"
    # Dump to a logfile because webdriver redirects stderr to /dev/null (?!)
    echo >"${LOG}" "$0: ERROR: $*"
    exit 11
}

[ ! -x "$CHROMEDRIVER" ] && fatal "Cannot find chromedriver: $CHROMEDRIVER"

#exec "${CHROMEDRIVER}" --verbose --log-path="${LOG}" "$@"
exec "${CHROMEDRIVER}" --log-path="${LOG}" "$@"
