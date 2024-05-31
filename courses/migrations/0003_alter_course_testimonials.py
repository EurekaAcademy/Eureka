# Generated by Django 5.0.6 on 2024-05-30 11:48

import wagtail.blocks
import wagtail.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_alter_course_jobs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='testimonials',
            field=wagtail.fields.StreamField([('intro', wagtail.blocks.RichTextBlock(required=False)), ('person1', wagtail.blocks.StructBlock([('message', wagtail.blocks.RichTextBlock(required=False)), ('first_name', wagtail.blocks.CharBlock(required=False)), ('last_name', wagtail.blocks.CharBlock(required=False)), ('personal_info', wagtail.blocks.CharBlock(required=False))])), ('person2', wagtail.blocks.StructBlock([('message', wagtail.blocks.RichTextBlock(required=False)), ('first_name', wagtail.blocks.CharBlock(required=False)), ('last_name', wagtail.blocks.CharBlock(required=False)), ('personal_info', wagtail.blocks.CharBlock(required=False))])), ('paragraph', wagtail.blocks.RichTextBlock(required=False))], blank=True, null=True),
        ),
    ]
