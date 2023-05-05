#!/bin/sh

CHUNKS=$(nproc)

for CHUNK in $(seq 1 $CHUNKS);
do
  yarn build --chunk $CHUNK --chunks $CHUNKS $* 2>&1 | sed "s/^/[$CHUNK\/$CHUNKS] /" &
  pids+=($!)
done

for pid in "${pids[@]}"; do
  wait $pid
done
