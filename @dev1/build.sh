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
esbuild src/mylib.mjs --bundle --format=iife   --outfile=dist/mylib.js --global-name=mylib
esbuild src/mylib.mjs --bundle --format=esm --outfile=dist/mylib.mjs
ls -ltrh ./dist
