from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
# Create your models here.
@register_snippet
class ProgramCategory(models.Model):
    program_category = models.CharField(max_length=500, null=True, blank=True)

    panels = [
        FieldPanel('program_category'),
    ]
    def __str__(self):
        return self.program_category
    
    class Meta:
        verbose_name_plural = "Program Categories"
    
@register_snippet
class DeliveryMode(models.Model):
    delivery_mode = models.CharField(max_length=500, null=True, help_text='e.g Online, In-person, etc')

    panels = [
        FieldPanel('delivery_mode'),
    ]
    def __str__(self):
        return self.delivery_mode
    
@register_snippet
class ProgramType(models.Model):
    program_type = models.CharField(max_length=500, null=True, help_text='e.g Full-time, Part-time, etc')

    panels = [
        FieldPanel('program_type'),
    ]
    def __str__(self):
        return self.program_type
    
@register_snippet
class Job(models.Model):
    title = models.CharField(max_length=500, null=True, help_text='Job title e.g. Data Analyst')
    description = RichTextField(null=True, blank=True)
    location = models.CharField(max_length=500, null=True, help_text='Job location e.g. Remote', blank=True)

    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
        FieldPanel('location'),
    ]
    def __str__(self):
        return self.title
    
@register_snippet
class SupportTeam(models.Model):
    title = models.CharField(max_length=500, null=True, help_text='e.g. Instructional team, Career services')
    description = RichTextField(null=True, blank=True)

    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
    ]
    def __str__(self):
        return self.title
    
class Course(Page):
    template = 'courses/course.html'
    course_title = models.CharField(max_length=500, null=True, blank=True)
    banner = models.ImageField(null=True, blank=True, help_text='upload image banner to display.')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    program_category = models.ForeignKey('ProgramCategory', on_delete=models.SET_NULL, null=True, blank=True)
    delivery_mode = models.ForeignKey('DeliveryMode', on_delete=models.SET_NULL, null=True, blank=True)
    program_type = models.ForeignKey('ProgramType', on_delete=models.SET_NULL, null=True, blank=True)
    introduction = RichTextField(null=True, blank=True)
    course_metric = StreamField([
        ('image', ImageChooserBlock(required=False)),
        ('metric', blocks.CharBlock(required=False)),
        ('text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True)
    course_metric1 = RichTextField(null=True, blank=True)
    course_metric2 = RichTextField(null=True, blank=True)
    course_metric3 = RichTextField(null=True, blank=True)
    program_benefit = RichTextField(null=True, blank=True)
    become_a_professional = RichTextField(null=True, blank=True)
    # skills = RichTextField(null=True, blank=True)
    # skills = StreamField([
    #     ('introduction', blocks.RichTextBlock(required=False, default='Add your content here')),
    #     ('skill_column1', blocks.RichTextBlock(required=False, default='Add your content here')),
    #     ('skill_column2', blocks.RichTextBlock(required=False, default='Add your content here')),
    # ], null=True, blank=True)
    projects = RichTextField(null=True, blank=True)
    course_model = RichTextField(null=True, blank=True)
    student_support = RichTextField(null=True, blank=True)
    jobs = StreamField([
        ('introduction', blocks.RichTextBlock(required=False)),
        ('job1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('job2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('job3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('job4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('job5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True)
    career_services = RichTextField(null=True, blank=True)
    testimonials = StreamField([
        ('intro', blocks.RichTextBlock(required=False)),
        ('person1', blocks.StructBlock([
            ('message', blocks.RichTextBlock(required=False)),
            ('first_name', blocks.CharBlock(required=False)),
            ('last_name', blocks.CharBlock(required=False)),
            ('personal_info', blocks.CharBlock(required=False)),
        ])),
        ('person2', blocks.StructBlock([
            ('message', blocks.RichTextBlock(required=False)),
            ('first_name', blocks.CharBlock(required=False)),
            ('last_name', blocks.CharBlock(required=False)),
            ('personal_info', blocks.CharBlock(required=False)),
        ])),
        ('paragraph', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True)
    faq = StreamField([
        ('faq1', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
        ('faq2', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
        ('faq3', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
        ('faq4', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
        ('faq5', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
        ('faq6', blocks.StructBlock([
            ('question', blocks.CharBlock(required=False)),
            ('answer', blocks.RichTextBlock(required=False)),
        ])),
    ], null=True, blank=True)
    how_to_apply = RichTextField(null=True, blank=True)
    course_schedule = RichTextField(null=True, blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('course_title'),
        FieldPanel('banner'),
        FieldPanel('start_date'),
        FieldPanel('end_date'),
        FieldPanel('program_category'),
        FieldPanel('delivery_mode'),
        FieldPanel('program_type'),
        FieldPanel('introduction'),
        FieldPanel('course_metric'),
        FieldPanel('course_metric1'),
        FieldPanel('course_metric2'),
        FieldPanel('course_metric3'),
        FieldPanel('program_benefit'),
        FieldPanel('become_a_professional'),
        # FieldPanel('skills'),
        FieldPanel('projects'),
        FieldPanel('course_model'),
        FieldPanel('student_support'),
        FieldPanel('jobs'),
        FieldPanel('career_services'),
        FieldPanel('testimonials'),
        FieldPanel('faq'),
        FieldPanel('how_to_apply'),
        FieldPanel('course_schedule'),
    ]

class Curriculum(Page):
    template = 'courses/curriculum.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = models.ImageField(null=True, blank=True, help_text='upload image banner to display.')
    intro = RichTextField(null=True, blank=True)
    modules = StreamField([
        ('introduction', blocks.RichTextBlock(required=False)),
        ('module1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module6', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module7', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module8', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module9', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module10', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module11', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module12', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module13', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module14', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module15', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module16', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module17', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module18', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module19', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('module20', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('duration', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
            ('what_you_will_learn', blocks.RichTextBlock(required=False)),
        ])),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True)

    course_tip_1 = RichTextField(null=True, blank=True)
    course_tip_2 = RichTextField(null=True, blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('intro'),
        FieldPanel('modules'),
        FieldPanel('course_tip_1'),
        FieldPanel('course_tip_2'),
    ]

class LocationSchedule(Page):
    template = 'courses/location-schedule.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    intro = RichTextField(null=True, blank=True, help_text='Enter the class schedule content')

    location = StreamField([
        ('intro', blocks.RichTextBlock(required=False)),
        ('location_image', ImageChooserBlock(required=False)),
        ('map_url', blocks.URLBlock(required=False)),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('intro'),
        FieldPanel('location'),
    ]

