#! /usr/bin/env bash
#set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
ts=`date "+%Y.%m%d.%H%M.%S"`

if ! command -v esbuild &> /dev/null; then
    npm install -g esbuild
fi
