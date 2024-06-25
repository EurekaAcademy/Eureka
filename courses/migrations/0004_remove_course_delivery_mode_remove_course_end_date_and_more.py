# Generated by Django 4.2.8 on 2024-06-24 20:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0010_remove_registerprogramselection_program_and_more'),
        ('courses', '0003_alter_course_program_category_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='delivery_mode',
        ),
        migrations.RemoveField(
            model_name='course',
            name='end_date',
        ),
        migrations.RemoveField(
            model_name='course',
            name='program_type',
        ),
        migrations.RemoveField(
            model_name='course',
            name='start_date',
        ),
        migrations.RemoveField(
            model_name='courseschedule',
            name='delivery_mode',
        ),
        migrations.RemoveField(
            model_name='courseschedule',
            name='program_type',
        ),
        migrations.DeleteModel(
            name='DeliveryMode',
        ),
        migrations.DeleteModel(
            name='ProgramType',
        ),
    ]