#!/bin/bash
set -eo pipefail

SCRIPT_DIR=$(dirname $(realpath $0))
cd $SCRIPT_DIR

rm -rf layer_content.zip

docker build . -t python_layer_build_312 --platform linux/amd64 # --no-cache
docker run --rm --platform linux/amd64 -v $(pwd):/output python_layer_build_312
