# Generated by Django 2.1.1 on 2018-10-14 06:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0010_playlist_songs'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='s3_url',
            field=models.URLField(blank=True),
        ),
    ]
