import os
import sys
import unittest
sys.path.append(os.path.join(os.path.dirname(__file__), '../app/'))

from lib.teamsconf import TeamConfig


TEST_CONF = """
[{ "name": "MegaTeam1", "spacer": true,
      "children": [
          { "name": "Team-1", "headcount": 100},
          { "name": "Team 3",
            "children": [
            { "name": "team 3"},
            { "name": "team 121"}]},
          { "name": "Team 4"}]},
    { "name": "Other", "ignore":true }]
"""

EXPECTED_TD = {
    '16d42d08368a0e2a42ca3179c7bb6c8f': {
        'ignore': False, 'headcount': 0, 'spacer': False,
        'parent': '38f746ae282f0473204e89ed26d6e336', 'name': u'team 121'},
    '78e853e8d12868a2db2a0c809a50f262': {
        'ignore': False, 'headcount': 0, 'spacer': False,
        'parent': '56b27cffe500f954d7fcd98ec895ba02', 'name': u'Team 4'},
    'fdf2bc5fd5c366ec3bfca9d75f489a5c': {
        'ignore': False, 'headcount': 0, 'spacer': False,
        'parent': '38f746ae282f0473204e89ed26d6e336', 'name': u'team 3'},
    '6311ae17c1ee52b36e68aaf4ad066387': {
        'ignore': True, 'headcount': 0, 'spacer': False,
        'parent': '', 'name': u'Other'},
    'd8f7299d2df7463a2b6febd0bc3554f6': {
        'ignore': False, 'headcount': 100, 'spacer': False,
        'parent': '56b27cffe500f954d7fcd98ec895ba02', 'name': u'Team-1'},
    '38f746ae282f0473204e89ed26d6e336': {
        'ignore': False, 'headcount': 0, 'spacer': False,
        'parent': '56b27cffe500f954d7fcd98ec895ba02', 'name': u'Team 3'},
    '56b27cffe500f954d7fcd98ec895ba02': {
        'ignore': False, 'headcount': 0, 'spacer': True,
        'parent': '', 'name': u'MegaTeam1'}}

EXPECTED_KEYS = [
    '16d42d08368a0e2a42ca3179c7bb6c8f',
    '78e853e8d12868a2db2a0c809a50f262',
    'fdf2bc5fd5c366ec3bfca9d75f489a5c',
    '6311ae17c1ee52b36e68aaf4ad066387',
    'd8f7299d2df7463a2b6febd0bc3554f6',
    '38f746ae282f0473204e89ed26d6e336',
    '56b27cffe500f954d7fcd98ec895ba02']

EXPECTED_PREF = [
    {'name': u'team 121', 'parent': '38f746ae282f0473204e89ed26d6e336',
     'ignore': False, 'spacer': False,
     'key': '16d42d08368a0e2a42ca3179c7bb6c8f', 'headcount': 0},
    {'name': u'Team 4', 'parent': '56b27cffe500f954d7fcd98ec895ba02',
     'ignore': False, 'spacer': False,
     'key': '78e853e8d12868a2db2a0c809a50f262', 'headcount': 0},
    {'name': u'team 3', 'parent': '38f746ae282f0473204e89ed26d6e336',
     'ignore': False, 'spacer': False,
     'key': 'fdf2bc5fd5c366ec3bfca9d75f489a5c', 'headcount': 0},
    {'name': u'Other', 'parent': '', 'ignore': True, 'spacer': False,
     'key': '6311ae17c1ee52b36e68aaf4ad066387', 'headcount': 0},
    {'name': u'Team-1', 'parent': '56b27cffe500f954d7fcd98ec895ba02',
     'ignore': False, 'spacer': False,
     'key': 'd8f7299d2df7463a2b6febd0bc3554f6', 'headcount': 100},
    {'name': u'Team 3', 'parent': '56b27cffe500f954d7fcd98ec895ba02',
     'ignore': False, 'spacer': False,
     'key': '38f746ae282f0473204e89ed26d6e336', 'headcount': 0},
    {'name': u'MegaTeam1', 'parent': '', 'ignore': False, 'spacer': True,
     'key': '56b27cffe500f954d7fcd98ec895ba02', 'headcount': 0}]


class BackEndTests(unittest.TestCase):
    def setUp(self):
        self.tc = TeamConfig(from_string=TEST_CONF)

    def tearDown(self):
        self.tc = None

    def test_init(self):
        self.assertEqual(self.tc.teams, EXPECTED_TD)

    def test_team_ids(self):
        self.assertEqual(self.tc.team_ids, EXPECTED_KEYS)

    def test_prefixes(self):
        self.assertEqual(self.tc.prefixes, EXPECTED_PREF)

    def test_headcount_set(self):
        self.assertEqual(
            self.tc.teams['d8f7299d2df7463a2b6febd0bc3554f6']['headcount'],
            100)

    def test_headcount_undefined(self):
        self.assertEqual(
            self.tc.teams['38f746ae282f0473204e89ed26d6e336']['headcount'], 0)


if __name__ == '__main__':
    unittest.main()
