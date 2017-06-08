# Mood-App
This software helps to anonymously collect the measure of happiness
  and the reasons for unhappiness among employees.

People's mood at work is influenced by a variety of things like work-related
  success or fail stories, level of load, communication issues, it, etc. This
  tool will help to capture and track the mood/happiness dynamics in a team
  providing a bird-eye view so that a leadership team could reflect on its own
  performance but also help the teams in trouble by various means
  (e.g. balance load).

## Lottery feature
The application provides means to promote the participation and increase the
  general happiness buy giving out an individual within a team or group of teams
  a bonus voucher code, that can be exchanged for a gift. The application also
  implements basic means to prevent voucher mining. For instance, a team will
  be banned from the participation if a number of votes per day exceeds the
  expectation. This feature will be available shortly.

## Credits
This is an open source software distributed under the [MIT license](https://opensource.org/licenses/MIT).

The App is made of open-source components only. Here are the credits:

* The widget (that appears in the bottom-right corner) is based on pure [jQuery](https://jquery.org) ([MIT license](https://jquery.org/license/)) so it is plug-and-play compatible with most intranet web engines.
* This web page is based on [Angular.js](https://angularjs.org/) (MIT license)
* This web page also uses  https://github.com/js-cookie/js-cookie js-cookie  (MIT license) for the cookie-based event dispatcher (that drives the angular widgets)
* The mood option graphics (faces) are derived from  https://github.com/twitter/twemoji twemoji  (licensed by Twitter Inc under  https://creativecommons.org/licenses/by/4.0/ CC-BY 4.0 )
* Server-side is based on python libraries  http://flask.pocoo.org/docs/0.12/ flask  ( http://flask.pocoo.org/docs/0.12/license/#flask-license 3-clause BSD license) and its extension  https://flask-restful.readthedocs.io/en/0.3.5/ flask-restful ( https://github.com/flask-restful/flask-restful/blob/master/LICENSE 3-clause BSD license ).
* Server-side is productionized by [gunicorn](http://gunicorn.org/)([MIT license](https://github.com/benoitc/gunicorn/blob/master/LICENSE)).
