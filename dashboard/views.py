from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from formtools.wizard.views import SessionWizardView, NamedUrlSessionWizardView, NamedUrlWizardView
from dashboard.forms import ApplicantDetailsForm, UserEnrolInfoForm, AboutCandidateForm, UserLocationForm, CandidateBackgroundForm
from courses.models import ProgramCategory
from django.urls import reverse, reverse_lazy
from dashboard.models import Profile, EducationLevel, AnnualIncome, YearsOfExperience, DegreeFocus, ComputerSkillLevel, StudyHoursPerWeek, Gender, Ethnicity, CitizenshipStatus, CourseSchedule
from authentication.models import User
from django.contrib.auth import authenticate, login
from django.shortcuts import get_object_or_404
from django.views.generic.edit import UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.mail import EmailMessage
from django.utils.http import urlsafe_base64_encode
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator


FORMS = [("program", ApplicantDetailsForm),
         ("bio", UserEnrolInfoForm)
        ]

TEMPLATES = {"program": "dashboard/enrol.html",
             "bio": "dashboard/enrol_bio.html"
            }

class EnrolWizard(NamedUrlSessionWizardView):
    def get_template_names(self):
        return [TEMPLATES[self.steps.current]]
    
    def get_step_url(self, step):
        return reverse('dashboard:enrol_step', kwargs={'step':step})
    
    def done(self, form_list, form_dict, **kwargs):
        form_dict={}
        for x in form_list:
            form_dict.update(dict(x.cleaned_data.items()))
        user = User.objects.create_user(email=form_dict['email'], password=form_dict['password1'])
        user.first_name = form_dict['first_name']
        user.last_name = form_dict['last_name']
        user.phone_number = form_dict['phone_number']
        user.save()
        login(self.request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        profile = Profile(user=user, schedule=form_dict['schedule'])
        profile.save()

        # current_site = get_current_site(self.request)
        # mail_subject = 'Eureka Data Academy: New Account Creation.'
        # message = render_to_string('authentication/activate_email.html'
        #                             , {
        #     'user': user,
        #     'domain': current_site.domain,
        #     'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        #     'token': default_token_generator.make_token(user),
        #     'protocol': 'https',
        # }
        # )
        # from_email = 'admin@shineintutoring.com'
        # to_email = form_dict['email']
        # email = EmailMessage(
        #     mail_subject, message, from_email, to=[to_email]
        # )
        # email.send()
        
        return render(self.request, 'dashboard/done.html', {
            'form_data': [form.cleaned_data for form in form_list],
        })
    
    def get_context_data(self, form, **kwargs):
        context = super().get_context_data(form=form, **kwargs)
        program_categories = ProgramCategory.objects.all()
        course_schedules = CourseSchedule.objects.all()
        context["program_categories"] = program_categories
        context["schedules"] = course_schedules
        return context
    

APP_FORMS = [("about", AboutCandidateForm),
         ("background", CandidateBackgroundForm),
         ("location", UserLocationForm),
        ]

APP_TEMPLATES = {"about": "dashboard/about_candidate.html",
             "background": "dashboard/applicant_background.html",
             "location": "dashboard/location.html"
            }

class ApplicationWizard(NamedUrlSessionWizardView):
    def get_template_names(self):
        return [APP_TEMPLATES[self.steps.current]]
    
    def get_step_url(self, step):
        return reverse('dashboard:application_step', kwargs={'step':step})
    
    def done(self, form_list, form_dict, **kwargs):
        form_dict={}
        for x in form_list:
            form_dict.update(dict(x.cleaned_data.items()))
        user = User.objects.filter(email=self.request.user.email).update(country=form_dict['country'], 
            region=form_dict['region'], city=form_dict['city'], residential_address = form_dict['residential_address']
            )
       
        profile = Profile.objects.filter(user=self.request.user).update(
            education_level=form_dict['education_level'], annual_income = form_dict['annual_income'],
            occupation = form_dict['occupation'], computer_skill_level=form_dict['computer_skill_level'],
            study_hours_per_week=form_dict['study_hours_per_week'], employment_status=form_dict['employment_status'], 
            have_a_laptop=form_dict['have_a_laptop'], gender=form_dict['gender'], ethnicity=form_dict['ethnicity'],
            citizenship_status=form_dict['citizenship_status'], date_of_birth=form_dict['date_of_birth']
            )
        # profile.save()
        return render(self.request, 'dashboard/finish.html', {
            'form_data': [form.cleaned_data for form in form_list],
        })
    
    def get_context_data(self, form, **kwargs):
        context = super().get_context_data(form=form, **kwargs)
        education_level = EducationLevel.objects.all()
        annual_income = AnnualIncome.objects.all()
        years_of_experience = YearsOfExperience.objects.all()
        degree_focus = DegreeFocus.objects.all()
        computer_skill_level = ComputerSkillLevel.objects.all()
        study_hours_per_week = StudyHoursPerWeek.objects.all()
        genders = Gender.objects.all()
        ethnicities = Ethnicity.objects.all()
        citizenship_status = CitizenshipStatus.objects.all()
        
        context["education_level"] = education_level
        context["annual_income"] = annual_income
        context["years_of_experience"] = years_of_experience
        context["degree_focus"] = degree_focus
        context["computer_skill_level"] = computer_skill_level
        context["study_hours_per_week"] = study_hours_per_week
        context["genders"] = genders
        context["ethnicities"] = ethnicities
        context["citizenship_status"] = citizenship_status
        return context
    
class ProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = Profile
    fields = ['date_of_birth','gender','ethnicity','citizenship_status', 'schedule', 'education_level', 'degree_focus', 'occupation', 'years_of_experience' , 'annual_income','computer_skill_level', 'study_hours_per_week', 'employment_status', 'have_a_laptop']
    template_name_suffix = "_update_form"
    success_url = reverse_lazy('dashboard:enrol')
    login_url = "authentication:login"
    redirect_field_name = "redirect_to"

class UserUpdateView(LoginRequiredMixin, UpdateView):
    model = User
    fields = ['first_name','last_name','email','phone_number','country','region','city','residential_address']
    template_name = 'dashboard/user_update_form.html'
    success_url = reverse_lazy('dashboard:enrol')
    login_url = "authentication:login"
    redirect_field_name = "redirect_to"
