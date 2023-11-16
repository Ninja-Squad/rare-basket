This directory contains files used in the SCSS files (for example `background-image: url('../../media/background.jpg');`).

They're processed by the build by copying them to a media directory and adding a hash to their name to enable cache busting.

We don't store them in assets because if we do that, then the image is copied twice: once in the assets, 
and once in the media.
