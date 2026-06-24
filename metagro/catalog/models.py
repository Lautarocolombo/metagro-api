from django.db import models


class Producto(models.Model):
    nombre = models.CharField(max_length=255, db_index=True)
    categoria = models.CharField(max_length=255, blank=True, db_index=True)
    descripcion = models.TextField(blank=True, default='')

    # Imagen principal
    imagen_principal = models.ImageField(upload_to='productos/', blank=True, null=True)

    # Datos opcionales para futuro
    precio = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(blank=True, null=True)
    destacado = models.BooleanField(default=False, db_index=True)

    slug = models.SlugField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['categoria', 'id']
        indexes = [
            models.Index(fields=['categoria', 'destacado']),
        ]

    def __str__(self):
        return self.nombre

