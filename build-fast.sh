#!/bin/sh

PROCFILE="Procfile.tmp"
CHUNKS=$(nproc)

echo "" > $PROCFILE
for CHUNK in $(seq 1 $CHUNKS);
do
  echo "${CHUNK}of${CHUNKS}: yarn build --chunk $CHUNK --chunks $CHUNKS $*" >> $PROCFILE
done

yarn run nf -j "$PROCFILE" start

rm $PROCFILE
