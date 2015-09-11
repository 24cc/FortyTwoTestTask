from django.utils import unittest
from django.test.client import Client
from django.contrib.auth.models import User


# Create your tests here.
class LandingTests(unittest.TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()
        self.user = User.objects.create_user(username='test', password='test')
        self.user.is_superuser = True
        self.user.save()

    def test_index_only_for_auth(self):
        """
            Show index page only for non-authorized users
        """
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

        self.client.login(username="test", password="test")
        response = self.client.get("/")

        self.assertEqual(response.status_code, 302)
