Massive temporary hack:

```bash
cd yari
cp copy/community/index.md ../curriculum/curriculum/
yarn build:curriculum
```

This will build into `client/build/en-us/curriculum/index/index.json`, open that
file:

```bash
code client/build/en-us/curriculum/index/index.json
```

Format the file, then manually update all the wrong references to curriculum:
alternatively, if you've only changed the sections just copy the `body` key into
`copy/community/index.json`.
