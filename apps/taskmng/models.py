from django.db import models
from django.contrib.auth.models import User
import datetime


class Tasks(models.Model):
    class Meta:
        app_label = 'taskmng'
    owner = models.ForeignKey(User)
    text = models.TextField()
    due_to = models.DateField()
    completed = models.BooleanField(default=False)
    priority = models.IntegerField(default=0)
    assigned_to = models.ManyToManyField(User, related_name='assigned',
                                         blank=True)


class Teams(models.Model):
    class Meta:
        app_label = 'taskmng'
    owner = models.ForeignKey(User)
    name = models.TextField()
    created_at = models.DateField(default=datetime.datetime.now)


class Teammates(models.Model):
    class Meta:
        app_label = 'taskmng'
    team = models.ForeignKey(Teams)
    user = models.ForeignKey(User)
