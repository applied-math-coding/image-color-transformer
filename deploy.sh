rm -rf docs
mkdir docs
npm run build
cd dist
cp -r . ../docs
cd ..