# 🎨 Guía de Personalización: Temas y Fuentes

Esta guía te explica paso a paso cómo añadir nuevos temas visuales y fuentes a **GIMS.ai**.

---

## 1. Cómo añadir un Nuevo Tema Visual

Los temas controlan el color principal (brand) y la textura de fondo de la aplicación.

### Paso A: Definir el estilo en CSS
Abre `src/index.css` y añade un nuevo bloque al final de la sección de temas:

```css
[data-theme='mi-tema'] { 
  --brand: oklch(0.6 0.2 200); /* Color principal (puedes usar hex o rgb también) */
  --bg-image: url('URL_DE_TU_TEXTURA'); /* Imagen de fondo */
  --bg-opacity: 0.5; /* Opcional: Opacidad de la textura */
  --bg-size: auto; /* Opcional: 'cover' para fotos, 'auto' para texturas repetitivas */
}
```

### Paso B: Registrar el tipo
Abre `src/types.ts` y añade el nombre de tu tema al tipo `AppTheme`:

```typescript
export type AppTheme = 'rose' | 'emerald' | ... | 'mi-tema';
```

### Paso C: Hacerlo disponible
Tienes dos opciones:

1. **Si es GRATIS:** Añádelo al array `DEFAULT_THEMES` en `src/components/PersonalizationView.tsx`.
2. **Si es de PAGO (Tienda):** Añádelo al array `SHOP_ITEMS` en `src/components/ShopView.tsx`:
   ```typescript
   { 
     id: "theme_mi_tema", 
     name: "Mi Gran Tema", 
     description: "Una descripción genial", 
     price: 500, 
     type: "theme", 
     value: "mi-tema", 
     previewColor: "#color_hex" 
   }
   ```

---

## 2. Cómo añadir una Nueva Fuente

### Paso A: Importar la fuente
Abre `src/index.css`. Si usas Google Fonts, añade el `@import` al principio. Luego, registra la variable en el bloque `@theme`:

```css
@theme {
  ...
  --font-mifuente: "Nombre de la Fuente", sans-serif;
}
```

### Paso B: Registrar el tipo
Abre `src/types.ts` y añade el nombre al tipo `AppFont`:

```typescript
export type AppFont = 'sans' | ... | 'mifuente';
```

### Paso C: Añadir a la Tienda
Las fuentes siempre son de pago. Añádela a `SHOP_ITEMS` en `src/components/ShopView.tsx`:

```typescript
{ 
  id: "font_mifuente", 
  name: "Mi Fuente", 
  description: "Descripción de la fuente", 
  price: 300, 
  type: "font", 
  value: "mifuente" 
}
```

---

## 💡 Tips Pro
- **Texturas:** Puedes encontrar texturas geniales en [Transparent Textures](https://www.transparenttextures.com/).
- **Colores:** Usa el formato `oklch` para colores más vibrantes y modernos, o `hex` si te sientes más cómodo.
- **Iconos:** Si necesitas cambiar iconos, recuerda que usamos `lucide-react`.

¡Ahora puedes crear todos los estilos que quieras! uwu
