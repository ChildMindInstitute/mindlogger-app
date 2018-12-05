react-native bundle --platform android \
  --entry-file index.js \
  --dev false \
  --bundle-output ./android/main.jsbundle \
  --sourcemap-output ./android-sourcemap.json &&
  zip ./android-sourcemap.zip ./android-sourcemap.json

curl -X POST \
  https://api.instabug.com/api/sdk/v3/symbols_files \
  -H 'Postman-Token: 00a58bc1-cbb8-4444-b722-8a5299f9c8b3' \
  -H 'cache-control: no-cache' \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F file=@/Volumes/DATA/Erik/Projects/childmind/ab2cd-app/android-sourcemap.json \
  -F platform=react_native \
  -F os=android \
  -F application_token=de12937dca290605e0a66f106b5921bf
