from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from cloudinary.models import CloudinaryField

# Create your models here.
class Experience(Page):
    template = 'experience/experience.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = RichTextField(null=True, blank=True)
    features = StreamField([
        ('content1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content6', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content7', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content8', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content9', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content10', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('intro'),
        FieldPanel('features'),
    ]

class StudentSupport(Page):
    template = 'experience/student-support.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = StreamField([
        ('intro_text', blocks.RichTextBlock(required=False)),
        ('column1', blocks.RichTextBlock(required=False)),
        ('column2', blocks.RichTextBlock(required=False)),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    student_success = StreamField([
        ('title', blocks.CharBlock(required=False)),
        ('image', ImageChooserBlock(required=False)),
        ('text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('intro'),
        FieldPanel('student_success'),
    ]


class CareerServices(Page):
    template = 'experience/career-services.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    introduction = RichTextField(null=True, blank=True)
    career_building = StreamField([
        ('title', blocks.CharBlock(required=False)),
        ('intro_text', blocks.RichTextBlock(required=False)),
        ('path1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('path2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('path3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    ad = RichTextField(null=True, blank=True)
    career_services_glance = StreamField([
        ('title', blocks.CharBlock(required=False)),
        ('intro', blocks.RichTextBlock(required=False)),
        ('column1', blocks.RichTextBlock(required=False)),
        ('column2', blocks.RichTextBlock(required=False)),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    dedicated_support = StreamField([
        ('introduction', blocks.RichTextBlock(required=False)),
        ('support1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('support2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('support3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('support4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('support5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('support6', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    employment_readiness = StreamField([
        ('title', blocks.CharBlock(required=False)),
        ('intro', blocks.RichTextBlock(required=False)),
        ('column1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('column2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('description', blocks.RichTextBlock(required=False)),
        ])),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    future_support = StreamField([
        ('title', blocks.CharBlock(required=False)),
        ('image', ImageChooserBlock(required=False)),
        ('text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
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
    ], null=True, blank=True, use_json_field=True)
    
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('introduction'),
        FieldPanel('career_building'),
        FieldPanel('ad'),
        FieldPanel('career_services_glance'),
        FieldPanel('dedicated_support'),
        FieldPanel('employment_readiness'),
        FieldPanel('future_support'),
        FieldPanel('faq'),
    ]

class Classroom(Page):
    template = 'experience/classroom.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = StreamField([
        ('intro_text', blocks.RichTextBlock(required=False)),
        ('quote', blocks.RichTextBlock(required=False)),
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    class_features = StreamField([
        ('feature1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('feature2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('feature3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('feature4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('feature5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('feature6', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
    ], null=True, blank=True, use_json_field=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('intro'),
        FieldPanel('class_features'),
    ]