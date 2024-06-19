from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from formtools.wizard.views import SessionWizardView
from dashboard.forms import ApplicantDetailsForm, UserEnrolInfoForm
from courses.models import ProgramCategory, ProgramType, DeliveryMode, CourseSchedule

FORMS = [("program", ApplicantDetailsForm),
         ("bio", UserEnrolInfoForm)
        ]

TEMPLATES = {"program": "dashboard/enrol.html",
             "bio": "dashboard/enrol_bio.html"
            }

class EnrolWizard(SessionWizardView):
    def get_template_names(self):
        return [TEMPLATES[self.steps.current]]
    
    def done(self, form_list, **kwargs):
        return render(self.request, 'dashboard/done.html', {
            'form_data': [form.cleaned_data for form in form_list],
        })
    
    def get_context_data(self, form, **kwargs):
        context = super().get_context_data(form=form, **kwargs)
        program_categories = ProgramCategory.objects.all()
        program_types = ProgramType.objects.all()
        delivery_mode = DeliveryMode.objects.all()
        course_schedules = CourseSchedule.objects.all()
        
        context["program_categories"] = program_categories
        context["program_types"] = program_types
        context["delivery_mode"] = delivery_mode
        context["schedules"] = course_schedules
        return context