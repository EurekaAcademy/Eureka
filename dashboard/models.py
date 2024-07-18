from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet
from authentication.models import User
# Create your models here.
from courses.models import ProgramCategory, CourseSchedule
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


class Portal(Page):
    template = 'dashboard/portal.html'

    # @method_decorator(login_required)
    def get_context(self, request, *args, **kwargs):
        context = super(Portal, self).get_context(request, *args, **kwargs)
        if request.user:
            profile = Profile.objects.get(user=request.user)
            profile_total_fields = 13
            profile_empty_fields = profile.empty_fields_count
            profile_filled_fields = profile_total_fields - profile_empty_fields
            profile_percentage_progress = (profile_filled_fields)*100/profile_total_fields
            context['profile_percentage_progress'] = profile_percentage_progress
            context['profile_empty_fields'] = profile_empty_fields
            context['profile_filled_fields'] = profile_filled_fields
        return context


class RegisterProgramSelection(models.Model):
    # program = models.ForeignKey(ProgramCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_program_name')
    # start_date = models.CharField(max_length=500, null=True, blank=True)
    # program_type = models.ForeignKey(ProgramType, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_program_type')
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_schedule')

    panels = [
        # FieldPanel('program'),
        # FieldPanel('start_date'),
        # FieldPanel('program_type'),
        FieldPanel('schedule'),
    ]
    def __str__(self):
        return f'{self.schedule}'
    
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
    
@register_snippet
class EducationLevel(models.Model):
    level = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('level'),
    ]
    def __str__(self):
        return f'{self.level}'
    
@register_snippet
class AnnualIncome(models.Model):
    income = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('income'),
    ]
    def __str__(self):
        return f'{self.income}'

@register_snippet
class YearsOfExperience(models.Model):
    year = models.CharField(max_length=500,null=True, blank=True)
    panels = [
        FieldPanel('year'),
    ]
    def __str__(self):
        return f'{self.year}'
    
@register_snippet
class DegreeFocus(models.Model):
    degree = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('degree'),
    ]
    def __str__(self):
        return f'{self.degree}'
    
@register_snippet
class ComputerSkillLevel(models.Model):
    level = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('level'),
    ]
    def __str__(self):
        return f'{self.level}'
    
@register_snippet
class StudyHoursPerWeek(models.Model):
    hour = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('hour'),
    ]
    def __str__(self):
        return f'{self.hour}'
    
@register_snippet
class Gender(models.Model):
    type = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('type'),
    ]
    def __str__(self):
        return f'{self.type}'

@register_snippet
class Ethnicity(models.Model):
    name = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('name'),
    ]
    def __str__(self):
        return f'{self.name}'
    
@register_snippet
class CitizenshipStatus(models.Model):
    type = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('type'),
    ]
    def __str__(self):
        return f'{self.type}'
    
YES_NO = (
    ('Yes', 'Yes'),
    ('No', 'No')
)

class AboutCandidate(models.Model):
    education_level = models.ForeignKey(EducationLevel, on_delete=models.SET_NULL, null=True, blank=True)
    degree_focus = models.ForeignKey(DegreeFocus, on_delete=models.SET_NULL, null=True, blank=True)
    annual_income = models.ForeignKey(AnnualIncome, on_delete=models.SET_NULL, null=True, blank=True)
    occupation = models.CharField(max_length=500, null=True, blank=True)
    years_of_experience = models.ForeignKey(YearsOfExperience, on_delete=models.SET_NULL, null=True, blank=True)
    computer_skill_level = models.ForeignKey(ComputerSkillLevel, on_delete=models.SET_NULL, null=True, blank=True)
    study_hours_per_week = models.ForeignKey(StudyHoursPerWeek, on_delete=models.SET_NULL, null=True, blank=True)
    employment_status = models.CharField(max_length=500, choices=YES_NO, default='Yes')
    have_a_laptop = models.CharField(max_length=500, choices=YES_NO, verbose_name="Have a laptop?" , default='Yes')
    panels = [
        FieldPanel('education_level'),
        FieldPanel('occupation'),
        FieldPanel('degree_focus'),
        FieldPanel('annual_income'),
        FieldPanel('years_of_experience'),
        FieldPanel('computer_skill_level'),
        FieldPanel('study_hours_per_week'),
        FieldPanel('employment_status'),
        FieldPanel('have_a_laptop'),
    ]

    def __str__(self):
        return f'{self.education_level} {self.occupation}'
    
class CandidateBackground(models.Model):
    gender = models.ForeignKey(Gender, on_delete=models.SET_NULL, null=True, blank=True)
    ethnicity = models.ForeignKey(Ethnicity, on_delete=models.SET_NULL, null=True, blank=True)
    citizenship_status = models.ForeignKey(CitizenshipStatus, on_delete=models.SET_NULL, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    panels = [
        FieldPanel('date_of_birth'),
        FieldPanel('gender'),
        FieldPanel('ethnicity'),
        FieldPanel('citizenship_status'),
    ]

    def __str__(self):
        return f'{self.gender} {self.ethnicity}'
class Profile(models.Model):
    user = models.OneToOneField(User, null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="candidate")
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='program_schedule')
    education_level = models.ForeignKey(EducationLevel, on_delete=models.SET_NULL, null=True, blank=True)
    degree_focus = models.ForeignKey(DegreeFocus, on_delete=models.SET_NULL, null=True, blank=True)
    annual_income = models.ForeignKey(AnnualIncome, on_delete=models.SET_NULL, null=True, blank=True)
    occupation = models.CharField(max_length=500, null=True, blank=True)
    years_of_experience = models.ForeignKey(YearsOfExperience, on_delete=models.SET_NULL, null=True, blank=True)
    computer_skill_level = models.ForeignKey(ComputerSkillLevel, on_delete=models.SET_NULL, null=True, blank=True)
    study_hours_per_week = models.ForeignKey(StudyHoursPerWeek, on_delete=models.SET_NULL, null=True, blank=True)
    employment_status = models.CharField(max_length=500, choices=YES_NO, default='Yes')
    have_a_laptop = models.CharField(max_length=500, choices=YES_NO, verbose_name="Have a laptop?", default='Yes')

    # Applicant's background
    gender = models.ForeignKey(Gender, on_delete=models.SET_NULL, null=True, blank=True)
    ethnicity = models.ForeignKey(Ethnicity, on_delete=models.SET_NULL, null=True, blank=True)
    citizenship_status = models.ForeignKey(CitizenshipStatus, on_delete=models.SET_NULL, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    panels = [
        FieldPanel('user'),
        FieldPanel('date_of_birth'),
        FieldPanel('gender'),
        FieldPanel('ethnicity'),
        FieldPanel('citizenship_status'),
        FieldPanel('schedule'),
        FieldPanel('education_level'),
        FieldPanel('occupation'),
        FieldPanel('annual_income'),
        FieldPanel('computer_skill_level'),
        FieldPanel('study_hours_per_week'),
        FieldPanel('employment_status'),
        FieldPanel('have_a_laptop'),
    ]

    def __str__(self):
        return f'{self.user.email}'
    
    @property
    def empty_fields_count(self):
        fields = ["user", "date_of_birth", "gender", "ethnicity", "citizenship_status", "schedule", "education_level",
                   "occupation", "annual_income", "computer_skill_level","study_hours_per_week", "employment_status",
                   "have_a_laptop"]
        empty_values = {"", None}
        empty_values_count = 0

        for field in fields:
            field_value = getattr(self, field)
            if field_value in empty_values:
                empty_values_count += 1
        return empty_values_count