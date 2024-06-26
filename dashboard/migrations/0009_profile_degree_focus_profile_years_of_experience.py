# Generated by Django 4.2.8 on 2024-06-24 11:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0008_aboutcandidate_degree_focus_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='degree_focus',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='dashboard.degreefocus'),
        ),
        migrations.AddField(
            model_name='profile',
            name='years_of_experience',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='dashboard.yearsofexperience'),
        ),
    ]
