# Test HTML and CSS visually
If you want to make a visual test on the correct use of HTML tags, you can use the Water.css Bookmarklet which transforms the page into a basic style without any effect on the classes.
This allows you to visually see if there may be issues if only the correct use of the HTML TAGs being the page in a neutral environment.

## Link
<https://watercss.kognise.dev/>

## Bookmarklet
To be saved as a favorite url and check that it stays up to date.

```javascript
javascript:void%20function(){const%20a=a=%3Edocument.querySelectorAll(a),b=(a,b)=%3EObject.assign(document.createElement(a),b);a(%22link[rel=\%22stylesheet\%22],style%22).forEach(a=%3Ea.remove()),a(%22*%22).forEach(a=%3Ea.style=%22%22),document.head.append(b(%22link%22,{rel:%22stylesheet%22,href:%22//cdn.jsdelivr.net/npm/water.css%402/out/water.css%22}),!a(%22meta[name=\%22viewport\%22]%22).length%26%26b(%22meta%22,{name:%22viewport%22,content:%22width=device-width,initial-scale=1.0%22}))}();
```
