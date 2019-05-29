clean:
	rm -fr .make.built .make.installed

install:
	cd stumptown && npm install && cd -
	cd client && yarn && cd -
	cd server && yarn && cd -
	cd cli && yarn && cd -
	touch .make.installed

build:
	ls .make.installed || make install
	cd stumptown && npm run build-json html/element && cd -
	cd client && yarn run build && cd -
	cd cli && yarn run run ../stumptown/packaged/html/elements/*.json && cd -
	touch .make.built

run-server:
	ls .make.built || make build
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
	cd stumptown && npm run build-json html/element && cd -
	cd cli && yarn run run ../stumptown/packaged/html/elements/*.json && cd -


.PHONY: clean install build run-server run-dev deployment-build build-content
