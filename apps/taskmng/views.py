from django.http import HttpResponse
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required


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
