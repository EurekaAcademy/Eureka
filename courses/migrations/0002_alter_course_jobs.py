# Generated by Django 5.0.6 on 2024-05-29 23:53

import wagtail.blocks
import wagtail.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='jobs',
            field=wagtail.fields.StreamField([('introduction', wagtail.blocks.RichTextBlock(required=False)), ('job1', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False))])), ('job2', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False))])), ('job3', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False))])), ('job4', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False))])), ('job5', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False))])), ('more_text', wagtail.blocks.RichTextBlock(required=False))], blank=True, null=True),
        ),
    ]
