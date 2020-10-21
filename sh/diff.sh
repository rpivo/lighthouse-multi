npm run build;
echo "current published version:";
npm show lighthouse-multi version;
npx publish-diff --filter='{bin,src}/**';
