import os
import sys
import unittest
import tempfile
import json
from threading import Thread
import random
import time
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import app
SERVER_URL = "http://127.0.0.1:5000"


class BackEndTests(unittest.TestCase):

    def setUp(self):
        self.app = app.app.test_client()

    def tearDown(self):
        self.app = None

    def test_vote_post_no_team(self):
        rv = self.app.post('/vote', data={'option': 'opt1'})
        assert '{"message": "no team selected"}' in rv.data

    def test_vote_bad_team(self):
        rv = self.app.post('/vote/team3', data={'option': 'opt1'})
        assert '{"message": "selected team doesnt exist"}' in rv.data

    # def test_vote_post(self):
    #     rv = self.app.post('/vote/team1', data={'option': 'opt1'})
    #     assert '{"team_id": "team1", "live_scores": {"opt4": 0, "opt1": 1, "opt3": 0, "opt2": 0}}' in rv.data

    def test_vote_from_many_threads(self):
        votes_mirror = {'opt1': 0, 'opt2': 0, 'opt3': 0, 'opt4': 0}
        failed_connect = 0

        def start_server():
            app.app.run(threaded=True)

        def vote():
            opt = "opt" + str(random.randint(1, 4))
            votes_mirror[opt] += 1
            try:
                r = requests.post(
                    SERVER_URL + '/vote/team1',
                    data={'option': opt})
            except Exception as ex:
                # Assuming "ConnectionError":
                failed_connect += 1


        server_thread = Thread(target=start_server)
        new_votes = 50
        voting_threads = []

        try:
            server_thread.start()
            for i in range(new_votes):
                t = Thread(target=vote)
                voting_threads.append(t)
                t.start()
            all_done = False
            while not all_done:
                all_done = True
                for t in voting_threads:
                    if t.is_alive():
                        all_done = False
                        time.sleep(1)
        except Exception, ex:
            print 'Something went horribly wrong!', ex.message
        finally:
            server_thread._Thread__stop()
            for t in voting_threads:
                t._Thread__stop()
        # time to check the results
        # print votes_mirror
        print "failed connections: ", failed_connect
        # rv = requests.get(SERVER_URL + "/stats/team1")
        # print rv.json()
        rv = self.app.get('/api/stats/team1')
        assert votes_mirror == json.loads(rv.data)['live_scores']


if __name__ == '__main__':
    unittest.main()
