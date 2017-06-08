#!/usr/bin/env python
# coding: utf-8

# Copyright (c) 2016 Viktor Kravchenko <electron378@gmail.com>

# Distributed under the MIT software license, see the accompanying
# file LICENSE or https://opensource.org/licenses/MIT.

import os
import sqlite3


class MoodsModel:
    ''' Does all that needs to be done with a votes database. '''
    def __init__(self, db_id, today, folder='./data'):
        ''' 1. Opens db connection.
         2. Create a db if it wasnt there.
         3. Loads the latest vote date '''
        self.today = today
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
