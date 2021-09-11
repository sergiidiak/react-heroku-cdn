#!/bin/bash
# Debug, echo every command
#set -x

INDEX_PATH='build/index.html'
DYNAMIC_PUBLIC_URL_TEMPLATE='{{DYNAMIC_PUBLIC_URL}}'

if [ -f $INDEX_PATH ]; then
  echo "Injecting '$DYNAMIC_PUBLIC_URL_NAME' value '$DYNAMIC_PUBLIC_URL' into $INDEX_PATH by replacing the text '$DYNAMIC_PUBLIC_URL_TEMPLATE' (from .profile)"
  sed -iE "s,$DYNAMIC_PUBLIC_URL_TEMPLATE,$DYNAMIC_PUBLIC_URL,g" $INDEX_PATH
fi