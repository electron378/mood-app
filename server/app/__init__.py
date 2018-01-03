# -*- coding: utf-8 -*-
# Standard imports
from flask import Flask, render_template, request
from flask_restful import Resource, Api, reqparse
import json
import os
from datetime import datetime
from multiprocessing import Lock

# App-specific imports
from lib.teamsconf import TeamConfig
from lib.votecoder import VoteCodeObfuscator
from lib.moods_model import MoodsModel

PATH_TO_TEAMCONF = "./config/teams.json"
PATH_TO_WHYBADCONF = "./config/default_why_bad.json"
PATH_TO_DATA = "./data/"
BASE_URL = ""
BASE_URL_DEV = "http://sim2/doors-export-dev"

MOOD_OPTS = ['opt1', 'opt2', 'opt3', 'opt4']

# App instanciacion and config
app = Flask(__name__)

#To serve statics via this app uncomment the below:
# PATH_TO_CLIENT = "../client/static-dist"
# app = Flask(__name__, static_folder=PATH_TO_CLIENT, static_url_path='/static' )

app.config['TEMPLATES_AUTO_RELOAD'] = True
app.base_url = BASE_URL
api = Api(app)
lock = Lock()


teams_conf = TeamConfig(from_file=PATH_TO_TEAMCONF)
with open(PATH_TO_WHYBADCONF, "rb") as wbfh:
    bads_opts = json.load(wbfh)['options']

moods_coder = VoteCodeObfuscator(MOOD_OPTS)
bads_coder = VoteCodeObfuscator([x['name'] for x in bads_opts])


def iso2str(year, week, day):
    return datetime.datetime.strptime("{0}.{1}.{2}".format(
            year, week, day), '%Y.%W.%w').date().isoformat()


def last_week(datestr):
    """
    Given a datestamp returns the range dates (Mon, Fri) of the previous week
    :param datestamp: a date string in YYYY-MM-DD fromat
    :rtype: returns a list of date-strings like ("2017-07-24", "2017-07-28")
    """
    iso_template = "{0}.{1}.{2}"
    today = datetime.datetime.strptime(datestr, "%Y-%m-%d").date()
    year, week, day = (today - datetime.timedelta(days=today.weekday(), weeks=1)).isocalendar()
    return iso2str(year, week, day), iso2str(year, week, day+4)



##############################################################################
def get_daily_bads(team):
    """Returns a dict of bads from the daily buffer (if any)"""
    filename = os.path.join(PATH_TO_DATA, team + '.json')
    bads_daily = None
    bads_out = {}
    try:
        with open(filename, 'r') as fh:
            bads_daily = json.load(fh)
    except:
        return None
    if not bads_daily:
        return None
    if bads_daily['datestamp'] == today() and len(bads_daily['bads']) > 0:
        total = sum([int(x) for x in bads_daily['bads'].itervalues()])
        for key, val in bads_daily['bads'].iteritems():
            bads_out[key] = int(val*100.0/total)
        return bads_out
    return None


def get_daily_stats(moods, team, headcount):
    """Given a MoodsModel object and headcount returns the daily mood."""
    moods_get = moods.get()
    if moods_get:
        daily = zip(MOOD_OPTS, moods_get[1:])
        out = []
        others = {'name': 'None', 'val': 100}
        total = 0
        for key, val in daily[::-1]:
            if val > 0:
                out.append({'name': key, 'val': int(int(val)*100/headcount)})
                others['val'] -= int(int(val)*100/headcount)
                total += int(val)
        out.append(others)
        daily = {'data': out, 'total': total}
        bads = get_daily_bads(team)
        if bads:
            daily['bads'] = bads
        return daily
    return None
##############################################################################


# Things that do hard stuff (write IO)

def handle_day_change():
    """Does what should be done on start or a day change"""
    moods_coder.create_variants()
    bads_coder.create_variants()


def today():
    """Returns today's datestamp"""
    return datetime.now().strftime("%Y-%m-%d")


def get_bads_from_buff(team):
    data = None
    try:
        fh = open(os.path.join(PATH_TO_DATA, team + '.json'), "r+")
        data = json.load(fh)
        if "datestamp" not in data:
            # bad data structure, ignore contents - make new insance
            data = {'datestamp': today(), 'bads': {}}
    except:
        data = {'datestamp': today(), 'bads': {}}
    return data


def update_bads_buff(team, bads_buff, bads):
    for key in bads:
        bads_buff['bads'][key] = bads_buff['bads'][key] + 1 if key in bads_buff['bads'] else 1
    with open(os.path.join(PATH_TO_DATA, team + '.json'), 'wb') as fh:
        json.dump(bads_buff, fh)


def save_results(team, mood, whybads):
    if mood in MOOD_OPTS:
        lock.acquire()
        try:
            datestamp = today()
            moods = MoodsModel(team, datestamp)
            voted = moods.vote(mood)
            if not voted:
                raise("Failed to record vote - really strange")
            # acquire bads buff anyways and save if it wants to be saved
            bads_buff = moods.save_old_bads(get_bads_from_buff(team))
            if mood == 'opt4' and len(whybads) > 0:
                update_bads_buff(team, bads_buff, whybads)
        finally:
            lock.release()


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response


class TeamConfig(Resource):
    """
    Provides interface for team selection.
    Team list is only updated on service restart.
    """

    def get(self):
        return {'team-options': teams_conf.prefixes}


class Votes(Resource):
    def get(self):
        moods_opts = moods_coder.deploy()
        bads_opts_kv = bads_coder.deploy()
        return {'mk': moods_opts["key"],
                'mv': moods_opts["options"],
                'wo': bads_opts,
                'wk': bads_opts_kv["key"],
                'wv': bads_opts_kv["options"]}

    def post(self):
        results = request.get_json()
        if results['team'] in teams_conf.team_ids:
            moods_score = moods_coder.decode(results['mk'], results['mv'])
            whybads = []
            if moods_score == "opt4":
                if 'wv' in results:
                    for wv in results['wv']:
                        whybads.append(bads_coder.decode(results['wk'], wv))
            save_results(results['team'], moods_score, whybads)
            return {"message": "vote accepted"}, 200
        else:
            return {'message': 'selected team doesnt exist'}, 409


class Stats(Resource):

    def get(self, team_id):
        """Returns curent vote statistics"""
        filename = os.path.join(PATH_TO_DATA, team_id + ".sqlite")
        if not os.path.isfile(filename):
            return {'message': 'selected team doesnt exist'}, 409
        moods = MoodsModel(team_id, today())
        headcount = teams_conf.teams[team_id]['headcount']
        if headcount < 1:
            return {'message': 'to see the team statistics here please ask'
                               ' your app admin to set the team headcount '
                               'first'}, 409
        stats = {}
        daily = get_daily_stats(moods, team_id, headcount)
        if daily:
            stats['daily'] = daily
        # do last week stats
        weekly_range = last_week(today())
        stats['weekly'] = {}
        stats['weekly']['range'] = " - ".join(weekly_range)
        stats['weekly']['mood'] = []
        opts = [0, 0, 0, 0]
        last_moods, last_bads = moods.get_moods_for(*weekly_range)
        for day in last_moods:
            opts[0] += day[4]
            opts[1] += day[3]
            opts[2] += day[2]
            opts[3] += day[1]
        total = headcount*5.0
        all_votes = sum(opts)
        for idx, opt in enumerate(opts):
            if opt > 0:
                stats['weekly']['mood'].append(
                    {'name': 'opt'+str(4-idx),
                     'val': int(opt*100.0/all_votes)})
        stats['weekly']['coverage'] = [
                {'name': 'opt1', 'val': int(all_votes*100.0/total)},
                {'name': 'None', 'val': (100 - int(all_votes*100.0/total))}]
        if last_bads:
            stats['weekly']['bads'] = last_bads
        return stats


handle_day_change()

api.add_resource(TeamConfig, '/api/set-team')
api.add_resource(Votes, '/api/vote')
api.add_resource(Stats, '/api/stats/<string:team_id>')


@app.route("/")
def static_index():
    return render_template('index.html', app_path=app.base_url)


if __name__ == '__main__':
    app.base_url = BASE_URL_DEV
    app.run(debug=True, host="0.0.0.0", threaded=True)
