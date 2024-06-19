from django.urls import path

from dashboard.forms import ApplicantDetailsForm, UserEnrolInfoForm
from dashboard.views import EnrolWizard
from dashboard.views import FORMS

app_name = 'dashboard'

urlpatterns = [
    path('enrol/', EnrolWizard.as_view(FORMS, condition_dict={}), name='enrol'),
]