from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet
from wagtail.fields import StreamField
from wagtail import blocks
from authentication.models import User
# Create your models here.
from courses.models import ProgramCategory
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from courses.models import Course



class Portal(Page):
    template = 'dashboard/portal.html'

    # @method_decorator(login_required)
    def get_context(self, request, *args, **kwargs):
        context = super(Portal, self).get_context(request, *args, **kwargs)
        profile = Profile.objects.get(user=request.user)
        profile_total_fields = 13
        profile_empty_fields = profile.empty_fields_count
        profile_filled_fields = profile_total_fields - profile_empty_fields
        profile_percentage_progress = (profile_filled_fields)*100/profile_total_fields
        context['profile_percentage_progress'] = profile_percentage_progress
        context['profile_empty_fields'] = profile_empty_fields
        context['profile_filled_fields'] = profile_filled_fields
        context['profile'] = profile
        return context

    
    

@register_snippet
class CourseLevel(models.Model):
    level = models.CharField(max_length=500, null=True, blank=True)
    panels = [
        FieldPanel('level'),
    ]
    def __str__(self):
        return f'{self.level}'
    
@register_snippet
class Pricing(models.Model):
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing_course')
    course_level = models.ForeignKey(CourseLevel, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedule_course')
    content = StreamField([
        ('content1', blocks.CharBlock(required=False)),
        ('content2', blocks.CharBlock(required=False)),
        ('content3', blocks.CharBlock(required=False)),
        ('content4', blocks.CharBlock(required=False)),
        ('content5', blocks.CharBlock(required=False)),
        ('content6', blocks.CharBlock(required=False)),
        ('content7', blocks.CharBlock(required=False)),
        ('content8', blocks.CharBlock(required=False)),
        ('content9', blocks.CharBlock(required=False)),
        ('content10', blocks.CharBlock(required=False)),
        ('content11', blocks.CharBlock(required=False)),
        ('content12', blocks.CharBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    panels = [
        FieldPanel('course'),
        FieldPanel('course_level'),
        FieldPanel('price'),
        FieldPanel('content'),
    ]
    def __str__(self):
        return f'{self.price} {self.course} {self.course_level}'

@register_snippet
class CourseSchedule(models.Model):
    course = models.ForeignKey(Pricing, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedule_course')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    days = models.CharField(max_length=500, null=True, blank=True, help_text='e.g. Monday, Tuesday, Wednesday')
    time = models.CharField(max_length=500, null=True, blank=True, help_text='e.g. 6:30 PM Eastern Standard Time')

    panels = [
        FieldPanel('course'),
        FieldPanel('start_date'),
        FieldPanel('end_date'),
        FieldPanel('days'),
        FieldPanel('time'),
    ]
    def __str__(self):
        return f'{self.course.course.program_category}-{self.course.course_level}: {self.start_date} for {self.days} at {self.time}'

class RegisterProgramSelection(models.Model):
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrol_schedule')

    panels = [
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
    
@register_snippet
class PaymentPlan(models.Model):
    type = models.CharField(max_length=500, null=True, blank=True)
    value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Enter the percentage of the payment to make')
    duration_in_days = models.IntegerField(null=True, blank=True, help_text='Enter the payment duration')
    panels = [
        FieldPanel('type'),
        FieldPanel('value'),
        FieldPanel('duration_in_days'),
    ]
    def __str__(self):
        return f'{self.type}'


class PaymentPlanWidget(models.Model):
    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_plan_schedule')
    panels = [
        FieldPanel('payment_plan'),
    ]
    def __str__(self):
        return f'{self.payment_plan}'
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
    payment_plan_selection_completed = models.BooleanField(default=False)
    payment_completed = models.BooleanField(default=False)
    payment_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amount_to_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
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
        FieldPanel('payment_completed'),
        FieldPanel('payment_plan_selection_completed'),
        FieldPanel('payment_balance'),
        FieldPanel('amount_to_pay'),
    ]

    def __str__(self):
        return f'{self.user.first_name}'
    
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