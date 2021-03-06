# CAFO pollution

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

ABOUT
-----

This is a tarbell map project which uses a leaflet map to display data about pigs and pollution in Illinois. It uses a custom class to power a leaflet map (with a tiny little d3 timeline).

PIGS: The GEOJSON file in /data powers the shaded county map. It contains ~8 different data sets, but that was whittled by editors down to 5. The shaded counties are used as a way to illustrate hog density in Illinois. All that is needed is to know more red = more pigs.

POLLUTION: The dots on the map represent individual pollution events. The data is pulled from the Google spreadsheet by a Python function and deposited in an external JSON file (see the tarbell config). Each event has an associated collection of meta data (known as a "profile"). 

PROMO BLURB
-----------

There is an embeddable p2p promo blurb. It has a nifty gif. It's cool.

PUBLISHING
----------

The graphic is published using the normal tarbell command, and the blurb is published using a seperate script (the same as the industry charts). Both commands can be executed with the npm command `npm run publish`

MICKEY MOUSE
------------

                    .d88888888bo.
                  .d8888888888888b.
                  8888888888888888b
                  888888888888888888
                  888888888888888888
                   Y8888888888888888
             ,od888888888888888888P
          .'`Y8P'```'Y8888888888P'
        .'_   `  _     'Y88888888b
       /  _`    _ `      Y88888888b   ____
    _  | /  \  /  \      8888888888.d888888b.
   d8b | | /|  | /|      8888888888d8888888888b
  8888_\ \_|/  \_|/      d888888888888888888888b
  .Y8P  `'-.            d88888888888888888888888
 /          `          `      `Y8888888888888888
 |                        __    888888888888888P
  \                       / `   dPY8888888888P'
   '._                  .'     .'  `Y888888P`
      `"'-.,__    ___.-'    .-'
          `-._````  __..--'`
              ``````


Assumptions
-----------

* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)

Custom configuration
--------------------

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

Building front-end assets
-------------------------

This blueprint creates configuration to use [Grunt](http://gruntjs.com/) to build front-end assets.

When you create a new Tarbell project using this blueprint with `tarbell newproject`, you will be prompted about whether you want to use [Sass](http://sass-lang.com/) to generate CSS and whether you want to use  [Browserify](http://browserify.org/) to bundle JavaScript from multiple files.  Based on your input, the blueprint will generate a `package.json` and `Gruntfile.js` with the appropriate configuration.

After creating the project, run:

    npm install

to install the build dependencies for our front-end assets.

When you run:

    grunt

Grunt will compile `sass/styles.scss` into `css/styles.css` and bundle/minify `js/src/app.js` into `js/app.min.js`.

If you want to recompile as you develop, run:

    grunt && grunt watch

This blueprint simply sets up the the build tools to generate `styles.css` and `js/app.min.js`, you'll have to explicitly update your templates to point to these generated files.  The reason for this is to make you think about whether you're actually going to use an external CSS or JavaScript file and avoid a request for an empty file if you don't end up putting anything in your custom stylesheet or JavaScript file.

To add `app.min.js` to your template file:

    
    <script src="js/app.min.js"></script>
    