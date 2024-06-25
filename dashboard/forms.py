from django import forms
from dashboard.models import RegisterProgramSelection, UserEnrolInfo, AboutCandidate, CandidateBackground
from django.forms.models import BaseInlineFormSet, inlineformset_factory
from django.forms import modelformset_factory
from authentication.models import User
from django.contrib.auth.forms import UserCreationForm

class ApplicantDetailsForm(forms.ModelForm):
    class Meta:
        model = RegisterProgramSelection
        fields = ('schedule',)

class UserEnrolInfoForm(UserCreationForm):
    class Meta:
        model = User
        fields =('first_name','last_name','email','phone_number')

    def save(self, commit=True):
        user = super(UserEnrolInfoForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user
    
class AboutCandidateForm(forms.ModelForm):
    class Meta:
        model = AboutCandidate
        fields = ('education_level', 'degree_focus', 'occupation', 'years_of_experience' , 'annual_income','computer_skill_level', 'study_hours_per_week', 'employment_status', 'have_a_laptop')

class CandidateBackgroundForm(forms.ModelForm):
    class Meta:
        model = CandidateBackground
        fields = ('date_of_birth','gender','ethnicity','citizenship_status')

class UserLocationForm(forms.ModelForm):
    class Meta:
        model = User
        fields =('country','region','city','residential_address')
