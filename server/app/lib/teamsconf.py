# -*- coding: utf-8 -*-
import json
from hashlib import md5


class TeamConfig(object):
    """Flattens teams.json config into a digestable structure"""

    def __init__(self, from_file=None, from_string=None):
        self.prefixes = []
        data = None
        if from_file:
            with open(from_file, "rb") as data_file:
                data = json.load(data_file)
        elif from_string:
            data = json.loads(from_string)
        if data:
            for root_object in data["teams"]:
                self.recursive_fix_(root_object)
            self.team_ids = [x['key'] for x in self.prefixes]

    def recursive_fix_(self, a, prefix=""):
        """A helper function to navigate the nested teams"""
        prefix = prefix + "." if len(prefix) > 0 else prefix
        self.prefixes.append(dict(
            name=a['name'],
            key="ignore" if "ignore" in a else md5(
                prefix + a["name"]).hexdigest(),
            spacer=True if "spacer" in a else False))
        if "children" in a:
            prefix += a["name"]
            for node in a["children"]:
                self.recursive_fix_(node, prefix)
