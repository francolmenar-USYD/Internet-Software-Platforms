# Generated by Django 2.1.1 on 2018-10-03 05:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0004_playlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='song',
            name='service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user.Service'),
        ),
    ]
