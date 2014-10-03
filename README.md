Requirements
============

[NodeJS](http://nodejs.org) and optionally [Vagrant](http://vagrantup.com)

Installation
============

Make sure that you have `grunt-cli` package installed and then run:

    npm install

This will add all dependencies for running grunt tasks.

Usage
=====

While developing it is handy to have a console with launched:

    grunt development
    
This will start grunt task to watch for less file changes and compile them into style.css

Remember to kill that task before performing final build.

Once you're done developing punch in:

    grunt default
    
And compressed CSS file will be created.

Vagrant
=======

There is a dead simple vagrant configuration provided if you do not want to clog your OS with HTTP server. Start it up by running:
 
    vagrant up
    
Server listens on `http://localhost:4567/` with DocumentRoot pointed to this directory (`NOT public/`)

There is absolutely nothing stored on VM so once you're done using it just destroy it using:
 
    vagrant destroy
    
Credits
=======

A long time ago, in a galaxy far, far away....

It is a period of civil war. Rebel
spaceships, striking from a hidden
base, have won their first victory
against the evil Galactic Empire.

During the battle, rebel spies managed
to steal secret plans to the Empire's
ultimate weapon, the DEATH STAR, an
armored space station with enough
power to destroy an entire planet.

Pursued by the Empire's sinister agents,
Princess Leia races home aboard her
starship, custodian of the stolen plans
that can save her people and restore
freedom to the galaxy....