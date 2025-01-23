#!/bin/bash

# Get the file name
if [[ "$*" == *"--stdin-filepath"* ]]; then
  FILE=$(echo "$*" | grep -o '\--stdin-filepath [^ ]*' | cut -d' ' -f2)
  ARGS=$(echo "$@" | sed 's/--parser[= ][^ ]*//')
else
  FILE=$1
  shift
  ARGS=$(echo "$@" | sed 's/--parser[= ][^ ]*//')
fi

# Configure prettier options
PRETTIER_CMD="./node_modules/.bin/prettier"
SVELTE_OPTS="--parser=svelte --plugin=prettier-plugin-svelte"

# Apply formatting based on the file type
if [[ "${FILE##*.}" == "svelte" ]]; then
  [ -t 0 ] && cat "$FILE" | $PRETTIER_CMD $SVELTE_OPTS $ARGS || \
  cat | $PRETTIER_CMD $SVELTE_OPTS $ARGS
else
  [ -t 0 ] && cat "$FILE" | $PRETTIER_CMD $ARGS || \
  cat | $PRETTIER_CMD $ARGS
fi
