clean:
	rm -fr .make.built .make.installed client/build/titles.json
install:
	yarn
	cd stumptown && npm install && git checkout package-lock.json && cd -
	cd client && yarn && cd -
	cd server && yarn && cd -
	cd cli && yarn && cd -
	touch .make.installed
	# There has to exist a file called 'client/src/touchthis.js'
	ls .make.touchthis || echo "export default [];" >> client/src/touchthis.js
	touch .make.touchthis

build:
	ls .make.installed || make install
	cd stumptown && npm run build-json html && cd -
	cd client && yarn run build && cd -
	cd cli && yarn run run && cd -
	touch .make.built

run-server:
	ls .make.installed || make install
	#ls .make.built || make build
	cd server && yarn run start

run-dev:
	ls .make.built || make build
	cd client && BROWSER=none yarn run start

deployment-build:
	rm -fr .make.built
	CLI_BUILD_HTML=true make build
	echo "Directory 'client/build' is now fully formed and ready to serve statically"

build-content:
	ls .make.built || make build
	cd stumptown && npm run build-json html && cd -
	cd cli && yarn run run && cd -

watch-content:
	cd cli && yarn run run --watch "${STUMPTOWN_CONTENT_ROOT}"

build-json-server:
	cd cli && yarn run build-json-server

yarn-audit-all:
	ls .make.installed || make install
	./bin/yarn-audit-all.sh

test-client:
	cd client && yarn run test

.PHONY: clean install build run-server run-dev deployment-build build-content yarn-audit-all
