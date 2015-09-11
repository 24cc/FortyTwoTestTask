__author__ = 'njuice'

from django.conf.urls import patterns, url
from taskmng import views


urlpatterns = patterns(
    '',
    url(r'tasks/$', views.tasks, name='tasks'),
    url(r'team/$', views.team, name='team'),
    url(r'invitable/$', views.invitable, name='invitable'),
    url(r'tm_invite/$', views.team_invitable, name='team_invitable'),
    url(r'current_user/', views.current_user, name='current_user'),
)
