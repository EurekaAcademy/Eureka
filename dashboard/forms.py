from django import forms
from dashboard.models import RegisterProgramSelection, UserEnrolInfo
from django.forms.models import BaseInlineFormSet, inlineformset_factory
from django.forms import modelformset_factory

class ApplicantDetailsForm(forms.ModelForm):
    class Meta:
        model = RegisterProgramSelection
        fields = ('program','start_date','program_type','schedule')

class UserEnrolInfoForm(forms.ModelForm):
    class Meta:
        model = UserEnrolInfo
        fields =('first_name','last_name','email','phone_number')

# AcademicQualificationFormSet = inlineformset_factory(Member,AcademicInstitution,form=AcademicQualificationForm,fields=['institution','date_from','date_to','achievements'],extra=1,can_delete=True)