#!/bin/bash
for f in $(find sites/blog.bokken.io/articles -name "*.md"); do
  name=$(basename $f)
  dir=$(dirname $f)
  parent=$(echo $dir | awk -F/ '{ print $NF }')
  mkdir -p astro/src/content/blog/$parent
  ./scripts/pickup.py $f >astro/src/content/blog/$parent/$name
  # if img directory exists then copy it
  if [ -d $dir/img ]; then
    mkdir -p astro/src/content/blog/$parent/img
    cp -r $dir/img astro/src/content/blog/$parent
  fi
done
