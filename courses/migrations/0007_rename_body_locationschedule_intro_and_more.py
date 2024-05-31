# Generated by Django 5.0.6 on 2024-05-31 01:00

import wagtail.blocks
import wagtail.fields
import wagtail.images.blocks
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_curriculum_course_tip_1_curriculum_course_tip_2'),
    ]

    operations = [
        migrations.RenameField(
            model_name='locationschedule',
            old_name='body',
            new_name='intro',
        ),
        migrations.AddField(
            model_name='locationschedule',
            name='heading_title',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='locationschedule',
            name='location',
            field=wagtail.fields.StreamField([('intro', wagtail.blocks.RichTextBlock(required=False)), ('location_image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('map_url', wagtail.blocks.CharBlock(required=False)), ('more_text', wagtail.blocks.RichTextBlock(required=False))], blank=True, null=True),
        ),
    ]