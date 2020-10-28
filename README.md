
# @allgemein/gitlab-api

[![Build Status](https://travis-ci.com/allgemein-node/gitlab-api.svg?branch=master)](https://travis-ci.com/allgemein-node/gitlab-api)
[![codecov](https://codecov.io/gh/allgemein-node/gitlab-api/branch/master/graph/badge.svg)](https://codecov.io/gh/allgemein-node/gitlab-api)
[![Dependency Status](https://david-dm.org/allgemein-node/gitlab-api.svg)](https://david-dm.org/allgemein-node/gitlab-api)


Based on https://gitlab.com/openstapps/gitlab-api

Docker test contiguration:

* see https://github.com/allgemein-node/gitlab-api/docker/testing/gitlab/README.adoc

## Development

First start development gitlab instance
``` 
docker-compose -f docker/testing/docker-compose.yml up
```

## Package

see module @allgemein/packaging
``` 
gulp package
gulp packagePublish
```
