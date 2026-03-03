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
esbuild src/mylib.mjs --bundle --format=iife --global-name=mylib --outfile=dist/mylib.js
ls -ltrh ./dist
