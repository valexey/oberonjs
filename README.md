# Oberon 07 compiler

Written in JavaScript (and partially in oberon and eberon itself) and translates Oberon to JavaScript code so it can be run in web browser.
Supports both "pure" and "plus extensions" mode. Pure mode is a strict implementation of original Oberon language report. Language [extensions](https://github.com/vladfolts/oberonjs/wiki/Eberon) implemented in my own way and available as a separate compiler mode.

## Quick start
You can try the compiler online [here](http://oberspace.dyndns.org/oberonjs.html).

To build it locally run "python build.py html" (Python 2.x or 3.x is required). It will make _out/os.js and _out/oberonjs.html. Open oberonjs.html in the browser and try the compiler!

