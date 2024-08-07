# Generated by Django 4.2.8 on 2024-07-23 10:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0011_courselevel_pricing'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='payment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='profile_payment', to='dashboard.pricing'),
        ),
        migrations.CreateModel(
            name='CourseSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField(blank=True, null=True)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('days', models.CharField(blank=True, help_text='e.g. Monday, Tuesday, Wednesday', max_length=500, null=True)),
                ('time', models.CharField(blank=True, help_text='e.g. 6:30 PM Eastern Standard Time', max_length=500, null=True)),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='schedule_course', to='dashboard.pricing')),
            ],
        ),
        migrations.AlterField(
            model_name='profile',
            name='schedule',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='program_schedule', to='dashboard.courseschedule'),
        ),
        migrations.AlterField(
            model_name='registerprogramselection',
            name='schedule',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='enrol_schedule', to='dashboard.courseschedule'),
        ),
    ]
