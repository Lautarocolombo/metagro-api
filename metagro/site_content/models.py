from django.db import models


class SiteText(models.Model):
    key = models.CharField(max_length=255, unique=True, db_index=True)
    value = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key

