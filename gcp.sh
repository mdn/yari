export ENV_FILE='.env.gcp'

bucket=${BUCKET:?}

# Clean.
rm -rf client/build

# Build.
echo "ENV_FILE=$ENV_FILE"
yarn build:sw
yarn build:prepare
yarn tool popularities
yarn build --locale en-us
yarn build --sitemap-index

# Deploy content.
gsutil -m rsync -d -r client/build/ "gs://${bucket}/"

# Deploy function.
set ENV_FILE=
cd gcp/function && npm i && npm run build-deploy-clean
