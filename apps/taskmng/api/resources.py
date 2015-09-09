__author__ = 'njuice'
from tastypie.resources import ModelResource
from taskmng.models import *
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication
from django.contrib.auth.models import User
from social.apps.django_app.default.models import UserSocialAuth
from tastypie import fields
from tastypie.resources import ALL, ALL_WITH_RELATIONS


class UserResource(ModelResource):
    class Meta:
        list_allowed_methods = ['get']
        queryset = User.objects.all()
        resource_name = 'users'
        authentication = Authentication()
        authorization = Authorization()


class UserSocialResource(ModelResource):
    user = fields.ForeignKey(UserResource, attribute='user', full=True)

    class Meta:
        list_allowed_methods = ['get']
        queryset = UserSocialAuth.objects.all()
        resource_name = 'social_users'
        authentication = Authentication()
        authorization = Authorization()
        filtering = {
            'owner': ALL_WITH_RELATIONS,
        }


class TasksResource(ModelResource):
    owner = fields.ForeignKey(UserResource, attribute='owner', full=True)
    assigned_to = fields.ToManyField(UserResource, attribute='assigned_to',
                                     full=True)

    class Meta:
        queryset = Tasks.objects.all()
        resource_name = 'items'
        allowed_methods = ['get', 'post', 'put', 'delete']
        always_return_data = True
        authentication = Authentication()
        authorization = Authorization()
        filtering = {
            'owner': ALL_WITH_RELATIONS,
            'assigned_to': ALL_WITH_RELATIONS,
        }
