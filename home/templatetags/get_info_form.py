from django import template
from home.models import GetInfoFormSettings

register = template.Library()
# https://docs.djangoproject.com/en/4.2/howto/custom-template-tags/


@register.simple_tag(takes_context=True)
def info_form(context):
    request = context['request']
    info_form_settings = GetInfoFormSettings.for_request(request)
    info_form_page = info_form_settings.get_info_form_page.specific
    form = info_form_page.get_form(
        page=info_form_page, user=request.user)
    return {'page': info_form_page, 'form': form}