from django.test import TestCase

from songs.tests import SongTest

# test.py
def application(env, start_response):
    start_response('200 OK', [('Content-Type','text/html')])
    return "Hello World"