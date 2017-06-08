# -*- coding: utf-8 -*-
from itertools import permutations
from hashlib import md5
from time import time
from random import shuffle, choice


class VoteCodeObfuscator(object):
    """Provides the obfuscation means for the interceptable traffic"""

    def __init__(self, options=None, variants=None):
        """provides basic interfaces for unit testing"""
        self.coded_options = None
        self.variants = variants
        self.options = options

    def encode_options(self):
        """Create pseudo-random option keys"""
        salted = []
        for i, opt in enumerate(self.options):
            salted.append(md5(str(i) + str(time())).hexdigest())
        self.coded_options = salted

    def create_variants(self):
        """Creates vote-code combinations"""
        temp_variants = []
        salted = [md5(o + str(time())).hexdigest() for o in self.options]
        for variant in permutations(salted):
            temp_variants.append(variant)
        self.variants = dict(zip(
                [md5(str(x)).hexdigest() for x in temp_variants],
                temp_variants))

    def deploy(self):
        """Returns a random variant for deployment"""
        key = choice(self.variants.keys())
        return {"key": key, "options": self.variants[key]}

    def decode(self, combination_key, coded_option):
        """Returns the decoded option code
        If the inputs are expired returns False"""
        if combination_key not in self.variants.keys():
            return False
        variant = self.variants[combination_key]
        if coded_option not in variant:
            return False
        return self.options[variant.index(coded_option)]
