from django.db import models

from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtailcloudinary.fields import CloudinaryField
from wagtailcloudinary.widgets import AdminCloudinaryChooser
from wagtailcloudinary.blocks import CloudinaryImageBlock


class HomePage(Page):
    template = 'home/home_page.html'
    max_count = 1
    why_get_skills = RichTextField(null=True, blank=True)
    ad_note = RichTextField(null=True, blank=True)
    what_you_will_learn = RichTextField(null=True, blank=True)
    image1 = CloudinaryField(null=True, blank=True)
    what_graduates_receive = RichTextField(null=True, blank=True)
    image2 = CloudinaryField(null=True, blank=True)
    content_panels = Page.content_panels + [
        FieldPanel('why_get_skills'),
        FieldPanel('ad_note'),
        FieldPanel('what_you_will_learn'),
        FieldPanel('image1', widget=AdminCloudinaryChooser),
        FieldPanel('what_graduates_receive'),
        FieldPanel('image2', widget=AdminCloudinaryChooser),
    ]

class About(Page):
    template = 'home/about.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = RichTextField(null=True, blank=True)
    contents = StreamField([
        ('content1', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content2', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content3', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content4', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content5', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content6', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content7', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content8', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content9', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        ('content10', blocks.StructBlock([
            ('title', blocks.CharBlock(required=False)),
            ('image', CloudinaryImageBlock(required=False)),
            ('text', blocks.RichTextBlock(required=False)),
        ])),
        
        ('more_text', blocks.RichTextBlock(required=False)),
    ], null=True, blank=True, use_json_field=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner', widget=AdminCloudinaryChooser),
        FieldPanel('intro'),
        FieldPanel('contents'),
    ]
