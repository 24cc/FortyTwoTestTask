__author__ = 'njuice'

from django.http import HttpResponse
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core import serializers
import json
from taskmng.models import *
from social.apps.django_app.default.models import UserSocialAuth
import requests
import facebook


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


@login_required
def team(request):
    """
        Team page
        :param request:
        :return:
    """

    # Add new team
    if request.method == 'POST' and 'add_team' in request.POST:
        new_team = Teams(name=request.POST['name'], owner_id=request.user.id)
        new_team.save()

    team = Teams.objects.filter(owner_id=request.user.id)
    team = team[0] if team else team

    teammates = []

    if team:
        teammates = Teammates.objects.filter(team=team)

    template = loader.get_template('taskmng/team.html')
    context = RequestContext(request, {
        'request': request,
        'user': request.user,
        'team': team,
        'teammates': teammates
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


@login_required
def invitable(request):
    """
    Fetch invatable fb friends list
    :param request:
    :return:
    """
    social_data = UserSocialAuth.objects.filter(provider='facebook')\
        .get(user_id=request.user.id)
    auth_token = social_data.access_token
    graph = facebook.GraphAPI(auth_token, 2.4)
    friends = []
    response = graph.get_connections("me", 'invitable_friends')
    friends += response['data']
    if 'paging' in response and response['paging']['next']:
        while True:
            if 'next' in response['paging']:
                response = requests.get(response['paging']['next']).json()
                friends += response['data']
            else:
                break

    return HttpResponse(json.dumps(friends), content_type="application/json")


@login_required
def team_invitable(request):

    # Team realated for user
    team = Teams.objects.filter(owner_id=request.user.id)
    team = team[0] if team else team

    # Add / Delete item to teammates
    if request.POST and team:
        if request.POST['cmd'] == 'add':
            print request.POST['item'], team
            tm_user = json.loads(request.POST['item'])
            teammate = Teammates(user=User.objects.get(pk=tm_user['id']),
                                 team=team)
            teammate.save()
        elif request.POST['cmd'] == 'del':
            teammate = Teammates.objects.get(id=int(request.POST['tmId']))
            teammate.delete()

        return HttpResponse(json.dumps({'result': 'ok'}),
                            content_type="application/json")

    teammates_users = [request.user.id]
    if team:
        teammates = Teammates.objects.filter(team=team)
        for tm in teammates:
            teammates_users += [tm.user.id]

    team_invitable = User.objects.exclude(id__in=teammates_users)

    data = serializers.serialize("json",
                                 team_invitable,
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