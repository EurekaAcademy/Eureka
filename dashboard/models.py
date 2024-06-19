from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet
# Create your models here.
from courses.models import ProgramCategory, ProgramType, DeliveryMode, CourseSchedule
class Enrol(Page):
    # template = 'dashboard/enrol.html'


    def get_context(self, request, *args, **kwargs):
        """Adding custom stuff to our context."""
        context = super().get_context(request, *args, **kwargs)
        
        program_categories = ProgramCategory.objects.all()
        program_types = ProgramType.objects.all()
        delivery_mode = DeliveryMode.objects.all()
        course_schedules = CourseSchedule.objects.all()
        
        context["program_categories"] = program_categories
        context["program_types"] = program_types
        context["delivery_mode"] = delivery_mode
        context["schedules"] = course_schedules
        return context



class RegisterProgramSelection(models.Model):
    program = models.ForeignKey(ProgramCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_program_name')
    start_date = models.CharField(max_length=500, null=True, blank=True)
    program_type = models.ForeignKey(ProgramType, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_program_type')
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_schedule')

    panels = [
        FieldPanel('program'),
        FieldPanel('start_date'),
        FieldPanel('program_type'),
        FieldPanel('schedule'),
    ]
    def __str__(self):
        return f'{self.program} at {self.start_date}'
    
class UserEnrolInfo(models.Model):
    first_name = models.CharField(max_length=500, null=True, blank=True)
    last_name = models.CharField(max_length=500, null=True, blank=True)
    email = models.EmailField(max_length=500, null=True, blank=True)
    phone_number = models.CharField(max_length=500, null=True, blank=True)

    panels = [
        FieldPanel('first_name'),
        FieldPanel('last_name'),
        FieldPanel('email'),
        FieldPanel('phone_number'),
    ]
    def __str__(self):
        return f'{self.first_name} {self.last_name}'