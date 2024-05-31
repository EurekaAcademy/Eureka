# Generated by Django 5.0.6 on 2024-05-31 20:57

import wagtail.blocks
import wagtail.fields
import wagtail.images.blocks
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0002_remove_about_contents'),
    ]

    operations = [
        migrations.AddField(
            model_name='about',
            name='contents',
            field=wagtail.fields.StreamField([('content1', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content2', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content3', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content4', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content5', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content6', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content7', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content8', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content9', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('content10', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('image', wagtail.images.blocks.ImageChooserBlock(required=False)), ('text', wagtail.blocks.RichTextBlock(required=False))])), ('more_text', wagtail.blocks.RichTextBlock(required=False))], blank=True, null=True),
        ),
    ]
