#! /usr/bin/env bash
#set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
ts=`date "+%Y.%m%d.%H%M.%S"`
if [ ! -f "package-lock.json" ]; then
    ./init.sh
fi
rm -rvf dist
esbuild src/omljs.mjs --bundle --format=esm  --outfile=lib/omljs.mjs
esbuild src/omljs.mjs --bundle --format=iife --outfile=lib/omljs.js           --global-name=omljs
esbuild src/omljs.mjs --bundle --format=iife --outfile=untitled-0001/omljs.js --global-name=omljs
ls -ltrh ./lib
