from django.contrib import admin
from django.utils.html import format_html

from .models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nombre',
        'categoria',
        'destacado',
        'stock',
        'precio',
        'updated_at',
    )
    search_fields = ('nombre', 'categoria')
    list_filter = ('categoria', 'destacado')
    ordering = ('categoria', 'id')
    readonly_fields = ('preview_imagen', 'created_at', 'updated_at')

    def preview_imagen(self, obj):
        if not obj.imagen_principal:
            return '—'
        return format_html('<img src="{}" style="max-height:80px; max-width:120px; object-fit:contain; border-radius:4px;" />', obj.imagen_principal.url)

    preview_imagen.short_description = 'Imagen'

