# Generated by Django 5.0.6 on 2024-05-30 21:50

import wagtail.blocks
import wagtail.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_alter_course_testimonials'),
    ]

    operations = [
        migrations.RenameField(
            model_name='curriculum',
            old_name='body',
            new_name='intro',
        ),
        migrations.AddField(
            model_name='curriculum',
            name='banner',
            field=models.ImageField(blank=True, help_text='upload image banner to display.', null=True, upload_to=''),
        ),
        migrations.AddField(
            model_name='curriculum',
            name='heading_title',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='curriculum',
            name='modules',
            field=wagtail.fields.StreamField([('introduction', wagtail.blocks.RichTextBlock(required=False)), ('module1', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module2', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module3', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module4', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module5', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module6', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module7', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module8', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module9', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module10', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module11', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module12', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module13', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module14', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module15', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module16', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module17', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module18', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module19', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('module20', wagtail.blocks.StructBlock([('title', wagtail.blocks.CharBlock(required=False)), ('description', wagtail.blocks.RichTextBlock(required=False)), ('what_you_will_learn', wagtail.blocks.RichTextBlock(required=False))])), ('more_text', wagtail.blocks.RichTextBlock(required=False))], blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='course',
            name='faq',
            field=wagtail.fields.StreamField([('faq1', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))])), ('faq2', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))])), ('faq3', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))])), ('faq4', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))])), ('faq5', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))])), ('faq6', wagtail.blocks.StructBlock([('question', wagtail.blocks.CharBlock(required=False)), ('answer', wagtail.blocks.RichTextBlock(required=False))]))], blank=True, null=True),
        ),
    ]
