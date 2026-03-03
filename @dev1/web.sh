#! /usr/bin/env bash
set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
ts=`date "+%Y.%m%d.%H%M.%S"`
start python3 -m http.server 8080
sleep 3
start chrome http://localhost:8080/index.html
