#!/bin/sh

PROCFILE="Procfile.tmp"
CHUNKS=$(nproc)

echo "cleanup: rm $PROCFILE" > $PROCFILE
for CHUNK in $(seq 1 $CHUNKS);
do
  echo "${CHUNK}of${CHUNKS}: yarn build --chunk $CHUNK --chunks $CHUNKS $*" >> $PROCFILE
done

npx nf -j "$PROCFILE" start

