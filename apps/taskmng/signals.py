__author__ = 'njuice'

from django.db.models.signals import post_save, post_delete
from taskmng.models import Tasks
from own_pusher import *
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import m2m_changed


def pusher_worker(instance, created=None):
    pusher = MyPusher(u'131903',
                      u'e749c59b174735416abe',
                      u'e6ac5822e09619a965fd')
    task = Tasks.objects.filter(id=instance.id)
    assigned_to = task[0].assigned_to.all().values()
    task = task.values()[0]
    task['assigned_to'] = assigned_to if assigned_to else []
    task['owner'] = User.objects.filter(id=task['owner_id']).values()[0]
    if 'owner_id' in task:
        del task['owner_id']

    data = JSONRenderer().render({'method': 'save', 'task': task})
    data = unicode(data, 'utf-8')
    pusher.trigger(u'tasks-channel', u'tasks-changed', data)


@receiver(m2m_changed, sender=Tasks.assigned_to.through)
def related_changed(sender, **kwargs):
    if kwargs['action'] == 'post_add':
        instance = kwargs['instance']
        pusher_worker(instance)
    pass


@receiver(post_save, sender=Tasks)
def push_save(sender, instance, created=None, **kwargsm):
    pusher_worker(instance, created)


@receiver(post_delete, sender=Tasks)
def push_delete(sender, instance, created=None, **kwargsm):
    pusher = MyPusher(u'131903',
                      u'e749c59b174735416abe',
                      u'e6ac5822e09619a965fd')
    data = JSONRenderer().render({'task': {'id': instance.id},
                                  'method': 'delete'})
    data = unicode(data, 'utf-8')
    pusher.trigger(u'tasks-channel', u'tasks-changed', data)
