# -*- coding: utf-8 -*-
from flask import Flask, render_template, request
from flask_restful import Resource, Api, reqparse
import json
import os
import datetime
from multiprocessing import Lock

from lib.teamsconf import TeamConfig
from lib.votecoder import VoteCodeObfuscator
from lib.moods_model import MoodsModel

PATH_TO_CLIENT = "../../client/dist"
PATH_TO_TEAMCONF = "./config/teams.json"
PATH_TO_WHYBADCONF = "./config/default_why_bad.json"
PATH_TO_DATA = "./data/"

MOOD_OPTS = ['opt1', 'opt2', 'opt3', 'opt4']

app = Flask(__name__,
            static_folder=PATH_TO_CLIENT + '/static',
            template_folder=PATH_TO_CLIENT)
api = Api(app)
lock = Lock()


teams_conf = TeamConfig(from_file=PATH_TO_TEAMCONF)
with open(PATH_TO_WHYBADCONF, "rb") as wbfh:
    bads_opts = json.load(wbfh)['options']

moods_coder = VoteCodeObfuscator(MOOD_OPTS)
bads_coder = VoteCodeObfuscator([x['name'] for x in bads_opts])


# Things that do hard stuff (write IO)

def handle_day_change():
    """Does what should be done on start or a day change"""
    moods_coder.create_variants()
    bads_coder.create_variants()


def today():
    """Returns toda's datestamp"""
    return datetime.datetime.now().strftime("%Y-%m-%d")


def bads_update(options_list):
    """Updates today's bads top with +1s in the fields matching option_list"""


# End of hard stuff

def save_results(team, mood, whybads):
    print "team {} gets +1 in column {}".format(team, mood)
    print whybads

    if mood in MOOD_OPTS:
        lock.acquire()
        try:
            moods = MoodsModel(team, today())
            if moods.vote(mood):
                print("moods voted")
            else:
                print("failed to vote moods")
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
        out = dict(zip(['datestamp','opt1','opt2','opt3','opt4'], moods.get()))
        return out

handle_day_change()

api.add_resource(TeamConfig, '/api/set-team')
api.add_resource(Votes, '/api/vote')
api.add_resource(Stats, '/api/stats/<string:team_id>')


@app.route("/")
def static_index():
    return render_template('index.html', app_path="http://127.0.0.1:5000")

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
