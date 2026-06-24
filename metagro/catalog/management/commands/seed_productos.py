import json
import os
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.db import transaction

from catalog.models import Producto


class Command(BaseCommand):
    help = 'Seed de productos (125) desde seed/default_products.json y carga imágenes desde /productos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            default='seed/default_products.json',
            help='Ruta relativa al repo para el JSON con window.DEFAULT_PRODUCTS (default: seed/default_products.json)',
        )

    def handle(self, *args, **options):
        source_rel = options['source']
        repo_root = Path(__file__).resolve().parents[4]
        source_path = (repo_root / source_rel).resolve()
        if not source_path.exists():
            # Fallback: si el repo_root calculado no coincide, probamos desde 1 nivel arriba del comando
            alt_source_path = (Path(__file__).resolve().parents[3] / source_rel).resolve()
            if alt_source_path.exists():
                source_path = alt_source_path
            else:
                raise FileNotFoundError(f'No encuentro source JSON: {source_path}')


        with open(source_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError('El JSON debe ser una lista (DEFAULT_PRODUCTS).')

        productos_dir = (repo_root / 'productos').resolve()
        media_fallback_prefix = 'productos/'

        created = 0
        updated = 0
        missing_img = 0

        def resolve_image(img_path: str):
            if not img_path:
                return None
            # img_path viene como 'productos/xxx.jpg' (o similar)
            p = Path(img_path)
            if p.is_absolute():
                return p
            # si empieza con 'productos/' asumimos que está en repo_root/productos
            if str(p).replace('\\', '/').startswith('productos/'):
                rel = str(p).replace('\\', '/').split('productos/', 1)[1]
                return (productos_dir / rel).resolve()
            # si no tiene prefijo, intentamos directamente dentro de /productos
            return (productos_dir / p.name).resolve()

        @transaction.atomic
        def upsert_one(item):
            # item tiene keys: id,name,tag,desc,img,images...
            nombre = (item.get('name') or '').strip() or 'Producto'
            categoria = (item.get('tag') or item.get('categoria') or 'General').strip()
            descripcion = (item.get('desc') or item.get('descripcion') or '').strip()

            img = item.get('img') or ''
            main_img_path = resolve_image(img) if img else None

            # Usamos id provisto para mantener consistencia
            pid = item.get('id')
            if pid is None:
                # si no viene id, evitamos romper el seed
                # (fallback a autoincrement no lo hacemos acá porque queremos consistencia)
                return False

            defaults = {
                'nombre': nombre,
                'categoria': categoria,
                'descripcion': descripcion,
            }

            if main_img_path and main_img_path.exists():
                # Si existe, cargamos al ImageField
                filename = main_img_path.name
                # IMPORTANTE: no cerrar el file antes de que Django lo guarde
                f = open(main_img_path, 'rb')
                defaults['imagen_principal'] = File(f, name=f'productos/{filename}')

            else:
                nonlocal missing_img
                if img:
                    missing_img += 1

            obj, was_created = Producto.objects.update_or_create(
                id=pid,
                defaults={
                    'nombre': defaults['nombre'],
                    'categoria': defaults['categoria'],
                    'descripcion': defaults['descripcion'],
                    # imagen_principal: update only if found
                    **({'imagen_principal': defaults['imagen_principal']} if defaults.get('imagen_principal') else {}),
                }
            )
            return was_created

        for item in data:
            was_created = upsert_one(item)
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seed completado. created={created}, updated={updated}, missing_img={missing_img}'
        ))

