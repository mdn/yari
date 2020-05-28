server: yarn workspace server start
typecheck: yarn workspace client tsc --noEmit --watch
web: yarn cross-env PORT=3000 yarn workspace client start
watchcontent: node content build --ensure-titles && node content build --watch
