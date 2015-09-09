__author__ = 'njuice'

import requests
import hashlib
import hmac
import six
import time
import json


class MyPusher:
    """
    Own http pusher class
    """
    def __init__(self, app_id, key, secret):
        self.app_id = app_id
        self.key = key
        self.secret = secret
        self.request_url = 'http://api.pusherapp.com/apps/%s/events' % \
                           self.app_id
        self.headers = {'content-type': 'application/json'}

    def sign(self, string_to_sign):
        return six.text_type(
            hmac.new(
                self.secret.encode('utf8'),
                string_to_sign.encode('utf8'),
                hashlib.sha256
            ).hexdigest())

    def trigger(self, channel, event, data):
        data = {"name": event, "channels": [channel], "data": data}
        data = json.dumps(data)
        data_hash = six.text_type(hashlib.md5(data).hexdigest())
        string_to_sign = \
            "POST\n/apps/{0}/events\nauth_key={1}" \
            "&auth_timestamp={2}" \
            "&auth_version=1.0" \
            "&body_md5={3}".format(self.app_id,
                                   self.key,
                                   int(time.time()),
                                   data_hash)
        sign = self.sign(string_to_sign)

        url = self.request_url + \
            '?auth_key={0}' \
            '&auth_timestamp={1}' \
            '&auth_version=1.0' \
            '&body_md5={2}' \
            '&auth_signature={3}'.format(self.key,
                                         int(time.time()),
                                         data_hash,
                                         sign)

        requests.post(url, data=data, headers=self.headers)


if __name__ == '__main__':
    pusher = MyPusher(u'131903',
                      u'e749c59b174735416abe',
                      u'e6ac5822e09619a965fd')
    pusher.trigger(u'tasks-channel', u'tasks-changed', '{"some": "data"}')
