from django.db import models

from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.shortcuts import render
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import (
    FieldPanel, FieldRowPanel,
    InlinePanel, MultiFieldPanel, PageChooserPanel
)
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.contrib.forms.models import AbstractEmailForm, AbstractFormField
from wagtail.contrib.forms.panels import FormSubmissionsPanel
from cloudinary.models import CloudinaryField
from courses.models import Course


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
        FieldPanel('image1'),
        FieldPanel('what_graduates_receive'),
        FieldPanel('image2'),
    ]

class About(Page):
    template = 'home/about.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = RichTextField(null=True, blank=True)
    contents = StreamField([
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
        FieldPanel('contents'),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super(About, self).get_context(request, *args, **kwargs)
        courses = Course.objects.all()
        context['courses'] = courses
        
        return context

class AboutProgram(Page):
    template = 'home/about-program.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    intro = RichTextField(null=True, blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('intro'),
    ]

class MeetLeadership(Page):
    template = 'home/meet-leadership.html'
    heading_title = models.CharField(max_length=500, null=True, blank=True)
    banner = CloudinaryField(null=True, blank=True, help_text='upload image banner to display.')
    contents = RichTextField(null=True, blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('heading_title'),
        FieldPanel('banner'),
        FieldPanel('contents'),
    ]


class GetInfoFormField(AbstractFormField):
    page = ParentalKey('GetInfoFormPage', on_delete=models.CASCADE, related_name='form_fields')


class GetInfoFormPage(AbstractEmailForm):
    template = 'home/get_info.html'
    intro = RichTextField(blank=True)
    thank_you_text = RichTextField(blank=True)

    content_panels = AbstractEmailForm.content_panels + [
        FormSubmissionsPanel(),
        FieldPanel('intro'),
        InlinePanel('form_fields', label="Form fields"),
        FieldPanel('thank_you_text'),
        MultiFieldPanel([
            FieldRowPanel([
                FieldPanel('from_address', classname="col6"),
                FieldPanel('to_address', classname="col6"),
            ]),
            FieldPanel('subject'),
        ], "Email"),
    ]

    def get_form_class_for_step(self, step):
        return self.form_builder(step.object_list).get_form_class()

    def serve(self, request, *args, **kwargs):
        """
        Implements a simple multi-step form.

        Stores each step into a session.
        When the last step is submitted correctly, saves the whole form into a DB.
        """

        session_key_data = 'form_data-%s' % self.pk
        is_last_step = False
        step_number = request.GET.get('p', 1)

        paginator = Paginator(self.get_form_fields(), per_page=1)
        try:
            step = paginator.page(step_number)
        except PageNotAnInteger:
            step = paginator.page(1)
        except EmptyPage:
            step = paginator.page(paginator.num_pages)
            is_last_step = True

        if request.method == 'POST':
            # The first step will be submitted with step_number == 2,
            # so we need to get a form from the previous step
            # Edge case - submission of the last step
            prev_step = step if is_last_step else paginator.page(step.previous_page_number())

            # Create a form only for submitted step
            prev_form_class = self.get_form_class_for_step(prev_step)
            prev_form = prev_form_class(request.POST, page=self, user=request.user)
            if prev_form.is_valid():
                # If data for step is valid, update the session
                form_data = request.session.get(session_key_data, {})
                form_data.update(prev_form.cleaned_data)
                request.session[session_key_data] = form_data

                if prev_step.has_next():
                    # Create a new form for a following step, if the following step is present
                    form_class = self.get_form_class_for_step(step)
                    form = form_class(page=self, user=request.user)
                else:
                    # If there is no next step, create form for all fields
                    form = self.get_form(
                        request.session[session_key_data],
                        page=self, user=request.user
                    )

                    if form.is_valid():
                        # Perform validation again for whole form.
                        # After successful validation, save data into DB,
                        # and remove from the session.
                        form_submission = self.process_form_submission(form)
                        del request.session[session_key_data]
                        # render the landing page
                        return self.render_landing_page(request, form_submission, *args, **kwargs)
            else:
                # If data for step is invalid
                # we will need to display form again with errors,
                # so restore previous state.
                form = prev_form
                step = prev_step
        else:
            # Create empty form for non-POST requests
            form_class = self.get_form_class_for_step(step)
            form = form_class(page=self, user=request.user)

        context = self.get_context(request)
        context['form'] = form
        context['fields_step'] = step
        return render(
            request,
            self.template,
            context
        )

@register_setting
class GetInfoFormSettings(BaseSiteSetting):
    get_info_form_page = models.ForeignKey(
        'wagtailcore.Page', null=True, on_delete=models.SET_NULL)

    panels = [
        # note the page type declared within the pagechooserpanel
        PageChooserPanel('get_info_form_page', ['home.GetInfoFormPage']),
    ]


class SubscribeFormField(AbstractFormField):
    page = ParentalKey('SubscribeFormPage', on_delete=models.CASCADE, related_name='form_fields')

class SubscribeFormPage(AbstractEmailForm):
    template = 'home/subscribe_form.html'
    intro = RichTextField(blank=True)
    thank_you_text = RichTextField(blank=True)
    content_panels = AbstractEmailForm.content_panels + [
        FormSubmissionsPanel(),
        FieldPanel('intro'),
        InlinePanel('form_fields', label="Form fields"),
        FieldPanel('thank_you_text'),
        MultiFieldPanel([
            FieldRowPanel([
                FieldPanel('from_address', classname="col6"),
                FieldPanel('to_address', classname="col6"),
            ]),
            FieldPanel('subject'),
        ], "Email"),
    ]

    def serve(self, request, *args, **kwargs):
        if request.method == 'POST':
            form = self.get_form(request.POST, page=self, user=request.user)

            if form.is_valid():
                self.process_form_submission(form)
                
                # Update the original landing page context with other data
                landing_page_context = self.get_context(request)
                landing_page_context['email'] = form.cleaned_data['email']

                return render(
                    request,
                    self.get_landing_page_template(request),
                    landing_page_context
                )
        else:
            form = self.get_form(page=self, user=request.user)

        context = self.get_context(request)
        context['form'] = form
        return render(
            request,
            self.get_template(request),
            context
        )

@register_setting
class SubscribeFormSettings(BaseSiteSetting):
    subscribe_form_page = models.ForeignKey(
        'wagtailcore.Page', null=True, on_delete=models.SET_NULL)

    panels = [
        # note the page type declared within the pagechooserpanel
        PageChooserPanel('subscribe_form_page', ['home.SubscribeFormPage']),
    ]