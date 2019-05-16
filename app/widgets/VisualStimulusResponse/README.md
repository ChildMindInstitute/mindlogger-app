# Web View Widgets

React Native WebView does not handle local web sites well. Although using `require('web-src/index.html')` will bundle `index.html` properly, it does **not** bundle any JavaScript, CSS or other files referenced in that HTML file. Accordingly, at when you run the app those local referenced files will not be found.

As a workaround we can inline the CSS and JS files using the [inliner](https://github.com/remy/inliner) Node utility which is included as a dev dependency. You can run inliner from this directory with the following command:

```
npx inliner web-src/index.html > compressed.html
```

You must re-inline the JS and CSS every time you make a change in `web-src`.