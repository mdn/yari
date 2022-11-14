---
title: A page with some code
slug: Learn/Some_code
---
First some \<pre> blocks that are not peppered with HTML

```css
    * {box-sizing: border-box;}

    .wrapper > div {
        border-radius: 5px;
        background-color: rgb(207,232,220);
        padding: 1em;
    }
```

```html
<div class="wrapper">
    <div class="box1">One</div>
    <div class="box2">Two</div>
    <div class="box3">Three</div>
</div>
```

A real example found in the Kuma-HTML source.
What the original author should have done is it to put the (html escaped)
raw JS code in there. Not the HTML you get from Prism.

```js
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });

};
```
