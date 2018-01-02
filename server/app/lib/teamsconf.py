# -*- coding: utf-8 -*-
import json
from hashlib import md5


class TeamConfig(object):
    """Flattens teams.json config into a digestable structure"""

    def __init__(self, from_file=None, from_string=None):
        self.teams = {}
        data = None
        if from_file:
            with open(from_file, "rb") as data_file:
                data = json.load(data_file)
        elif from_string:
            data = json.loads(from_string)
        if data:
            for root_node in data:
                self.__flatten(root_node)

    def __flatten(self, data, parent="", prefix=""):
        """
        Recursively flattens team config json and computes the md5 team UIDs.

        :param data: a data node to be flattened
        :param parent: optional, used by recursive call only
        :param prefix: optional, used by recursive call only
        """
        prefix = prefix + "." if len(prefix) > 0 else prefix
        key = md5(prefix + data["name"]).hexdigest()
        self.teams[key] = dict(
            name=data['name'], spacer=True if "spacer" in data else False,
            headcount=data['headcount'] if "headcount" in data else 0,
            ignore=True if "ignore" in data else False, parent=parent)
        if 'children' in data:
            for node in data['children']:
                self.__flatten(node, parent=key, prefix=prefix + data['name'])

    @property
    def prefixes(self):
        """
        Returns front-end compatible list of dicts for team config dropdown
        """
        return [dict(zip(t.keys() + ['key'], t.values() + [k]))
                for k, t in self.teams.iteritems()]

    @property
    def team_ids(self):
        """
        Returns a list of possible team UIDs
        """
        return self.teams.keys()
