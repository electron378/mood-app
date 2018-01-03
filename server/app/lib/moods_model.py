#!/usr/bin/env python
# coding: utf-8

# Copyright (c) 2016 Viktor Kravchenko <electron378@gmail.com>

# Distributed under the MIT software license, see the accompanying
# file LICENSE or https://opensource.org/licenses/MIT.

import os
import sqlite3
import json


class MoodsModel:
    ''' Does all that needs to be done with a votes database. '''
    def __init__(self, db_id, today, folder='./data'):
        ''' 1. Opens db connection.
         2. Create a db if it wasnt there.
         3. Loads the latest vote date '''
        self.today = today
        self.json_uri = os.path.join(folder, db_id.lower() + ".json")
        self.filename = os.path.join(folder, db_id.lower() + ".sqlite")
        self.db = sqlite3.connect(self.filename)
        self.cursor = self.db.cursor()
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS `moods` (
                `datestamp` TEXT UNIQUE,
                `opt1` INTEGER DEFAULT 0,
                `opt2` INTEGER DEFAULT 0,
                `opt3` INTEGER DEFAULT 0,
                `opt4` INTEGER DEFAULT 0,
                PRIMARY KEY(`datestamp`) )''')
        self.db.commit()
        self.cursor.execute('''SELECT * FROM moods
                ORDER BY datestamp DESC LIMIT 1;''')
        self.last_entry_date = None
        for row in self.cursor:
            self.last_entry_date = row[0]
        self.cursor = self.db.cursor()
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS `bads` (
                `datestamp` TEXT UNIQUE,
                `bads` TEXT DEFAULT 0,
                PRIMARY KEY(`datestamp`) )''')
        self.db.commit()

    def __del__(self):
        self.db.commit()
        self.db.close()

    def vote(self, vote_id):
        ''' Increments the score of the selected vote_id.
         Returns false if something went wrong. '''
        if self.last_entry_date != self.today:
            rq = "INSERT OR IGNORE INTO moods (datestamp) values ('{0}')"
            try:
                self.cursor.execute(rq.format(self.today))
                self.db.commit()
            except Exception as e:
                print e
                return False
            self.last_entry_date = self.today
        rq = "UPDATE moods SET {0} = {0} + 1 WHERE datestamp = '{1}'"
        try:
            self.cursor.execute(rq.format(vote_id, self.today))
            self.db.commit()
        except Exception as e:
            print e
            return False
        return True

    def save_old_bads(self, buff):
        rq = "INSERT OR IGNORE INTO bads (datestamp, bads) values (?, ?)"
        # only store if bads is not empty and a date change occured
        if len(buff['bads']) > 0 and buff['datestamp'] != self.today:
            self.cursor.execute(rq, (buff['datestamp'],
                                    json.dumps(buff['bads'])))
            self.db.commit()
            out = {'datestamp': self.today, 'bads': {}}
            # to prevent from repeatative insertion - reset the json buffer
            with open(self.json_uri, 'wb') as fh:
                json.dump(out, fh)
            return out
        return buff

    def get(self):
        rq = "SELECT * FROM moods WHERE datestamp = '{0}' LIMIT 1"
        try:
            self.cursor.execute(rq.format(self.today))
            for row in self.cursor:
                return row
        except Exception as e:
            return {"message": "db query failed, weird..."}

    def get_moods_for(self, start, stop):
        """Gets moods for a range of dates"""
        rq = """SELECT * FROM {} WHERE
                datestamp BETWEEN ? AND ? ORDER BY datestamp"""
        self.cursor.execute(rq.format('moods'), (start, stop))
        moods = self.cursor.fetchall()
        self.cursor.execute(rq.format('bads'), (start, stop))
        bads_raw = self.cursor.fetchall()
        bads = {}
        print bads_raw
        if len(bads_raw) > 0:
            for idx, x in enumerate(bads_raw):
                bads_raw[idx] = json.loads(x[1])
            for bad in bads_raw:
                for bk, bv in bad.iteritems():
                    if bk in bads:
                        bads[bk] += bv
                    else:
                        bads[bk] = bv
            # bads = reduce(lambda x, y:
            # dict((k, v + y[k]) for k, v in x.iteritems()), bads_raw)
        return moods, bads if len(bads) > 0 else None
