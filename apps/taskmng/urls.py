__author__ = 'njuice'
from django.conf.urls import patterns, url
from taskmng import views


urlpatterns = patterns(
    '',
    url(r'tasks/$', views.tasks, name='tasks'),
)
