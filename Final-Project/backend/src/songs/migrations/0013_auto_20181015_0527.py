# Generated by Django 2.1.1 on 2018-10-15 05:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0012_song_unique_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='name',
            field=models.CharField(max_length=128, unique=True),
        ),
    ]
