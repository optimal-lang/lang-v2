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
esbuild src/omljs.mjs --bundle --format=iife --global-name=omljs --outfile=dist/omljs.js
esbuild src/omljs.mjs --bundle --format=iife --global-name=omljs --outfile=untitled-0001/omljs.js
ls -ltrh ./dist
