from django.urls import path, re_path

from dashboard.forms import ApplicantDetailsForm, UserEnrolInfoForm
from dashboard.views import EnrolWizard, ApplicationWizard, ProfileUpdateView, UserUpdateView
from dashboard.views import FORMS, APP_FORMS

app_name = 'dashboard'


enrol_wizard = EnrolWizard.as_view(FORMS,
    url_name='enrol_step', done_step_name='finished')

application_wizard = ApplicationWizard.as_view(APP_FORMS,
    url_name='application_step', done_step_name='completed')

urlpatterns = [
    path('enrol/<str:step>', enrol_wizard, name='enrol_step'),
    path('enrol/', enrol_wizard, name='enrol'),

    path('application/<str:step>', application_wizard, name='application_step'),
    path('application/', application_wizard, name='application'),
    path('profile/update/<int:pk>', ProfileUpdateView.as_view(), name='profile_update'),
    path('user_info/update/<int:pk>', UserUpdateView.as_view(), name='user_update'),
]