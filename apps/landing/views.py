from django.http import HttpResponse
from django.template import RequestContext, loader
from django.shortcuts import redirect


def index(request):
    """
        View for index page
        :param request:
        :return:
    """
    if request.user.is_authenticated():
        return redirect('/tasks/')
    else:
        template = loader.get_template('landing/index.html')
        context = RequestContext(request, {})
        return HttpResponse(template.render(context))
