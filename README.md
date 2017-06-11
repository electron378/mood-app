# Mood-App
This software helps to anonymously collect the measure of happiness
  and the reasons for unhappiness among employees.

People's mood at work is influenced by a variety of things like work-related
  success or fail stories, level of load, communication issues, it, etc. This
  tool will help to capture and track the mood/happiness dynamics in a team
  providing a bird-eye view so that a leadership team could reflect on its own
  performance but also help the teams in trouble by various means
  (e.g. balance load).

## Credits
This is an open source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

The App is made of open-source components only. Here are the credits:

* The widget (that appears in the bottom-right corner) is based on pure [jQuery](https://jquery.org) ([MIT license](https://jquery.org/license/)) so it is plug-and-play compatible with the majority of intranet web engines.
* This app intranet home page is based on [Angular.js](https://angularjs.org/) and uses  [js-cookie](https://github.com/js-cookie/js-cookie) for the cookie-expire-based event dispatch.
* The mood option graphics (faces) are derived from [twemoji](https://github.com/twitter/twemoji)(licensed by Twitter Inc under  [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/))
* The server-side is based on python [flask](http://flask.pocoo.org/docs/0.12/) and its extension [flask-restful](https://flask-restful.readthedocs.io/en/0.3.5/).
* The app is served by [gunicorn](http://gunicorn.org/)([MIT license](https://github.com/benoitc/gunicorn/blob/master/LICENSE)).
