# Solución a los problemas del detector Chunqiu / Chunqiu Detector Problem Solution

[English](README.md) | [中文](README.zh-CN.md) | [Русский](README.ru.md) | **Español** | [日本語](README.ja.md)

> Elige abajo el idioma en el que quieres leer el documento, o visita nuestra documentación interactiva en línea (con búsqueda de palabras clave en tiempo real).

## 🌐 Documentación en línea (GitHub Pages)

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

El sitio está hecho con **Docsify** (front-end puro, una sola página, sin paso de compilación): el punto de entrada es `index.html` en la raíz del repositorio, la navegación y la barra lateral vienen de `_navbar.md` / `_sidebar.md`, y el cuerpo se lee directamente de los archivos de `language/` (**no hay que tocar los archivos del sitio**: el contenido se actualiza en cuanto se hace commit).

- El tema claro/oscuro sigue la configuración del navegador / sistema (`prefers-color-scheme`), sin interruptor manual
- El buscador superior indexa **solo los títulos de los elementos** y despliega el elemento encontrado
- El contenido del documento se sigue manteniendo en los archivos de `language/`

Vista previa local (Docsify carga el Markdown por XHR, así que necesita servirse por HTTP; abrir `index.html` con doble clic no funciona):

```bash
python -m http.server 8000    # o cualquier servidor estático, p. ej. npx serve
# abrir http://localhost:8000/
```

> Publicación: `.github/workflows/pages.yml` despliega la raíz del repositorio en GitHub Pages en cada push a `main`.

---

## Selección de idioma

Elige uno de los siguientes idiomas para ver el archivo de soluciones.

- [中文解决方案 / Chino](/language/answer_zh.md)
- [English Solutions / Inglés](/language/answer_en.md)
- [Русское решение / Ruso](/language/answer_ru.md)
- [Solución en español](/language/answer_es.md)
- [日本語の解決策 / Japonés](/language/answer_ja.md)

> El documento contiene muchos enlaces integrados (resaltados en azul). Púlsalos para saltar al proyecto o archivo correspondiente.

> La versión china es el original; los demás idiomas son traducciones suyas. Si algo resulta ambiguo, prevalece la versión china.

---

## Archivos y adjuntos

El repositorio incluye varios scripts de corrección automática y módulos KPM en el directorio `/File/`:

- `/File/Found property.sh` — corrige la detección de la propiedad Found property
- `/File/Tampered Attestation Key(26)Pass.sh` — corrige la etiqueta Patch anómala del certificado
- `/File/shamiko_Plus.sh` — oculta la modificación del «hueco» en el área de propiedades
- `/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm` — módulo KPM de ocultación para APatch
- `/File/Doc/ksu_kp_sidechannel_zh.md` — explica el principio de detección por canal lateral de KSU/APatch
- [`/File/Doc/thanks.md`](File/Doc/thanks.md) — lista de créditos (atribución completa)

---

## Comentarios y contribuciones

¡Son muy bienvenidos los Issues y Pull Requests que añadan nuevos elementos de detección y soluciones!

Puedes hacer fork del repositorio, modificarlo y abrir un Pull Request; lo revisaré y lo fusionaré.

---

## Créditos

La atribución completa está en **[`File/Doc/thanks.md`](File/Doc/thanks.md)**: colaboradores de la documentación, agradecimientos especiales y herramientas de automatización, cada uno con su evidencia de commit/PR.

- **Colaboradores de la documentación:** 铭鐏 ([@mingzun09](https://github.com/mingzun09)) · [@YiJieqwq](https://github.com/YiJieqwq) · 741afb7 · huoyan1231 · juanma0511 · Young-Six-6 · HongSir6 · Lljjcc625 · [Met-AUG](https://github.com/Met-AUG)
- **Agradecimientos especiales:** [Matsuzaka Yuki](https://github.com/matsuzaka-yuki) · [JeTeeZnTmax](https://github.com/jeteezntmax)
- **Herramientas y automatización:** google-labs-jules[bot]

> [@JeTeeZnTmax](https://github.com/jeteezntmax) aportó la recopilación y las pistas de **16 elementos de detección**, pero nunca hizo commit en este repositorio, así que no aparece en la lista de colaboradores de GitHub; queda registrado en el archivo de créditos.

---

## Mantenedores

- [@mingzun09](https://github.com/mingzun09) — propietario del repositorio
- [@YiJieqwq](https://github.com/YiJieqwq) — mantenedor
