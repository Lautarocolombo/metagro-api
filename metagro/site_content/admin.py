from django.contrib import admin
from .models import SiteText


@admin.register(SiteText)
class SiteTextAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')
    search_fields = ('key',)

