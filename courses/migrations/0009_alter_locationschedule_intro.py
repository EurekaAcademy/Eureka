# Generated by Django 5.0.6 on 2024-05-31 17:57

import wagtail.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_alter_locationschedule_location'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationschedule',
            name='intro',
            field=wagtail.fields.RichTextField(blank=True, help_text='Enter the class schedule content', null=True),
        ),
    ]