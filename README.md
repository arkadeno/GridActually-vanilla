# Grid Actually

Grid Actually is a dynamic, expandable, animated grid of square images using a single sprite.

[See the live demo](http://arkadeno.github.io/GridActually-vanilla/gridactuallytest.html)

## Changes in this fork
- Converted to vanilla JS
- Added EventEmitter for event support
- Replaced grid images with 128x128px [UIfaces.com avatars](https://github.com/SahAssar/UIfaces)
- Adjusted grid box size

## Usage
###1)###
Make an image sprite comprised of 27 square 128x128 images arranged side-by-side into a single image that's 128px high and 3456px wide.

An example is included in this repository as "gridactuallysprite.png".

###2)###
Add the JS file, the CSS file, and the sprite to your favorite web page. Like...

```html
<script src="gridactually.js"></script>

<link rel="stylesheet" media="all" href="gridactually.css">
<img class="gridactually-image" src="gridactuallysprite.png">
```
## Huh. Why?
This grid was built for the homepage of Avocado, an app for people. And because the [ending of Love Actually](http://www.youtube.com/watch?v=iEQPXDGRaEk&t=2m37s) included an inspring design.
It was later forked and converted to vanilla JS by Arkade.no.

## Requirements
Browser: IE8 or newer.

## License
Grid Actually is freely distributable under the MIT license. See LICENSE.txt for full license.

