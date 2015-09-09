__author__ = 'njuice'

from django.http import HttpResponse
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core import serializers
import json


@login_required
def tasks(request):
    """
        Main app page
        :param request:
        :return:
    """
    template = loader.get_template('taskmng/tasks.html')
    context = RequestContext(request, {
        'request': request,
        'user': request.user
    })
    return HttpResponse(template.render(context))


def current_user(request):
    """
    Return current user to angular app
    :param request:
    :return:
    """
    if request.user.is_authenticated():
        data = serializers.serialize("json",
                                     User.objects.filter(id=request.user.id),
                                     fields=('id',
                                             'password',
                                             'last_login',
                                             'is_superuser',
                                             'username',
                                             'first_name',
                                             'last_name',
                                             'email',
                                             'is_staff',
                                             'is_active'
                                             'date_joined'))

        return HttpResponse(data, content_type="application/json")
    else:
        return HttpResponse(json.dumps({'result': {'logged': False}}),
                            content_type="application/json")
