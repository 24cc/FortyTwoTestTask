__author__ = 'njuice'

from social.backends.facebook import FacebookOAuth2


class CustomFacebookOAuth2(FacebookOAuth2):
    """
    New get_scope() method which add email
    and user_friends scopes to facebook app login dialog
    """
    def get_scope(self):
        scope = super(CustomFacebookOAuth2, self).get_scope()
        print scope
        scope = scope + ['email', 'user_friends']
        return scope
