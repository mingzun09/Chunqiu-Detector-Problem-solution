# Soluciones a los problemas del detector Chunqiu (seguimiento de la última versión) — Español

> Versión verificada: 4.6.2 (75) Actualización: 2026-10-21
> Lista de créditos / Credits: [lista de agradecimientos](/File/Doc/thanks.md) | Solo como referencia; los resultados concretos varían según el dispositivo y el entorno.
> Algunas entradas incluyen además el «**Método de detección**» (recopilado a partir de pruebas de la comunidad y de la observación del comportamiento; puede diferir de la implementación y sirve solo como referencia para localizar el problema)
> Enlace del documento: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

---

<details><summary><b>Aviso legal</b></summary>
**1. Restricciones de cumplimiento y de uso**
El detector Chunqiu y las soluciones de detección y tratamiento del entorno que ofrece este documento están dirigidos **exclusivamente a aficionados a la tecnología Android** y se destinan únicamente al **aprendizaje técnico, la investigación del entorno y el debate**. Está **terminantemente prohibido** usar cualquier solución de este documento para eludir sistemas anti-trampas de aplicaciones, esquivar mecanismos de control de riesgos, hacer trampas en juegos o para cualquier otro escenario ilegal o contrario a la normativa. Todas las consecuencias y responsabilidades derivadas de un uso indebido recaen exclusivamente sobre el usuario.

**2. Advertencia de riesgos**
Todos los procedimientos, scripts de automatización y configuraciones de módulos recogidos en el documento son solo para referencia técnica. Las operaciones que implican modificar imágenes del sistema, sustituir claves de hardware, incrustar módulos de kernel (KPM) o ejecutar instrucciones Root de bajo nivel conllevan un **riesgo extremadamente alto e irreversible**, y pueden dejar el dispositivo inservible, provocar reinicios infinitos o la pérdida de datos del usuario. Todo el riesgo de las operaciones recae en el propio usuario; el autor del documento no se hace responsable en absoluto de los posibles daños al dispositivo ni de la pérdida de datos.

3. Esta solución se basa en pruebas reales de la comunidad y se ve afectada por la versión de ROM, el kernel, el gestor de root y la combinación de módulos; los elementos de detección pueden dar falsos positivos y activarse de forma ocasional y probabilística. Las soluciones indicadas en el documento no garantizan su eficacia total; los resultados de detección sirven solo como referencia de depuración y no como base de un juicio absoluto.

4. Los módulos de terceros, scripts y enlaces a proyectos externos citados en el documento son recursos públicos de la comunidad; el autor no se responsabiliza de la seguridad ni de la fiabilidad de las herramientas de terceros, y cada usuario debe evaluar por su cuenta su procedencia.

5. Los «nombres de paquete de riesgo / en lista negra» y los «archivos y directorios sospechosos / de trampas» recogidos en el Apéndice A y el Apéndice B provienen del conjunto de datos integrado en la app del detector Chunqiu, y su clasificación se basa en información pública de la comunidad y en las páginas de publicación de los proyectos; se usan solo como referencia para la detección del entorno y los escenarios anti-trampas, y no representan una conclusión de juicio absoluta.

6. Las definiciones de tipos de dispositivo añadidas en este documento (dispositivo realmente desbloqueado, dispositivo falsamente rebloqueado, dispositivo sin desbloqueo y dispositivo autofirmado) son la primera normalización y sistematización de estas definiciones dentro de la comunidad, con el objetivo de impulsar un uso unificado de la terminología de clasificación de dispositivos; no tienen autoridad legal y son solo una referencia técnica.

7. Los módulos de la lista de módulos recomendados son recomendaciones técnicas subjetivas del editor, sin ningún vínculo de interés comercial, y son solo orientativos.

</details>

## Ayuda y comentarios

<details><summary><b>Detecciones que has probado por tu cuenta y que aún no pasan</b></summary>

Abre un Issue e incluye la información de tu lista de módulos + qué módulos Xposed usas y demás modificaciones en detalle; responderé/ayudaré cuando tenga tiempo.

</details>

<details><summary><b>Método de diagnóstico general (al encontrarte con entradas «desconocidas / sin resolver»)</b></summary>

1. **Registra el estado actual**: `ls /data/adb/modules`, la lista de módulos Xposed, la política de exclusión de Zygisk y las propiedades de camuflaje (`getprop | grep -iE "spoof|pihooks|pixelprops|resetprop"`).
2. **Repite la prueba con el conjunto mínimo**: deja solo el gestor de root + el proveedor de Zygisk imprescindible (p. ej. un proveedor de Zygisk), reinicia y escanea para confirmar si la detección sigue activándose.
3. **Localización por bisección**: a partir de ahí, activa un solo módulo cada vez → reinicia → vuelve a escanear, y acota poco a poco hasta el elemento concreto que lo dispara (cambiando solo una variable por vez).
4. **En las entradas de tipo montaje**, actúa primero sobre: el metamódulo, la política de exclusión de Zygisk («restaurar solo el montaje») y el ocultamiento tipo SusFS / PathMask.
5. **Entradas de tipo clave / TEE**: tras modificar `keybox.xml`, `target.txt`, la sincronización del parche de seguridad, etc., **es obligatorio reiniciar** antes de volver a probar.
6. Unas pocas entradas son **canales laterales / detecciones inestables**: varias exploraciones del mismo entorno pueden dar resultados distintos; descarta primero lo ocasional y luego localiza.

⚠️ **Aviso de seguridad**: cualquier operación de «cambiar keybox / cambiar las claves RKP / revertir el estado de rebloqueo / cambiar la sincronización del parche de seguridad» altera las claves y el estado de atestación (attestation) del dispositivo y **no es necesariamente reversible**; evalúa el riesgo antes de actuar y, si hace falta, haz antes una copia de seguridad de los directorios correspondientes.

---

</details>

## Índice

- [Ayuda y comentarios](#ayuda-y-comentarios)
- [Prólogo](#prólogo)
- [I. Propiedades, información de compilación y configuración textual](#i-propiedades-información-de-compilación-y-configuración-textual)
- [II. Vista de montaje y consistencia del sistema de archivos](#ii-vista-de-montaje-y-consistencia-del-sistema-de-archivos)
- [III. Procesos, espacios de nombres y estado de permisos](#iii-procesos-espacios-de-nombres-y-estado-de-permisos)
- [IV. Llamadas directas a interfaces del kernel y comportamiento anti-depuración y anti-inyección](#iv-llamadas-directas-a-interfaces-del-kernel-y-comportamiento-anti-depuración-y-anti-inyección)
- [V. Integridad de binarios y mapeos de memoria](#v-integridad-de-binarios-y-mapeos-de-memoria)
- [VI. Política SELinux, AVC y canales de auditoría](#vi-política-selinux-avc-y-canales-de-auditoría)
- [VII. Keystore, KeyMint y TEE](#vii-keystore-keymint-y-tee)
- [VIII. Gestión de paquetes, visibilidad de apps y rastros de instalación](#viii-gestión-de-paquetes-visibilidad-de-apps-y-rastros-de-instalación)
- [IX. Temporización, residencia de páginas y canales laterales diferenciales](#ix-temporización-residencia-de-páginas-y-canales-laterales-diferenciales)
- [X. Servicios locales y forma de la terminal](#x-servicios-locales-y-forma-de-la-terminal)
- [Apéndice: entradas no incluidas en los criterios anteriores](#apéndice-entradas-no-incluidas-en-los-criterios-anteriores)
- [Apéndices](#apéndices)

---

## Terminología

<details><summary><b>Introducción y convenciones de terminología</b></summary>

#### Dispositivo realmente desbloqueado

La marca de desbloqueo del Bootloader (ABL) está realmente activada, y el sistema permite imágenes de bajo nivel sin verificación de firma y autoriza su flasheo. El estado de desbloqueo de este dispositivo se refleja fielmente en las propiedades de bajo nivel del sistema y en las credenciales de nivel hardware de KeyMint (Attestation).

#### Dispositivo falsamente rebloqueado

Se trata de un dispositivo realmente desbloqueado en el ABL sobre el que, en una fase temprana de la cadena de arranque (antes de que el sistema y el TEE lean y fijen el estado de arranque), se implanta y ejecuta un payload personalizado que reescribe el estado de desbloqueo en memoria y lo reporta, de modo que el dispositivo se presenta al exterior como «bloqueado (locked & green)» y puede devolver un «certificado de attestation bloqueado» de nivel hardware, mientras en realidad sigue cargando imágenes boot / init_boot manipuladas (por ejemplo, dispositivos Qualcomm Snapdragon 8e5 que usan el proyecto gbl_root_canoe).

#### Dispositivo sin desbloqueo

Dispositivo en el que el ABL permanece realmente bloqueado (sin desbloquear) y se obtiene Root mediante una vulnerabilidad de escalada de privilegios en Android / espacio de usuario (a menudo acompañada de poner SELinux en permissive). Este tipo de Root normalmente no es persistente y hay que volver a aprovecharla en cada arranque.

#### Dispositivo autofirmado

Dispositivo en el que la clave de firma de boot / init_boot en la que confía la cadena de arranque puede ser obtenida o reproducida por terceros, de modo que el usuario puede firmar por su cuenta las imágenes manipuladas de boot / init_boot / vbmeta, etc., y ejecutarlas pasando la verificación mientras el ABL permanece realmente bloqueado; el estado de arranque del sistema y el estado de desbloqueo del OEM siguen mostrando «sin desbloquear» (caso típico: Lenovo Legion Y700 de segunda / tercera / cuarta generación, donde basta con volver a firmar las imágenes con la testkey pública para flashear el parche de root sin desbloquear).

#### Gestor de root

Está formado por un conjunto completo de componentes de gestión de permisos, que incluye una app Android interactiva para el usuario, servicios demonio en espacio de usuario y hooks persistentes o parches de memoria desplegados en el kernel o en el ramdisk, etc., para llevar a cabo el control de los permisos Root.

#### Metamódulo

Módulo de nivel superior del tipo gestor de módulos; no proporciona por sí mismo funciones como el camuflaje del dispositivo o los parches del sistema, sino que su función principal es gestionar los submódulos y proporcionar la funcionalidad de montaje; en un dispositivo solo puede haber instalado un metamódulo a la vez (ver la [documentación oficial de KernelSU](https://kernelsu.org/zh_CN/guide/metamodule.html)).

#### Módulo de claves

Módulo que intercepta / sustituye la ruta de attestation de KeyMint dentro del demonio keystore del sistema (keystore2) y usa un keybox para generar una prueba falsa de que el dispositivo está bloqueado; la mayoría incluye además funciones de camuflaje de propiedades del sistema.

#### Proveedor de Zygisk

Módulo que proporciona el runtime de Zygisk, se encarga de inyectar código en los procesos Zygote / app y expone hacia fuera un conjunto de API de comportamiento Zygisk, ofreciendo el entorno de carga y ejecución a los demás módulos Zygisk que hacen el trabajo real.

#### Módulo de ocultación de apps

Módulo que toma la «visibilidad de paquetes» como objeto de operación, intercepta la cadena de consulta de paquetes en el proceso objetivo (o en un proceso del sistema) y, según la configuración del usuario, oculta a la app objetivo la visibilidad de las apps seleccionadas.

</details>

## Prólogo

<details><summary><b>Guía para construir un entorno oculto mínimo y perfecto</b></summary>

- Dispositivo realmente desbloqueado: **módulo de claves + proveedor de Zygisk + módulo de ocultación de apps**
- Dispositivo falsamente rebloqueado / sin desbloqueo / autofirmado: **proveedor de Zygisk + módulo de ocultación de apps**

Para los usuarios de **APatch / FolkPatch** es necesario cargar además **[NoHello.kpm](https://t.me/welikeandroid)** para prevenir la detección por canal lateral; las versiones nuevas del gestor pueden incluir de serie una función de hook de SELinux (hay que activarla manualmente), y los usuarios de versiones antiguas pueden cargar además **[SELinux_Hook.kpm](https://t.me/APatch_nightly)** (los enlaces están en «Módulos recomendados» más abajo).

</details>

<details><summary><b>Módulos recomendados (sin orden de preferencia)</b></summary>

#### Módulo de claves

- [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS): el módulo de claves más conocido después de TrickyStore, con actualizaciones bastante frecuentes y sin WebUI propia.
- [OhMyKeymint](https://github.com/qwq233/OhMyKeymint/): comportamiento más cercano a AOSP, con un coste de IO posiblemente menor que TEES-RS.
- La **versión con WebUI** está en la rama `Xiaomi_LeiJun` de [ITxiao6666/OhMyKeymint](https://github.com/ITxiao6666/OhMyKeymint).
- [Tricky-addon-Enhanced](https://github.com/Enginex0/tricky-addon-enhanced): módulo de extensión WebUI utilizable con TS / TEES-RS.
- No se recomienda el TrickyStore original: su última actualización fue el 2025-11-30 y algunas funciones se han quedado muy por detrás de otros módulos de claves.

#### Proveedor de Zygisk

- [Zygisk-Next](https://github.com/Dr-TSNG/ZygiskNext): el proveedor de Zygisk independiente más ampliamente usado.

#### Módulo de ocultación de apps

- [HMA-OSS](https://github.com/frknkrc44/HMA-OSS): disponible en dos versiones, como módulo Zygisk / como módulo Xposed.

#### Módulo de ocultación de KernelPatch

- [NoHello.kpm](https://t.me/welikeandroid): módulo anti-detección por canal lateral para AP / FP.
- [SELinux_Hook.kpm](https://t.me/APatch_nightly): módulo de hook de SELinux para AP / FP (puede venir ya integrado en las versiones nuevas del gestor).
- La última detección de **Superkey** del detector Chunqiu **aún no tiene módulo que la contrarreste**; en cuanto aparezca, se actualizará de inmediato.

#### Metamódulo

- Si el gestor de root del dispositivo incluye una API de metamódulos, puedes plantearte activarla;
- [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount): metamódulo de terceros bastante usado.
O se recomienda usar [NoMount](https://github.com/maxsteeel/nomount), un framework de redirección de rutas VFS (sistema de archivos virtual) para el kernel de Android
</details>

<details><summary><b>Configuración correcta de los módulos</b></summary>

#### Módulo de claves

a. Añade la app objetivo a la lista de nombres de paquete (como `/data/adb/tricky_store/target.txt` de TS / TEES, o configúralo con la WebUI);
b. Configura correctamente la fecha del parche de seguridad, o simplemente borra su archivo de configuración (como `/data/adb/tricky_store/security_patch.txt`; borrarlo directamente es lo más cómodo);
c. Configura correctamente el boot hash (en condiciones normales se establece solo).

#### Proveedor de Zygisk

Activa «usar el conector de Zygisk» y «usar memoria anónima»; «restaurar solo el montaje» puede entrar en conflicto con la «descarga de módulos en el kernel» del gestor de root del dispositivo, así que elige una de las dos opciones.

#### Módulo de ocultación de apps

La forma de uso no es única; aquí solo se explican los términos (con HMA-OSS como ejemplo):
- **Modo de trabajo de lista negra**: las apps a las que se activa este modo no verán las apps incluidas en la plantilla de lista negra que se les aplique;
- **Plantilla de lista negra**: para las apps a las que se aplica esta plantilla, las apps incluidas en la plantilla no son visibles;
- **Modo de trabajo de lista blanca**: las apps a las que se activa este modo solo verán las apps incluidas en la plantilla de lista blanca que se les aplique;
- **Plantilla de lista blanca**: para las apps a las que se aplica esta plantilla, solo son visibles las apps incluidas en la plantilla.

---

</details>





## Cuerpo de los elementos de detección

## I. Propiedades, información de compilación y configuración textual

Los criterios provienen todos de fuentes textuales como `__system_property_get` / `getprop` / `uname` / `build.prop` / `sepolicy`, y se comparan por consistencia con la vista en tiempo de ejecución.

<details><summary><b>Bootloader unlock / propiedades de desbloqueo</b></summary>

#### Método de detección

Lee las propiedades relacionadas con el estado de bloqueo del bootloader / el resultado de la certificación — `ro.boot.flash.locked`, `ro.boot.verifiedbootstate`, `ro.boot.vbmeta.device_state`, etc. (`0` / `orange` / `unlocked` indican desbloqueado).

#### Solución

- **Dispositivo realmente desbloqueado**: usa el módulo de claves para ocultar el estado de desbloqueo al detector y, siguiendo «Configuración correcta de los módulos», añade el detector a la lista de nombres de paquete (la lista target surte efecto en tiempo real, sin necesidad de reiniciar);
- **Dispositivo falsamente rebloqueado / sin desbloqueo / autofirmado**: el dispositivo ya se presenta al exterior como «bloqueado (locked & green)», así que normalmente no activará este elemento (ese estado lo aporta una solución temprana de la cadena de arranque, del tipo efisp).

Para la solución combinada, ver `Estado de arranque anómalo`; además hay reportes de que en iQoo/Vivo con OriginOS 5 no salta y con OriginOS 6 sí (sin confirmar si es un falso positivo).

</details>

<details><summary><b>Estado de arranque anómalo</b></summary>

#### Método de detección

Lee el estado de verified boot (como `ro.boot.verifiedbootstate`) y lo compara con lo esperado.

#### Dispositivo realmente desbloqueado

La marca de desbloqueo del Bootloader (ABL) está realmente activada, y el sistema permite imágenes de bajo nivel sin verificación de firma y autoriza su flasheo. El estado de desbloqueo de este dispositivo se refleja fielmente en las propiedades de bajo nivel del sistema y en las credenciales de nivel hardware de KeyMint (Attestation).
Combinación probada por la comunidad en las pruebas: actualizar módulo de claves (-v307) + plugin TS v5.0-beta1 → desactivar en los ajustes del gestor «descargar módulos (nivel kernel)» → poner el proveedor de Zygisk en «restaurar solo el montaje» → congelar el administrador del teléfono (en Xiaomi se puede usar el esquema de ocultación / congelación por app y activar «desactivar la comprobación del entorno») → colocar el script de ocultación de propiedades en `/data/adb/service.d/`.

</details>

<details><summary><b>Anomalía de verificación avb avb=2.0</b></summary>

#### Método de detección  
Lee propiedades de vbmeta como `ro.boot.vbmeta.avb_version` y las compara con lo esperado.

#### Causa raíz  
Algunos módulos fuerzan la modificación de las propiedades de vbmeta y provocan este problema, incluidos, entre otros:
1. **Módulos que cambian el modelo del dispositivo**
2. **Módulos del tipo reparación / paso de Play Integrity** (como Integrity Box y las distintas variantes / paquetes integrados de PIF; para simular el rebloqueo, estos módulos suelen escribir de forma codificada `avb_version=2.0` en el script de instalación o de arranque)

#### Diagnóstico y soluciones  
1. **Localiza y examina el módulo problemático**:
   - Abre el gestor MT y entra en el directorio `/data/adb/modules/`.
   - Busca en el contenido de los archivos: `avb_version`.
   - Revisa los archivos de los módulos que coincidan (como `system.prop`, `post-fs-data.sh`, `customize.sh`, etc.), averigua qué módulo inyecta esa propiedad y modifica el valor correspondiente, comenta el ajuste en cuestión o desinstala / desactiva directamente el módulo problemático.
2. **Revisa y corrige el script del servicio persistente de arranque (habitual en módulos como Integrity Box)**:
   - Comprueba si existe `hash.sh` (u otro script de autoarranque) en el directorio `/data/adb/service.d/`.
   - Ábrelo y busca si contiene:
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "2.0"
     ```
   - Cámbialo por:
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "1.3"
     ```
   - Guarda y reinicia el dispositivo para que surta efecto. Más adelante esa línea también se puede comentar o borrar directamente.
3. **Modificación temporal por línea de comandos (efectiva al instante en el arranque actual)**:
   - Si el entorno admite `resetprop` (entorno Magisk o una terminal con el PATH correspondiente ya configurado), puedes probar a ejecutar directamente en la terminal:
     ```sh
     su -c resetprop -n ro.boot.avb_version 1.3
     ```
   - *Nota: `resetprop` modifica directamente propiedades en memoria, por lo que deja de tener efecto al reiniciar el teléfono; además, en un entorno KernelSU la terminal normalmente no tiene resetprop en el PATH global (dará el error `resetprop: command not found`). Para una solución persistente, usa sin falta los métodos 1 y 2 para modificar el script de arranque correspondiente.*

</details>

<details><summary><b>Depuración USB activada</b></summary>

#### Método de detección

Método nativo `runFormalUsbDebuggingCheck`; en los artefactos estáticos no se ve ninguna cadena de ajuste del tipo `adb_enabled`, se supone que tiene relación con la familia de reglas SELinux de `adbd` / `adbroot` / `adb_data_file` (misma fuente que la sonda de reglas SELinux); el criterio concreto está por confirmar.

#### Solución

Desactiva la depuración USB (`su -c settings put global adb_enabled 0`); se puede escribir en `/data/adb/service.d/` para desactivarla automáticamente en cada arranque.

Relación: tanto esta como `Anomalía de muestreo de fdinfo mnt (c)` tienen que ver con la depuración USB, pero los criterios son distintos — esa otra mira los restos de `mnt_id` en `/proc/*/fdinfo`.

---

</details>

<details><summary><b>Kernel de terceros</b></summary>

#### Método de detección

La información de la versión del kernel coincide con la lista de características predefinida.

La información del kernel coincide con la lista de información predefinida.

Se resuelve camuflando la información del kernel.
Camuflar el nombre del kernel con SUSFS.

</details>

<details><summary><b>ROM de terceros / kernel autocompilado</b></summary>

#### Método de detección

El sufijo del número de versión del kernel lleva características de autocompilación como `-Dirty`.

Marca de ROM de terceros.

El sufijo del número de versión del kernel lleva `-Dirty`.

Se resuelve camuflando la información del kernel.
Camuflar el nombre del kernel con SUSFS.

</details>

<details><summary><b>Tampered kernel / kernel camuflado</b></summary>

#### Método de detección

Lee el uname del kernel (cadena de versión, hora de compilación) y lo compara con la lista predefinida / la línea base; también entra en este elemento la determinación de consistencia cuando la información del kernel ha sido camuflada (SUSFS, etc.).

#### Solución

- Usa soluciones a nivel de kernel como SUSFS para ocultar el nombre del kernel; al camuflar el kernel, pon la fase de arranque en `post-fs-data`;
- También se puede restaurar el boot.img sin modificaciones.

Palabras textuales del desarrollador: si aparece con el sistema de fábrica + modo LKM, es un falso positivo.

</details>

<details><summary><b>Se detectó engaño en la versión del kernel: %1$s</b></summary>

### Causa
Las cadenas de release de `uname(2)`, del subproceso `uname -r` y de `/proc/version` no coinciden entre sí

Prueba a camuflar la versión del kernel con SUSFS u otros medios

</details>

<details><summary><b>Property Modified (el número indica cuántas propiedades se modificaron)</b></summary>

#### Método de detección

Escanea los huecos de la zona de propiedades: los permisos / propietario / tamaño de los archivos de propiedades bajo `/dev/__properties__/` y su contexto SELinux correspondiente, así como si en la zona de propiedades hay huecos no utilizados (solapamientos / huecos de `prop_area`) — la presencia de huecos indica que las propiedades se han modificado dinámicamente.

Para ocultar las propiedades modificadas se puede usar el archivo [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) que ofrece el repositorio, añadirlo y moverlo al directorio `/data/adb/service.d/`, confirmar que el script tiene permiso de ejecución y reiniciar para intentar resolverlo.
Nota: `shamiko_Plus.sh` escribe propiedades en una fase temprana con `resetprop -n`; hay que colocarlo en `/data/adb/service.d/` para que se ejecute y **no persistirlo**, porque de lo contrario podría crear nuevos huecos en la zona de propiedades.

</details>

<details><summary><b>Found property</b></summary>

#### Método de detección

Comprueba si `persist.logd.size` / `persist.logd.size.crash` / `persist.logd.size.system` / `persist.logd.size.main` están establecidas con un valor **no vacío** (si no están vacías, se activa; estas propiedades son la configuración del búfer de log y algunos módulos / scripts las escriben).

Ejecuta [este sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) para intentar resolverlo.

</details>

<details><summary><b>ROM detected</b></summary>

#### Método de detección

Las características del sistema / modelo coinciden con la lista de ROM de terceros.

Se detectó una ROM de terceros.

Coinciden algunas características de ROM de terceros.

Puedes intentar camuflarlo por tu cuenta.
Camuflar el nombre del kernel con SUSFS.

</details>

<details><summary><b>ROM detected (a)</b></summary>

## Causa
`vendor_sepolicy.cil` / `vendor_file_contexts` contienen `hal_lineage`, `hal_aospa`, `.lineage`, `.aospa`.

Habitual en sistemas / ROM personalizados o portados; es solo una referencia para que el desarrollador mejore, no hay solución

</details>

<details><summary><b>Aislamiento de Vold activado</b></summary>

#### Método de detección

Lee `persist.sys.vold_app_data_isolation_enabled` (el aislamiento de appdata de Vold de HMA / los módulos de ocultación de apps escribe esta propiedad).

Desactiva en los ajustes de HMA/HMAOSS el aislamiento de app data de Vold de la terminal

Si tras desactivarlo y reiniciar sigue existiendo `persist.sys.vold_app_data_isolation_enabled=0`

ejecuta en el shell su `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` y luego reinicia
Nota (pendiente de confirmación del autor): se contrarresta mutuamente con `Miscellaneous Check(3)`; ver la explicación de esa entrada.

---

</details>

<details><summary><b>Miscellaneous Check（a）</b></summary>

#### Método de detección

Comprueba los indicadores relacionados con dex2oat (como `dalvik.vm.dex2oat-flags`); los módulos del tipo LSP / Xposed suelen modificarlos.

Se detectó dex2oat (normalmente es un problema de LSP; cambia / actualiza el módulo LSP).

</details>

<details><summary><b>Miscellaneous Check(2)</b></summary>

#### Método de detección

Detección de manipulación del dispositivo / modelo (habitual en módulos que cambian el modelo).

Se detecta manipulación del dispositivo / del modelo.

¿Causado por un módulo que cambia el modelo? Examínalo por tu cuenta.

</details>

<details><summary><b>Miscellaneous Check(3)</b></summary>

#### Método de detección

Detección relacionada con el cambio de dispositivo / el aislamiento (como el efecto del aislamiento de appdata de Vold).

¿Detección de cambio de dispositivo?

La siguiente solución puede estar desactualizada: ¿se activó el aislamiento de appdata de Vold de «ocultar la lista de apps (HMA)»?
Nota (pendiente de confirmación del autor): este elemento se contrarresta mutuamente con `Aislamiento de Vold activado` — activar el aislamiento de appdata de Vold de HMA / los módulos de ocultación de apps puede resolver este elemento, pero activará `Aislamiento de Vold activado` (se escribe esa propiedad); elige según cuál sea más prioritario.

</details>

<details><summary><b>GMS bloqueado</b></summary>

#### Método de detección

Comprueba los archivos de características y los ejecutables de «bloqueo de GMS» del lado de la ROM — `/my_product/etc/permissions/oplus_google_cn_gms_features.xml` (modelos nacionales de OPPO / OnePlus; el detector hace directamente `access` a esa ruta), `/system/bin/gmsc`; además están las propiedades del tipo PIF `persist.sys.pihooks.disable.gms`, `persist.sys.pixelprops.gms`, `persist.sys.spoof.gms`.

#### Solución

Comprueba si has ocultado componentes del sistema (el paquete de servicios de Google) con el módulo de ocultación de apps, o examina el problema de GMS del lado de la ROM.

</details>

<details><summary><b>Fallo de detección</b></summary>

#### Método de detección

Esta detección en sí no se completó correctamente (limitaciones del entorno / tiempo de espera agotado, etc.); **no es un «acierto»**; puedes reintentar o ignorarla.

</details>

<details><summary><b>LineageOS detection</b></summary>

**Método de detección:** 
Se está ejecutando el sistema LineageOS, por lo que se detectarán muchas características de propiedades

**Solución:** 
Puedes probar a usar susfs (si está disponible) para ocultar y camuflar los datos característicos detectados

</details>

<details><summary><b>[hook]Resetprop modified</b></summary>

#### Método de detección

Propiedades reescritas dinámicamente por herramientas del tipo resetprop.

Se modificó resetprop.

Desconocido.

</details>

<details><summary><b>ROM de terceros (2)</b></summary>

#### Método de detección

Características de ROM de terceros (segundo grupo).

Por ahora desconocido

</details>

## II. Vista de montaje y consistencia del sistema de archivos

El criterio son las contradicciones mutuas entre `mountinfo` / `statfs` / `statx` / `fdinfo` / `getdents64`, no la aparición de una palabra clave concreta.

<details><summary><b>Hueco de montaje</b></summary>

#### Método de detección

Comprueba la continuidad de la tabla de IDs de grupo de montaje / peer-group: si hay saltos en el ID de grupo (como 1,2,3,6,7…) o la tabla peer-group es inconsistente (hay puntos de montaje ocultos), se activa.

Con este método de determinación, cuando el ID del grupo de montaje crece de forma discontinua (por ejemplo 1,2,3,6,7,8...) se considera que existe un comportamiento de ocultación de root; al contrario, cuando el ID del grupo de montaje crece de forma continua (por ejemplo 1,2,3,4,5,6,7...) es normal.

Este fenómeno aparece cuando la familia Magisk cambia de namespace, y en la familia KernelSU / la familia APatch también puede aparecer si se usan algunos módulos con función de montaje bind.

#### Solución

- **Familia Magisk**: se resuelve usando Magisk Alpha, se desconoce el motivo.
- **Familia Kernel / familia APatch**: prueba a cambiar el «metamódulo» o a actualizar el gestor de ROOT.

Si el problema persiste, revisa los módulos del sistema con función de montaje bind y si el sistema presenta este fenómeno de forma nativa.

*Nota*: en unas pocas ROM el fenómeno existe de forma nativa; si es tu caso, ignora esta entrada.
Cambiar el metamódulo (como Hybrid-Mount, ver «Módulos recomendados» en el Prólogo) / actualizar el gestor de root y volver a parchear; si usas Scene, actualiza Scene.

</details>

<details><summary><b>mountinfo</b></summary>

#### Método de detección

En una fase temprana del proceso se toma una instantánea de mountinfo y después se compara con la vista en tiempo de ejecución; si no coinciden, se activa (`Mountinfo view drift`).

Las vistas de montaje obtenidas por dos medios distintos no son iguales. Puede haber un problema de ocultación; a veces algún servicio no procesa a tiempo y salta (instantánea de mountinfo muy temprana frente a la comparación posterior).

En los dispositivos Xiaomi, normalmente al poco de arrancar, cuando el sistema está muy ocupado, al abrir el detector aparece este elemento de detección.
Si salta nada más arrancar, en la mayoría de los casos es un error de la fase de instantánea: **espera de 20 segundos a 5 minutos tras el arranque antes de medir**.

</details>

<details><summary><b>Montaje anómalo</b></summary>

## Causa

La ruta a la que apunta `("/proc/self/exe")` contradice el valor esperado en mountinfo

Examina los módulos de tipo montaje y prueba a cambiar el metamódulo para resolverlo

</details>

<details><summary><b>Vista de montaje inconsistente</b></summary>

## Causa
Más o menos el mismo principio que la entrada anterior, pero la verificación con appzygote no coincide

Examina los módulos de tipo montaje y prueba a cambiar el metamódulo para resolverlo

</details>

<details><summary><b>Mount Detectde(1)</b></summary>

Existe comportamiento de montaje en /system

</details>

<details><summary><b>Mount Detector(2)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(3)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(4)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(5)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(6)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(7)</b></summary>

**Solución:** 
Si se detecta un montaje, se recomienda usar el metamódulo NoMount o, siguiendo la indicación de la detección, intentar desactivar los módulos que modifican el sistema

</details>

<details><summary><b>Mount Detector(8)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(9)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(10)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Mount Detector(11)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(1)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(2)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(3)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(4)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(5)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Montaje inconsistente(6)</b></summary>

Pendiente de completar

</details>

<details><summary><b>Anomalía de montaje(X)</b></summary>

#### Método de detección

Escaneo de la tabla de montajes (`verdict=hit: peer-group table inconsistency (hidden mount points)`, `suspicious mount entry`, detección de overlay, etc.); al activarse, coloca la ruta `/dev/block/...` concreta o el nombre del módulo en el detalle desplegable.

Se detectó el montaje de algunos módulos / apps.
**KSU · LKM**: oculta con PathMask la ruta `/dev/block/xxx` que aparece en el detalle de la entrada y recarga en caliente; **GKI + SUSFS**: escribe la ruta de ocultación correspondiente en SUSFS; **GKI sin SUSFS**: consulta la solución de LKM; los demás gestores no tienen solución por ahora.
Si en el contenido desplegado aparece la palabra **overlay** → cambia el metamódulo (como Hybrid-Mount, ver «Módulos recomendados» en el Prólogo); si confirmas que el montaje lo provoca un módulo → desinstala ese módulo.
Relación: pertenece al grupo de montaje junto con `Familia de metadatos anómalos de /data/local/tmp` (incluye `2222`, `Futile hide 04`), `Mount loophole`, `Magic Mount`, `Hueco de montaje`; los medios de tratamiento son los mismos (proveedor de Zygisk «restaurar solo el montaje», cambiar el metamódulo (como Hybrid-Mount), ocultación con PathMask/SUSFS).

</details>

<details><summary><b>Familia de metadatos anómalos de /data/local/tmp（Futile hide / 1 / 2 / 04 / 2222）</b></summary>

#### Método de detección

Todas son determinaciones de anomalía sobre los **metadatos** (marca de tiempo / inode / propietario / permisos) del directorio `/data/local/tmp`; en la app son 5 textos independientes:
- `Futile hide`: se ha modificado la marca de tiempo del directorio;
- `Futile hide 1` / `Futile hide 2` / `Futile hide 04`: variantes distintas de la misma anomalía de metadatos;
- `2222`: variante relacionada con el montaje / los metadatos.

#### Solución

`su -c rm -rf /data/local/tmp` → reiniciar → y después corregir punto por punto según `Suspicious Surroundings (a)/(b)/(c)` (propietario / inode / permisos); en el caso de `Futile hide 1` también se puede reiniciar primero y volver a medir.

Relación: pertenece a la misma familia que `Suspicious Surroundings` y `/data/local/tmp denied`; los medios de tratamiento son los mismos.

---

</details>

<details><summary><b>Inconsistent mount / montaje inconsistente（debug_ramdisk）</b></summary>

#### Método de detección

Compara el montaje resuelto de `/proc/self/exe` con el tipo de sistema de archivos obtenido por `statfs`; si los tipos no coinciden, se activa; hay además una variante de inconsistencia en la vista de montaje de `/debug_ramdisk`.

#### Solución

`su -c umount /debug_ramdisk`.

Nota: en algunos dispositivos hay falsos positivos aún sin corregir (la versión 3.4 ya corrigió una parte).

</details>

<details><summary><b>Magic Mount</b></summary>

#### Método de detección

Comprueba los rastros de magic mount (la reescritura que hacen los módulos sobre el sistema).

Se detectó Magic Mount

Prueba a excluir algunos módulos que modifican el sistema, y a ocultar este problema con ciertos módulos (por ejemplo, la política de exclusión del proveedor de Zygisk).
Lo mismo que arriba: proveedor de Zygisk «restaurar solo el montaje» / cambiar el metamódulo (como Hybrid-Mount, ver «Módulos recomendados» en el Prólogo).

</details>

<details><summary><b>Mount loophole</b></summary>

#### Método de detección

Comprueba si el magic mount de los módulos que modifican el sistema surte efecto sobre las particiones del sistema.

Magic Mount surte efecto en el montaje de los módulos que modifican el sistema

Pero el montaje necesita otro módulo que lo oculte (se puede elegir SusFS / el proveedor de Zygisk)

Usa la política de exclusión del proveedor de Zygisk > restaurar solo el montaje, y configura la lista de exclusión / activa la descarga de módulos por defecto para ocultarlo.
Usa la política de exclusión «restaurar solo el montaje» del proveedor de Zygisk; o cambia el metamódulo (la comunidad recomienda el **metamódulo**).

</details>

<details><summary><b>/data/local/tmp denied</b></summary>

#### Método de detección

Comprueba si se puede acceder a `/data/local/tmp` (permisos / si existe).

Se deniega el acceso al directorio `/data/local/tmp`; ¿problema de configuración de permisos de la carpeta? ¿la carpeta no existe?
Lo mismo que arriba: borra ese directorio, reinicia y luego atiende las entradas que aparezcan de nuevo.

</details>

<details><summary><b>Gestor MT (carpeta MT2) / archivos anómalos</b></summary>

#### Método de detección

Comprueba archivos como `/storage/emulated/0/MT2/`, boot.img, `.xml`, etc.

Archivo anómalo: se detectó la carpeta «mt2» en el directorio raíz y archivos anómalos boot.img / «.xml».

«mt2» se puede resolver cambiando la ruta de MT2 en los ajustes del gestor MT (acuérdate de borrar la carpeta antigua).

</details>

<details><summary><b>Archivo anómalo</b></summary>

#### Método de detección

Coincidencia de nombres de archivo de alto riesgo y características de trampas en ubicaciones como `/dev`, `/data`, `/data/local/tmp`, `/storage/emulated/0` (la lista está en el Apéndice B).

#### Rutas de detección

`/dev` y `/data/local/tmp`
1. Renombra / borra los archivos del directorio correspondiente.

2. Examina y borra las siguientes rutas de alto riesgo:
   ```text
   /data/local/stryker
   /data/system/appretention
   /data/local/tmp/luckys
   /data/local/tmp/input_devices
   /data/local/tmp/hyperceiler
   /data/local/tmp/simplehook
   /data/local/tmp/disabledallgoogleservices
   /data/local/mio
   /data/dna
   /data/local/tmp/cleaner_starter
   /data/local/tmp/byyang
   /data/local/tmp/mount_mask
   /data/local/tmp/mount_mark
   /data/local/tmp/scripttmp
   /data/local/luckys
   /data/local/tmp/horae_control.log
   /data/gpu_freq_table.conf
   /storage/emulated/0/download/advanced
   /storage/emulated/0/documents/advanced
   /data/system/noactive
   /data/system/freezer
   /storage/emulated/0/android/naki
   /data/swap_config.conf
   /data/local/tmp/resetprop
   ```
Al activarse, la entrada muestra directamente la **ruta que realmente coincidió** (la comunidad lo llama «una ruta»); basta con borrarla según la indicación.

</details>

<details><summary><b>Suspicious Surroundings (a)</b></summary>

#### Método de detección

Hace una comprobación de metadatos sobre `/data/local/tmp`: si el grupo propietario del directorio es `shell`.

Grupo propietario anómalo en la carpeta `/data/local/tmp`.

#### Solución

Cambiar el grupo propietario a shell.
Prueba real de la comunidad: este elemento juzga la **anomalía de propietario / grupo propietario** de `/data/local/tmp` (el «grupo propietario anómalo» que dice el documento original se corresponde con ello); basta con volver a ponerlo todo en shell: `su -c chown shell:shell /data/local/tmp`.

</details>

<details><summary><b>Suspicious Surroundings（b）</b></summary>

#### Método de detección

Comprueba si el valor de inode de `/data/local/tmp` es demasiado alto (el umbral medido por la comunidad es **> 10000**; cuando ese directorio se ha borrado / recreado, el inode crece de forma anómala).

#### Solución

(elige una):
1. Restablecer los valores de fábrica;

2. Usar ocultación a nivel de kernel para camuflar el inode de esa ruta por debajo de 1000;

3. Usar el script [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) (basta con descargarlo y ejecutarlo; si no se ejecuta, usa un release antiguo).

Nota: **tras usar Inode-Hijacker, si deja de funcionar la proyección por cable (como Scrcpy)**, ejecuta `su -c restorecon -RF /data/local/tmp` para restaurarlo.

</details>

<details><summary><b>Anomalía en el mapa de fd de Looper</b></summary>

#### Método de detección

Lee los destinos de fd del propio proceso (`/proc/self/fd` + `readlink`) y compara el mapa de fd (archivos abiertos / sockets / inodes anónimos) con lo esperado.

Por ahora desconocido
Este elemento de detección puede aparecer en algunos kernels antiguos; el método de corrección se desconoce por ahora.

</details>

<details><summary><b>Anomalía de muestreo de fdinfo mnt（c）</b></summary>

#### Método de detección

Lee el `mnt_id` de `/proc/*/fdinfo` y hace un análisis estadístico por muestreo, con validación cruzada contra la vista de montaje; los restos de depuración USB o los montajes temporales lo activan con facilidad.

Con alta probabilidad se detectan rastros de depuración USB; con baja probabilidad es un falso positivo. Puedes probar a resolverlo con el script [eliminación de rastros de depuración](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases).

</details>

<details><summary><b>Suspicious Surroundings（c）</b></summary>

#### Método de detección

Comprueba si los permisos de `/data/local/tmp` son el valor por defecto (771).

Se han modificado los permisos de `/data/local/tmp` (por defecto 771).

#### Solución

Volver a establecer los permisos.
Devolver los permisos al valor por defecto: `su -c chmod 771 /data/local/tmp`.

</details>

<details><summary><b>/dev/cpuset/AppOpt</b></summary>

#### Método de detección

Es la firma característica del «montaje de módulos de hilos / planificación» de esa ruta (está en la misma tabla de características que `/data/swap_config.conf`, `/data/encore/*_cpu_gov`, `/data/local/tmp/yshell`, etc.); si el directorio existe, salta.

Se detectó el montaje de módulos de hilos / planificación.
Desinstala el módulo de hilos correspondiente.

</details>

<details><summary><b>/system/bin/fastboot y /system/bin/adb</b></summary>

#### Método de detección

Hace una comprobación de existencia anómala de ejecutables del sistema (`/system/bin/adb` está confirmado en la tabla de características, `fastboot` está por confirmar); es habitual en los paquetes modificados oficiales de Xiaomi.

Se detectaron ejecutables anómalos (habitual en los paquetes modificados oficiales de Xiaomi).
Vuelve a flashear el paquete oficial; o oculta estos dos archivos con PathMask.

</details>

## III. Procesos, espacios de nombres y estado de permisos

El criterio proviene de la topología de `/proc/<pid>`, los enlaces de namespace, el cgroup, `getgroups` y el propio status.

<details><summary><b>Permisos Root anómalos en este proceso</b></summary>

Pendiente de completar

</details>

<details><summary><b>Proceso anómalo 0000（pid）</b></summary>

#### Método de detección

Lo mismo que arriba (fuga del registro de auditoría); 0000 es el pid de ese proceso y se puede averiguar con `ps -ef | grep <pid>`.

0000 representa el pid del proceso

Puedes probar a usar una instrucción de shell para ejecutar como root `ps -ef | grep id-numérico` y encontrar el proceso con ese pid, que normalmente es un demonio con permisos root (como el proceso lspd, el proceso Tricky-Store)

#### Solución

Esta detección depende de una vulnerabilidad de seguridad; actualizar el parche de seguridad al 2026/01/01 puede reducir notablemente la tasa de detección, pero por ahora no se puede resolver del todo: esta vulnerabilidad de seguridad quedará completamente corregida cuando Google publique oficialmente Android 17.

La actualización del parche de seguridad suele ir acompañada de una actualización del sistema; si no puedes actualizar el parche de seguridad porque no quieres actualizar el sistema, puedes ignorar esta entrada.

La clonación de apps a veces puede hacer que esta solución de detección deje de funcionar, pero no resuelve la vulnerabilidad de seguridad en sí, así que la clonación de apps no debe considerarse un método viable.

Puede haber falsos positivos


#### Método de detección (ampliado con pruebas de 4.6.2)

El criterio nativo es un **escaneo de grupos de procesos dentro del cgroup más agrupación por PPID**: primero se enumera la pertenencia de los procesos al cgroup y luego se agrupan en conjuntos padre/hijo por `PPid`; en cuanto un grupo presenta una pertenencia anómala (proceso padre, uid o nivel de cgroup que no coincide con lo esperado), se **emite una línea** `proceso anómalo %1$s` **por cada `tgid` anómalo** de ese grupo.

Por eso un mismo escaneo puede producir varias entradas consecutivas del mismo grupo; `%1$s` procede del nombre de proceso o del cmdline de cada `tgid` (cadena vacía si no se puede leer). Renombrar el proceso o ocultar un solo directorio de cgroup normalmente no elimina el grupo entero; al revalidar hay que comprobar que `Tgid`, `PPid` y la pertenencia al cgroup sean coherentes entre sí.

</details>

<details><summary><b>Anomalía en Zygote</b></summary>

#### Método de detección

Lee la lista de GID de este proceso (proceso hijo de la zygote de la app) y comprueba si existe el **GID 3009 (AID_READPROC)** (la sonda emite `readproc_gid_3009=present/missing`) → si falta, se activa (**la causa de que falte ese GID todavía no se puede confirmar**).

(versión de la comunidad) Se limitan los GID suplementarios de la zygote de la propia app.
En el módulo HMA-OSS, para el detector Chunqiu desactiva `INET_GID` dentro de «limitar permisos de zygote».

Nota: ese interruptor elimina por **lista negra** los GID suplementarios marcados por el usuario (las opciones de HMA-OSS son 1015 / 1023 / 1032 / 1077 / 1078 / 1079 / 3003 / 9997, 8 en total, **sin incluir 3009**). El **criterio** de esta entrada está determinado como «falta el GID 3009», pero **no se puede confirmar todavía si la causa viene de ese interruptor**.

</details>

<details><summary><b>zygote test (1) / orden de bifurcación anómalo de App Zygote</b></summary>

#### Método de detección

Sonda del orden de fork dentro de app_zygote (la zygote de la app) — abre el socket de log con `/dev/socket/logdw` para obtener identity / cookie y, según el orden de `prepare/parent/child`, la supervivencia de padre e hijo y el cierre de fd, determina si quedan restos de **una inyección de Zygisk anterior a app-zygote**; es del tipo canal lateral, inestable.

#### Solución

Activa la «función de linker» y la «función de memoria anónima» del proveedor de Zygisk; pon la política de la lista de exclusión en «restaurar solo el montaje»; si es inestable, puedes volver a medir directamente.

</details>

<details><summary><b>Anomalía en la existencia del directorio OBB</b></summary>

#### Método de detección

Lee por varios medios de solo lectura la **ruta OBB de la propia app** y compara los resultados: `statx` / `newfstatat` / `openat_chain` (sondas `self_obb_path_visible`, `inconsistent_read_only_views`) → si las vistas no coinciden (lo que indica que algún módulo intercepta / oculta esa ruta), se activa.

Se ha instalado un módulo que intenta impedir que el detector escanee los discos.
Por ahora se interpreta como **falso positivo**; se puede activar «limitar permisos de zygote» para el detector Chunqiu en el módulo de ocultación de apps (todo activado menos `INET_GID`).

</details>

<details><summary><b>El dispositivo es un emulador</b></summary>

#### Método de detección

Comprueba características de emulador / virtualización, como `/dev/goldfish_pipe`, `/dev/qemu_pipe`, `/dev/socket/genyd`, `/sys/qemu_trace`, etc., así como palabras clave de modelo como `goldfish` / `ranchu` / `qemu` / `genymotion` / `bluestacks` / `ldplayer` / `nox` / `memu` / `ttvm` / `vbox` / `vmware`; además referencia `android/os/BatteryManager` y `android/telephony/TelephonyManager`, es decir, también tiene en cuenta el **estado de batería / carga y el estado de la SIM**.

#### Solución

Desinstala y vuelve a instalar el detector; evita probar en el estado de **sin tarjeta SIM + batería llena + cargando**.

</details>

<details><summary><b>Entorno de ejecución sospechoso / contenedor / multiapp</b></summary>

#### Método de detección

Verifica si el formato de la ruta de `/proc/self/cgroup` coincide con `^0::/uid_\d+/pid_\d+$` o con `^0::/apps/uid_\d+/pid_\d+$` (las dos expresiones regulares están integradas directamente en el código), y lo combina con sondas relacionadas con parallel / clone (`parallel_ok=`, `signal_parallel_access_mismatch=`); si el formato es anómalo o las sondas no coinciden, se activa.

Se detectó que la app está en un entorno de multiapp / sandbox / contenedor.
Desinstala y vuelve a instalar el detector Chunqiu; **no uses la clonación de apps con el detector Chunqiu**.

</details>

<details><summary><b>Falsificación del entorno</b></summary>

#### Método de detección

La superficie de activación varía según las condiciones de reproducción — ① se activa tras flashear una solución de kernel del tipo parche del registro de auditoría (ver abajo); ② también hay reportes que apuntan a **módulos de camuflaje de propiedades** (`persist.sys.pihooks_*`, `persist.sys.pixelprops.*`, `persist.sys.spoof.gms`, etc., pendiente de verificación); pista para la autocomprobación: si en los maps de este proceso aparece algún módulo relacionado con PIF / IntegrityFix / PixelProps.

¿Puede dar falsos positivos en dispositivos antiguos (kernel de la serie 4)?

**Superficies de activación conocidas:** 
- Se activa tras flashear una solución de kernel del tipo parche del registro de auditoría → desinstala ese módulo;
- Los **módulos de camuflaje de propiedades** (del tipo PIF / pihooks / pixelprops / spoof) también pueden activarlo (pendiente de verificación) → usa `getprop | grep -iE "pihooks|pixelprops|spoof"` para comprobar si quedan restos de camuflaje de propiedades, localiza el módulo correspondiente y trátalo, u oculta las propiedades correspondientes al detector;
- El camuflaje de modelo o de propiedades que traen algunas ROM personalizadas / portadas también puede activarlo.

</details>

<details><summary><b>UID Namespace mismatch（inconsistencia del espacio de nombres del mismo UID）</b></summary>

#### Método de detección

La vista del user namespace bajo el mismo UID es inconsistente (`UID namespace mismatch for same UID`).

#### Solución

Tratamiento: comprueba si el framework de ocultación ha modificado el namespace; cambia / actualiza el metamódulo y vuelve a medir.

</details>

<details><summary><b>Mount Namespace（espacio de nombres de montaje）/ Mount namespace anomaly</b></summary>

#### Método de detección

Vista del espacio de nombres de montaje anómala (`Mount namespace anomaly`); está relacionada con `Montaje inconsistente/debug_ramdisk` y `Hueco de montaje`, pero el criterio es distinto (aquí se compara la vista de namespace, no la tabla de montajes / statfs).

Tratamiento: igual que el grupo de montaje (proveedor de Zygisk «restaurar solo el montaje» / cambiar el metamódulo (como Hybrid-Mount) / ocultación con PathMask, SUSFS).

</details>

<details><summary><b>PID Namespace（espacio de nombres de procesos）/ PID namespace anomaly</b></summary>

#### Método de detección

Vista del espacio de nombres de procesos anómala (`PID namespace anomaly`).

Tratamiento: comprueba los cambios de namespace que hacen el framework de ocultación / el metamódulo, actualiza y vuelve a medir.

</details>

## IV. Llamadas directas a interfaces del kernel y comportamiento anti-depuración y anti-inyección

El criterio proviene de los valores de retorno y la temporización de syscall, ptrace, prctl, mincore, seccomp, netlink y socket, esquivando el envoltorio de libc.

<details><summary><b>Depurador conectado</b></summary>

Pendiente de completar

</details>

<details><summary><b>El entorno de depuración podría ser un dispositivo sin desbloqueo</b></summary>

Inconsistencia en las tres rutas de `/proc`, o dumpable=1/2.

</details>

<details><summary><b>Se detectó un componente de instrumentación dinámica</b></summary>

Se determina que existe un componente de runtime del tipo Frida

</details>

<details><summary><b>Found ksu / dispositivo sin desbloqueo</b></summary>

#### Método de detección

Características del modo sin desbloqueo (jailbreak) de KSU, o se detectan procesos / dispositivos relacionados con ksu (aparecen tras un reinicio en caliente; puedes optar por reiniciar una vez para intentar resolverlo)

#### Solución

Se detecta que KSU está en **modo sin desbloqueo (jailbreak)**, o se detectan factores como procesos relacionados con ksu.

No se recomienda usar el **modo sin desbloqueo (jailbreak)**, por lo que no se ofrece solución.


#### Método de detección (ampliado con pruebas de 4.6.2)

El criterio de 4.6.2 son dos anomalías de estado dentro del propio proceso; basta cualquiera de las dos:

- `getppid() > 5000`: un proceso de app normal debería tener como padre un system zygote creado al principio del arranque, con un pid normalmente muy inferior a 5000; un pid de padre demasiado alto indica que el padre no es el zygote esperado, algo típico de una inyección o de un cambio de padre;
- `Seccomp: 0` en `/proc/self/status`: un proceso de app normal debería ejecutarse bajo el filtro seccomp (el campo suele ser `2`); `0` significa que el filtrado está desactivado.

Este elemento es un **veredicto local**: se sigue reproduciendo en modo avión tras `pm clear`. Ni `pm hide` del gestor de KSU, ni montar `/data/adb` como directorio vacío dentro del mount namespace de la app, ni ocultar `/proc/fs` cambian este elemento ⇒ lee el estado del propio proceso y de su padre, y no depende del gestor de paquetes, del contenido de `/data/adb` ni de los dispositivos loop de `/proc/fs`. `KernelSU loop device`, más abajo, es un detalle aparte.

</details>

<details><summary><b>KernelSU loop device</b></summary>

#### Método de detección

Comprueba si existe un montaje de dispositivo loop con características de KernelSU.

Se detectó KSU

Actualiza tu gestor y vuelve a parchear
Actualiza el gestor y vuelve a parchear; o desactiva / cambia el metamódulo (como Hybrid-Mount, ver «Módulos recomendados» en el Prólogo).


#### Método de detección (ampliado con pruebas de 4.6.2)

El criterio es que **jbd2 y ext4 coincidan a la vez**:

1. enumerar `/proc/fs/jbd2` y buscar entradas con la forma `loop*-8` (es decir, entradas de journal ext4 sobre un dispositivo loop);
2. a cada coincidencia, quitarle el sufijo `-8` para obtener `<dev>` y confirmar que también existe `/proc/fs/ext4/<dev>`;
3. solo si se cumplen ambas se imprime `KernelSU loop device: %1$s`, donde `%1$s` es el nombre del dispositivo.

Ver `loopN` solo bajo `/proc/fs/ext4` no basta para este detalle; si en `/proc/fs/jbd2` solo hay entradas que no son loop, como `sdc*`, tampoco se cumple. El proceso principal normalmente no puede ver `/proc/fs`, así que la revalidación debe hacerse en un servicio aislado o en el dominio zygote que sí pueda leer esa vista de montaje.

</details>

<details><summary><b>kernelsu detected</b></summary>

**Solución:** 
Actualiza el gestor a la [última CI](https://t.me/KernelSU_group/3234/497395)

</details>

<details><summary><b>Se encontró FolkPatch/APatch</b></summary>

Pendiente de completar

</details>

<details><summary><b>Se detectó comportamiento de ocultación del tipo APKey_Hide</b></summary>

Pendiente de completar

</details>

<details><summary><b>Suspicious Surroundings</b></summary>

#### Método de detección

Comprobación de anomalías del entorno (metadatos de `/data/local/tmp`, procesos / servicios sospechosos, etc.).

Se detectó APatch

Actualiza APatch y carga el módulo de ocultación de KernelPatch (como NoHello.kpm, ver «Módulos recomendados» en el Prólogo).

</details>

<details><summary><b>Filtro seccomp activado</b></summary>

Usa este proyecto, compila el módulo y flashealo para resolverlo https://github.com/longze777/UID-

</details>

<details><summary><b>La política NETLINK de las apps normales no surte efecto</b></summary>

— El dominio untrusted_app envía una petición de dump `NETLINK_SOCK_DIAG` y recibe una respuesta de diag AF_UNIX (que en teoría debería rechazar la política).

</details>

<details><summary><b>Netlink socket anomaly</b></summary>

`socket(AF_NETLINK)` falla o `send` escribe menos bytes de los esperados.

</details>

<details><summary><b>Found LSPHook Framework</b></summary>

#### Método de detección

Comprueba los rastros de ejecución de frameworks del tipo LSPosed / LSPatch.

Se detectó LSPHook Framework

Causado por la modificación de algunos módulos xp; también se puede desinstalar y cambiar el módulo LSP.

</details>

## V. Integridad de binarios y mapeos de memoria

El criterio es la comparación de `maps` con los archivos en disco, el análisis de cabeceras / segmentos ELF y la pertenencia de los punteros de la tabla de funciones JNI.

<details><summary><b>Malicious Hook</b></summary>

 El CRC en memoria del segmento ejecutable no coincide con el CRC del mismo segmento en disco.

</details>

<details><summary><b>Critical libc inline hook</b></summary>

Mapeo de memoria incompleto (comparación de los primeros 16 bytes con los bytes en el mismo desplazamiento del archivo libc)

</details>

<details><summary><b>Evil Module</b></summary>

El puntero no está dentro del mapeo de libart.so o está vacío

</details>

<details><summary><b>Evil Service</b></summary>

#### Método de detección

— En nombres de directorio, fd de Binder o `/proc/net/unix` aparecen marcas como lsposed/sui/sandhook/pumpcin, etc. (restos de módulos)

Detección de modificaciones de lsp, shizuku y algunos módulos xp.

#### Método de detección (ampliado con pruebas de 4.6.2)

El criterio nativo tiene cuatro capas, pero **solo la primera decide el veredicto**:

1. **Escaneo de nombres de directorio**: recorre `/dev/binderfs`, `/dev`, `/sys/fs/selinux`, `/proc/self/fd`, `/apex`, `/system/framework`, `/data/misc`, `/data/system`, `/data/local/tmp`, `/storage/emulated/0/` y `/data/`, y activa la familia correspondiente en cuanto coincide una palabra clave:

| Palabra clave (incluidas variantes de mayúsculas) | Familia | Campo en los detalles |
|---|---|---|
| `shamiko`, `Shamiko`, `内核`, `调度`, `suius`, `suidaemon`, `ssssss`, `suidaem` | Sui | `Sui` |
| `sandhook`, `SandHook`, `sandcore` | SandHook | `SandHook` |
| `pumpcin`, `Pumpcin`, `taiwan`, `Taiwan` | Pumpcin | `Pumpcin` / `Taiwan` |
| `tricky`, `Tricky` | EDXposed | `EDXposed` |

2. **Recuento de Binder**: si `/dev/binderfs` tiene más de 3 entradas de directorio se informa como Sui, sin mirar de qué servicio se trata;
3. **Muestreo temporal**: 100 rondas por nombre sobre `lsposed` / `sui` / `sandhook` / `pumpcin`, ponderadas (100 / 50 / 30) según si existe `/dev/binderfs/<name>`, si el nombre aparece en `/proc/self/fd` y si aparece una línea en `/proc/net/unix`, para producir una relación;
4. **Agregación**: cualquier coincidencia de palabra clave del paso 1 (recuento > 0) devuelve positivo; la relación del paso 3 nunca participa en el veredicto.

Tres puntos que conviene saber de las pruebas:

- La relación del paso 3 solo se calcula y nunca se compara con un umbral, así que los canales `/proc/net/unix` y `fd` solo alimentan el texto de los detalles, no el hecho de que el elemento salte;
- `LSPosed:` en los detalles siempre es `NO` (nada activa ese bit), de modo que un positivo de LSPosed llega en realidad por la vía `tricky` → `EDXposed`;
- La regla de «más de 3 entradas en `/dev/binderfs`» es la que más falsos positivos produce: además de `binder-control`, los dispositivos normales llevan varios nodos y llegan a 4 con facilidad. Al investigar, comprueba primero si `Sui:` es el único `YES` y solo entonces sospecha de esta regla.

Limpieza: los directorios y archivos como `sandhook*`, `pumpcin*`, `shamiko`, `suidaemon` y `suius` bajo `/data/local/tmp/` son restos de un módulo desinstalado; borrarlos y volver a escanear tras reiniciar suele eliminar el elemento (aquí se juzga el «resto probatorio», no que «el servicio esté en marcha»).

</details>

<details><summary><b>[Hook] Suspicious library injection</b></summary>

#### Método de detección

Comprueba rastros de inyección de librerías (características habituales de zygisk / riru / xposed).

(zygisk/riru/xposed)

Se detectó HOOK; examina la causa por tu cuenta, hay demasiados factores.

</details>

<details><summary><b>[Hook] Native Bridge detected (emulator/cross-arch)</b></summary>

— `NativeBridgeError()` de `libnativebridge.so` devuelve true.

</details>

<details><summary><b>Zygisk detected</b></summary>

#### Método de detección

Comprueba rastros de inyección de Zygisk (mapeos anónimos ejecutables, entorno del proceso, entrada de módulos, etc.).

Se detectó Zygisk; normalmente lo provoca el zygisk que trae Magisk (se resuelve desactivándolo) u otras causas.

Actualiza el proveedor de Zygisk (http://github.com/Dr-TSNG/ZygiskNext).

</details>

<details><summary><b>Zygisk detector(2)</b></summary>

— Los últimos 1000 bytes de `[stack]` contienen la marca `MAGISK_INJ_1`

</details>

<details><summary><b>LSPosed Detected（%1$d）</b></summary>

Pendiente de completar

</details>

<details><summary><b>Anomalía de memoria</b></summary>

#### Método de detección

Sondas del tipo residencia de páginas / bit de suciedad suave (`clear_refs`, `smaps`, `MADV_COLD`), usadas para descubrir mapeos ocultos o anómalos.

Si sigue apareciendo después de borrar los datos del detector, abre un Issue y facilita la información de tu lista de módulos y qué módulos xp usas; lo estudiaré cuando tenga tiempo.

</details>

<details><summary><b>Dirty Device(a)</b></summary>

#### Método de detección

Detecta carpetas / archivos **cuyo nombre contiene `sh`** bajo `/storage/emulated/0/` (`/sdcard`), así como archivos / controladores relacionados con trampas (algunas versiones lo determinan además junto con el «comportamiento de sustitución de claves»).

#### Solución

El significado de esta entrada es «se detectaron en el dispositivo archivos relacionados con **trampas de juegos**» → **basta con borrarlos tú mismo**; tras borrarlos, reinicia y vuelve a medir.

</details>

<details><summary><b>zygote check（%1$d）</b></summary>

El ctime de cierta ruta es anterior al reloj de muestreo, el directorio tmpfs bajo `/mnt` no está vacío, y los huecos de id de mountinfo (apex/art, `/data_mirror`, etc.) se informan por bits
Este elemento presenta inestabilidad

</details>

## VI. Política SELinux, AVC y canales de auditoría

El criterio son las contradicciones internas entre los resultados de consulta de selinuxfs, las lecturas de la página status, las estadísticas avc y los registros de logcat/auditd.

<details><summary><b>Se encontraron problemas sospechosos al detectar la política SELinux / se detectaron permisos ROOT</b></summary>

#### Método de detección

1. Se toma el context de este proceso (que se espera en el dominio `app_zygote`) como «portador» y se usan **contextos centinela** (`…context_oracle_sentinel:s0` / `…_sentinel_file:s0`) para establecer tres grupos de control: control positivo / control negativo / control de archivo;

2. La consulta va por **escritura raw en selinuxfs** (operando directamente sobre `/sys/fs/selinux/access`, sin pasar por libselinux), y se valida el `avdSeqNo` que rellena el kernel;

3. Se cruzan los resultados de `selinux_check_access` / `getfilecon` con los raw, **se vuelve a comparar tras añadir perturbación** y se comprueba la repetibilidad (`Repeatability`);

4. Se sondea directamente si la live policy sigue aceptando reglas relacionadas con root (transición `shell -> su`, dominios `magisk` / `ksu` / `apatch`, lectura de `ksu_file` / `lsposed_file` / `magisk_file`, etc.) y se comprueba la consistencia de «pares de bits / división» del contexto de KSU.

#### Familias de causas habituales

(se muestra en el detalle cuando se activa): `enforcing is not 1`, `deny_unknown is not 1`, `unexpected version`, `sequence/policyload unexpected`, `direct syscall and libc views disagree (PLT-hook residue)`.

#### Solución

- Referencia del método de detección: [DirtySepolicy](https://github.com/LSPosed/DirtySepolicy);
- El punto de determinación de esta entrada es «la zygote de la app tiene permiso para acceder a `/sys/fs/selinux/access`», así que hay que hacer que el gestor de root o el lado del kernel oculten la modificación de SELinux:
  - **Capacidad propia de la implementación de root (utilizable en la familia KernelSU / la familia APatch)**: actualiza a la última versión y activa «ocultar modificaciones de SELinux» (en la familia KSU hay que volver a parchear la imagen o volver a hacer el **modo sin desbloqueo (jailbreak)** y reiniciar).
    - Rango de versiones de kernel compatibles:
      - Familia APatch: 4.19 y superiores;
      - Familia KernelSU: el rango de compatibilidad no es exactamente el mismo en las distintas ramas y hay que valorarlo caso por caso. Tomando como ejemplo el KernelSU original, solo admite kernels GKI2.
  - **Solución de módulo de kernel (utilizable en la familia KernelSU / la familia APatch / la familia Magisk)**: hooks de SELinux del tipo SELinux_Hook.kpm (módulo de kernel; enlace de selinux_magisk_access_filter en «Módulos recomendados» del Prólogo).
    - Nota: actualmente hay dos módulos disponibles: el selinux_hook original (es decir, selinux_magisk_access_filter) y selinux_MAF_fork. [La dirección del repositorio de selinux_MAF_fork está aquí](https://github.com/741afb7/selinux_maf_fork)
    - Ámbito de aplicación: el selinux_hook original (es decir, selinux_magisk_access_filter) solo sirve para la familia KernelSU / la familia APatch; selinux_MAF_fork se centra en adaptarse a la familia Magisk, pero sigue siendo utilizable en la familia KernelSU / la familia APatch. La familia Magisk debe incluir [este código](https://github.com/topjohnwu/Magisk/commit/5a28d2fcfcd3245f726933d7fd0a6173ea484e32), de lo contrario este método no surte efecto.
    - Modo de ejecución: en la familia KernelSU y la familia Magisk es obligatorio incrustarlo para que surta efecto; en la familia APatch también funciona en modo de instalación.
    - Rango de versiones de kernel compatibles y requisitos:
      - selinux_MAF_fork: 4.19 y superiores, y parte de los kernels 4.14; para más detalles, ver el README del repositorio.
      - selinux_magisk_access_filter: el rango teórico de compatibilidad es 4.9 y superiores, pero ejecutarlo en kernels 4.9 y 4.14 puede conllevar riesgos.
    - Notas especiales:
      1. La familia Magisk no admite de forma nativa módulos de kernel KPM; hay que instalar aparte el soporte de KPM:
         - [KPatch-Next-EXP](https://github.com/741afb7/KPatch-Next-Module-EXP): no incluye la función de actualización por OTA y no se prevé mantenerlo a largo plazo, pero admite el modo de instalación de KPM;
         - [KPM-Manager](https://github.com/Yervant7/KPM-Manager);
         - [KPatch-Next](https://github.com/KernelSU-Next/KPatch-Next-Module): lleva bastante tiempo sin actualizarse y está muy lejos de la última versión de KernelPatch.
      2. Build-in KernelPatch no puede usar este tipo de módulos: la implementación del modo de incrustación de KPM del KernelPatch integrado en el código del kernel es distinta de la del KernelPatch original, y este tipo de módulos no puede surtir efecto en Build-in KernelPatch.
  - Si el gestor actual no pertenece a la familia KernelSU / la familia APatch / la familia Magisk, puedes plantearte cambiar a cualquiera de esos 3 tipos.

*La recopilación de las soluciones anteriores se ha complementado a partir del [PR #45 upstream de 741afb7](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/pull/45); las notas de compatibilidad se mantienen tal como las aportó esa contribución y no han sido verificadas de forma independiente en un dispositivo real por este sitio.*

Relación: `Familia de huellas del estado de SELinux`, `canal de estado de SELinux inconsistente`, `el dispositivo obtiene permisos Root / módulo anómalo` pertenecen a la misma familia de criterios (distintas caras en distintas versiones) y **este documento las ha fusionado en esta entrada**.


#### Método de detección (ampliado con pruebas de 4.6.2)

Lo esencial es **leer y escribir raw selinuxfs directamente dentro de AppZygote** y cruzar varios grupos de lecturas. Cualquiera de estas anomalías entra en este elemento:

- **Grupos de control / control negativo**: tomando el context actual de `app_zygote` como origen, se establecen un control positivo que debe permitirse, un control negativo que debe denegarse y un control de fichero; cualquier grupo cuyo resultado sea el contrario al esperado es anómalo;
- **Campos de la página status**: se leen `version`, `enforcing`, `sequence`, `policyload`, etc. de `/sys/fs/selinux/status`; un valor o una combinación que no encaje (por ejemplo `enforcing` distinto de 1, o saltos en `sequence`/`policyload`) es anómalo;
- **access seqno**: se escriben consultas directamente en `/sys/fs/selinux/access` y se valida el `avdSeqNo`/`seqno` que devuelve el kernel; si el seqno no avanza, la escritura de vuelta es incoherente o una consulta repetida cambia de respuesta, es anómalo;
- **Coherencia de contextos inválidos**: las consultas negativas con source/target/class/perm inexistentes deberían devolver `EINVAL`; si un context inválido se trata como normal y recibe una decisión allow/deny, o si raw selinuxfs y libselinux no coinciden, es anómalo.

El criterio se apoya en la coherencia de las lecturas de `access` / `status`, no en el contenido del fichero `/sys/fs/selinux/policy`; el proceso principal normalmente no puede leer selinuxfs, así que la revalidación debe hacerse en `app_zygote` / dominio zygote.

</details>

<details><summary><b>Proceso ROOT</b></summary>

#### Método de detección

Cruza el registro de auditoría AVC (los registros `auditd` de `logcat -b events`) con `/proc/*/attr/current` para encontrar procesos que se ejecutan con un contexto relacionado con root.

¿Detección del entorno de Zygote?

Lectura a través de la vulnerabilidad del registro de auditoría (avc)

Se puede usar la función de ocultación a nivel de kernel (SusFS, etc.) o una solución de kernel del tipo parche del registro de auditoría

La actualización de seguridad de Android del 2025/09/01 ya lo corrigió (no es exacto, pero el resultado es ese)

</details>

<details><summary><b>Proceso con permisos ROOT</b></summary>

— En el `avc: denied` de logcat aparecen los dominios `su`/`magisk`/`proc_modules`
Aparece tras un reinicio en caliente de KSU (reinicia otra vez para intentar resolverlo
Habitual en dispositivos con jailbreak
No se recomienda usar el modo jailbreak, por lo que no se ofrece solución

</details>

<details><summary><b>Proceso root disfrazado de app privilegiada</b></summary>

Acceso anómalo del dominio app en `avc: denied`

</details>

<details><summary><b>Current-app-root-domain-trace</b></summary>

#### Método de detección

Recorre los PID de `/proc` con la identidad `untrusted_app` y lee uno a uno `attr/current`, `cmdline`, `comm` (lo normal es que SELinux lo rechace todo); después rebusca en `auditd` / `logcat` los registros AVC denied, y si aparece algo del tipo `tcontext=u:r:ksu:s0` se activa (sonda `proc_pid_avc_context_leak`).

Recorre los PID de `/proc` con la identidad `untrusted_app` e intenta leer uno a uno `attr/current`, `cmdline`, `comm` (en condiciones normales SELinux debería rechazarlo todo); después rebusca en los registros AVC denied de `auditd`/`logcat`, y si aparece algo del tipo `tcontext=u:r:ksu:s0` se activa.
**KSU · LKM**: flashea la versión correspondiente de PathMask y activa «protección de aislamiento (procguard)», o flashea una solución de kernel del tipo parche del registro de auditoría (puede provocar la fuga de otros elementos de detección);
**KSU · GKI**: activa «engaño del registro AVC» en los ajustes del gestor;
Medida temporal: desactiva la compatibilidad con el su tradicional (legacy su) y vuelve a activarla después de pasar una ronda de detección.

</details>

<details><summary><b>Se encontró un módulo anómalo</b></summary>

#### Método de detección

Coincide con las firmas características de módulos de control de temperatura / planificación / optimización, entre las que la más habitual es la familia **Encore Tweaks**: la app de gestión, `/system/bin/encore_profiler`, `/data/encore/default_cpu_gov`, `/data/encore/custom_default_cpu_gov`, `/data/local/tmp/encore_logo.png`; al activarse se reportan respectivamente textos como `Encore 管理端已安装 / Encore Tweaks 模块 / Encore Tweaks 可能`.

#### Solución

Examina y desinstala los módulos correspondientes (este tipo de entradas se activan muchas veces de forma probabilística; puedes reiniciar varias veces y volver a medir).

</details>

<details><summary><b>Hay un módulo que modifica Chunqiu</b></summary>

#### Método de detección

Compara los rastros de modificación de este proceso (política / inyección / montaje) con lo esperado.

Aparece tras usar el módulo IsolPolicy; se resuelve cerrando el ámbito o desinstalando el módulo.

No se trata solo de módulos: por ejemplo, una versión antigua de ksu con la ocultación de modificaciones de SELinux activada también cuenta; prueba a seguir la última CI del gestor de root correspondiente para resolver este problema.

</details>

## VII. Keystore, KeyMint y TEE

El criterio proviene del análisis de KeyGen / la cadena de certificados, los valores de retorno y códigos de error de KeyMint, la relectura de canary, y el comportamiento de LRU y SOTER.

<details><summary><b>Clave AOSP</b></summary>

#### Método de detección

El keybox está firmado con la raíz de pruebas de AOSP (en lugar de una raíz oficial de fabricante / Google).

Cambia el archivo `keybox.xml` del directorio `/data/adb/tricky_store/`.

También se puede optar por flashear el plugin de TS y, tras reiniciar, abrir la interfaz webUI del módulo para configurar las claves.

</details>

<details><summary><b>Boot Hash no coincide</b></summary>

#### Método de detección

Compara el hash de boot / vbmeta (como `ro.boot.vbmeta.digest`) con el valor de la línea base.

El Hash de la imagen boot no coincide.

Normalmente en los **dispositivos realmente desbloqueados** el hash pasa a 0000; usa [Native detector](https://t.me/rootdetector/49) para obtener el hash correcto y luego usa el módulo de claves y configura el hash con el plugin de TS para resolverlo.
Activa la certificación de claves, toma el valor de `VerifiedBootHash` y escríbelo con el plugin de TS.

</details>

<details><summary><b>El certificado ha sido revocado (CRL)</b></summary>

#### Método de detección

El número de serie del certificado coincide con la lista de revocación (biblioteca estática local o consulta en línea).

Cambia el archivo `keybox.xml` del directorio `/data/adb/tricky_store/`

</details>

<details><summary><b>Manipulación de claves / manipulación de la cadena de certificados(x)</b></summary>

#### Método de detección

- Manipulación de claves: no se supera la determinación de consistencia de los atributos de la clave / la cadena de certificados; al activarse se indica el grupo;
- Manipulación de la cadena de certificados(x): la capa Java lee la propiedad del sistema `ro.secureboot.lockstate` (esa propiedad está en la misma tabla que propiedades de ROM de fabricante como `ro.lenovo.series`, `ro.lewa.version`, `ro.meizu.product.model`, `ro.miui.ui.version.name`, `ro.vivo.os.build.display.id`, etc.); si se obtiene `unlocked`, se activa.

#### Grupos

- **128**: el más habitual. Suele aparecer cuando el módulo de claves usa por defecto el «modo de generación de cadena de certificados» en dispositivos OnePlus / Qualcomm;
- Los motivos de otros grupos (como q, b) no se han hecho públicos por ahora.

#### Solución

- Manipulación de claves: cambia / actualiza el módulo de claves y completa la configuración según «Configuración correcta de los módulos» (lista target, fecha del parche de seguridad, boot hash);
- Manipulación de la cadena de certificados(x): `su -c '/data/adb/ksud' resetprop ro.secureboot.lockstate locked` (en Magisk se usa `resetprop`).

Relación: pertenece a la misma familia de consistencia de cadena de certificados / claves que `Prueba de claves incompleta o cadena inconsistente`.

---

</details>

<details><summary><b>TEE dañado</b></summary>

#### Método de detección

La clave / cadena de certificados del lado del TEE está incompleta o no disponible.

Se resuelve con el módulo de claves, junto con el plugin de TS.

Tras flashearlo, reinicia; al arrancar, abre la webUI del módulo para configurarlo.

En dispositivos con el TEE dañado, usa el modo de generación de cadena de certificados.
En `/data/adb/tricky_store/target.txt`, añade `!` al nombre de paquete de este detector (indica procesamiento forzado); se puede escribir en lote con un script:
```
su
TRICKY_DATA="/data/adb/tricky_store"
{ echo "com.google.android.gms!"; echo "com.android.vending!"; pm list packages -3 | sed 's/^package://;s/$/!/'; } > "$TRICKY_DATA/target.txt"
```

</details>

<details><summary><b>Entorno TEE no confiable</b></summary>

#### Método de detección

Comprueba si existe el programa de servicio Tencent Soter + el estado de las propiedades de su servicio, y cruza ambos para verificar si la clave Soter está bloqueada (determinación de cuatro cuadrantes, ver abajo).

Procede del [SoterService](https://github.com/Tencent/soter) de Tencent
Función: el pago por huella de WeChat, etc.

Comprobando los archivos se determina si existe el programa de servicio Soter y se juzga el estado de las propiedades de su punto de servicio para verificar de forma cruzada si la clave Soter está bloqueada.
1. Estado de las propiedades del punto de servicio anómalo + existe el programa de servicio Soter -> Soter bloqueado (anómalo)

2. Estado de las propiedades del punto de servicio anómalo + no existe el programa de servicio Soter -> este dispositivo no admite Soter de forma nativa (normal)

3. Estado de las propiedades del punto de servicio normal + existe el programa de servicio Soter -> este dispositivo admite Soter (normal)

4. Estado de las propiedades del punto de servicio normal + no existe el programa de servicio Soter -> imposible

#### Solución

- Usa SusFS o [PathMask](https://github.com/Andrea-lyz/LKM-PathMask) para ocultar la ruta del servicio correspondiente, y usa HMA para ocultar al detector el programa de sistema «com.tencent.soter.soterserver», e intenta resolverlo así

*Nota*: PathMask no está especializado en la ocultación del entorno; úsalo con precaución.

*Principio*: actualmente, técnicamente no podemos simular el servicio Soter, pero sí ocultar los archivos relacionados con Soter para falsificar el segundo caso.

</details>

<details><summary><b>TEE falsificado</b></summary>

#### Método de detección

La cadena de certificados / los atributos de la clave muestran que el comportamiento del TEE está simulado.

Se resuelve con el módulo de claves (modo de generación de cadena de certificados).

</details>

<details><summary><b>TEE falsificado(2)</b></summary>

#### Método de detección

Mediante reflexión sobre Keystore2 se crea una clave con los usos `SIGN + ATTEST_KEY` a la vez: un dispositivo normal debería rechazar ese uso mixto (como `-3`); si la clave puede firmar con normalidad pero fallan ambas tandas de emisión de subcertificados, «con challenge / sin challenge» (como `-49`), se determina TEE falsificado(2).

Primero confirma que la firma normal y la emisión de subcertificados con una clave puramente ATTEST_KEY funcionan bien.
Crea mediante Keystore2 una clave con los usos SIGN + ATTEST_KEY a la vez.
Si firma con normalidad, pero en las dos tandas de prueba, con y sin desafío, la emisión de subcertificados devuelve -49, se reporta «TEE falsificado(2)».
Si al crearla se rechaza con normalidad el uso mixto (como el -3 de una máquina normal), o si ambas capacidades funcionan bien, no se reporta.

#### Solución

Cambia / actualiza el módulo de claves (ver «Módulos recomendados» y «Configuración correcta de los módulos» en el Prólogo); tras configurarlo, reinicia y vuelve a medir.

</details>

<details><summary><b>Tee falsificado 3</b></summary>

**Método de detección:** 
En un dispositivo con el TEE dañado se ha usado el módulo Tricky-Store para simular el comportamiento del TEE y se ha detectado

**Solución:** 
Puedes esperar a que el módulo se actualice y lo corrija, o usarlo junto con el módulo OhMyKeymint, para intentar resolverlo

</details>

<details><summary><b>Tee falsificado(2-c)</b></summary>

**Método de detección:** 
En un dispositivo con el TEE dañado se ha usado el módulo TEESimulator/RS para simular el comportamiento del TEE y se ha detectado

**Solución:** 
Puedes esperar a que el módulo se actualice y lo corrija, o usarlo junto con el módulo OhMyKeymint, para intentar resolverlo

</details>

<details><summary><b>Se encontró TEESimulator</b></summary>

Diferencia de temporización en el descifrado AES
Cambia a un módulo de simulación de TEE mejor o espera a que el módulo se actualice

</details>

<details><summary><b>TrickyStore Hook/2</b></summary>

#### Método de detección

Compara la cadena de certificados / los atributos de la clave que devuelve Keystore con las diferencias frente a las características del TEE de un dispositivo real (incluye el método de canal lateral, inestable).

Canal lateral (inestable); puede desaparecer al volver a abrirlo

Cambia el módulo de claves (como TEESimulator-RS / OhMyKeymint)

</details>

<details><summary><b>FOUND oh my keymint</b></summary>

La generación por duplicado de una clave de uso mixto devuelve Keystore2
Solución: actualiza el módulo

</details>

<details><summary><b>Tampered Attestation Key(X)（incluye 16 / 31）</b></summary>

#### Método de detección

Hace una verificación de consistencia de más de 20 tipos de etiquetas sobre la cadena de certificados de la prueba de claves, por ejemplo: si el `KeyUsage` del certificado hoja contradice la extensión `KeyPurpose`, si el algoritmo de firma del certificado hoja coincide con el algoritmo de la clave emisora, si la etiqueta del parche de seguridad dentro del certificado coincide con la propiedad del sistema, que haya `APPLICATION_ID` sin challenge, que `USER_ID` aparezca en `teeEnforced`, que una etiqueta de marcador de posición de fabricante siga emitiendo claves con éxito, etc.; al activarse se indica el número de etiqueta concreto.

#### Números de etiqueta habituales

- 15: cadena HanAttest inconsistente (no tiene el mismo origen que las constantes de TeeSim, pero está en la misma mask)
- 16: familia de cadenas HanAttest inconsistentes (en su mayoría falsos positivos)
- 18: la etiqueta KeyMint de marcador de posición de fabricante sigue emitiendo la clave con éxito
- 23: el KeyUsage del certificado hoja contradice el KeyPurpose de la extensión
- 24: alias demasiado largo en Binder / anomalía en la sonda de transacciones grandes
- 25: el SigAlg del certificado hoja no coincide con el algoritmo de la clave emisora
- 26: la etiqueta patch del certificado no coincide con la propiedad del sistema (ver el script más abajo)
- 27: `USER_ID` aparece en teeEnforced
- 29: hay `APPLICATION_ID` sin challenge
- 30: no se rechaza el attest de identificadores sensibles del dispositivo (como SERIAL)
- 31: fecha del parche de seguridad anómala (los fabricantes nacionales la unifican en YYYY-MM-01; Lenovo / Nubia la actualizan al día 05; pixel / Samsung quedan excluidos)

#### Solución

- **26**: [ejecuta este script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) para escribir en `/data/adb/tricky_store/security_patch.txt`;
- **Atención Xiaomi / Redmi**: en los sistemas actualizados alrededor de 2026-03, la hora de compilación y la fecha del parche de seguridad ya no coinciden de por sí, **y se reporta (26) tanto con root como sin él → basta con ignorarlo**; los módulos de claves modificados, los módulos de ocultación todo en uno y algunos módulos que cambian el modelo también lo provocan; vuelve al original o desinstálalos;
- **16 / 31**: en su mayoría son falsos positivos puros (también pueden activarse de forma probabilística en dispositivos falsamente rebloqueados o sin root) → vuelve a medir o ignóralos directamente.

</details>

<details><summary><b>Manipulación del certificado TrustedCert</b></summary>

Los bytes releídos de TrustedCertificateEntry no son iguales a los bytes originales

</details>

<details><summary><b>Se encontró TrickyStore / un módulo similar</b></summary>

#### Método de detección

La cadena de certificados la genera el módulo (cadena sintética) y no coincide con las características de una cadena TEE real.

**Intento 1**: cambia el módulo de claves (como TEESimulator-RS / OhMyKeymint)

**Intento 2**: borra el archivo `/data/adb/tricky_store/security_patch.txt`

</details>

<details><summary><b>Prueba de claves incompleta o cadena inconsistente</b></summary>

#### Método de detección

La cadena de certificados de la prueba de claves está incompleta o no coincide con la cadena esperada.

Usa el módulo de claves y, tras configurarlo, intenta resolverlo

</details>

## VIII. Gestión de paquetes, visibilidad de apps y rastros de instalación

El criterio proviene de las listas de `pm`/PackageManager, del directorio `/sdcard/Android/data`, de la visibilidad de puertos y de rutas fijas.

<details><summary><b>Se encontró el gestor de ROOT</b></summary>

#### Método de detección

Método nativo `runRootManagerIntentChecks` — usa Intent / visibilidad de paquetes (`<queries>`) para sondear si el gestor de root está instalado o puede responder (corresponde a las entradas nuevas del manifest de la versión nueva: `me.bmax.apatch.magica.LAUNCH`, KSU `magica.LAUNCH`, `ksu://`, etc.).

#### Solución

Basta con usar el **módulo de ocultación de apps** para ocultar el gestor de root al detector (ver «Módulos recomendados» y «Configuración correcta de los módulos»).

Relación: pertenece al grupo «rastros de ROOT» junto con `Found ksu/dispositivo sin desbloqueo`, `Suspicious Surroundings`, `SU binary detected`, `Se encontraron problemas sospechosos al detectar la política SELinux / se detectaron permisos ROOT`, y pueden activarse a la vez.

---

</details>

<details><summary><b>App de riesgo / «nombres de paquete» de Risk apps</b></summary>

#### Método de detección

Lee los nombres de directorio bajo `/storage/emulated/0/Android/data/` para obtener los nombres de paquete instalados (las apps normales no suelen tener ese permiso) y, cuando se puede sortear, se vale de **caracteres Unicode de ancho cero** para saltarse la restricción de lectura (no es un medio fijo), y luego lo compara con la lista de riesgo (la lista está en el Apéndice A).

#### Solución

- Combinación eficaz: **modo de lista negra del módulo de ocultación de apps + solución de corrección de la lectura de ancho cero** ([FuseFixer](https://github.com/5ec1cff/FuseFixer)); en algunos modelos, tras activar el ámbito el dispositivo puede quedarse colgado en el arranque; basta con desactivarlo en modo seguro;
- Si solo quieres que pase este elemento del detector Chunqiu: en el módulo de ocultación de apps, activa «limitar permisos de zygote» para el detector Chunqiu, todo activado menos `INET_GID`;
- En este tipo de entradas cuyo medio de determinación se desconoce, también se puede usar el módulo de ocultación de apps para ocultar las apps sospechosas al detector.


#### Método de detección (ampliado con pruebas de 4.6.2)

4.6.2 compara la tabla interna de paquetes de riesgo por dos canales a la vez:

- `pm list packages`: interpreta los nombres de paquetes instalados que devuelve el gestor de paquetes;
- `/sdcard/Android/data/<paquete>`: enumera los nombres de directorios de datos externos y compara `<paquete>` con la tabla de riesgo; los nombres de directorio que llevan caracteres de ancho cero (como U+200B / U+200C / U+200D / U+FEFF) también se normalizan, así que los caracteres de ancho cero ya no sirven para sortearlo.

Tras `pm hide <paquete>` el paquete desaparece de la lista de riesgo, lo que solo demuestra que el **canal del gestor de paquetes** se ve afectado — no permite concluir que el canal de directorios no exista; al contrario, borrar `/sdcard/Android/data/<paquete>` solo suprime el **canal de directorios**, y `pm list packages` puede seguir acertando.

</details>

<details><summary><b>Lista de apps ocultas</b></summary>

 El nombre de directorio coincide con la tabla de riesgo pero `pm` no lista el paquete correspondiente (solo se muestra cuando no hay apps de riesgo)

</details>

<details><summary><b>Puede que exista HMA</b></summary>

#### Método de detección

Comprueba si existen servicios / características de paquete relacionados con HMA (Hide My Applist), mientras el detector no ve la app correspondiente.

Se sospecha que detecta el comportamiento de la versión antigua que usa el módulo Scene_Hide-eBPF (no detecta que exista la app de scene, pero detecta el servicio relacionado)

[Proyecto derivado / traer las actualizaciones y recompilar el módulo y flashearlo / descargar desde Releases](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
Si es una versión antigua / crackeada / no oficial de Scene: consulta [Scene-Port-Hider-by-eBPF](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF); con el Scene oficial basta con actualizar a la última versión.
(Nota: HMA (Hide My Applist) y Scene son dos módulos con fines distintos; esta entrada y «Se detectó ocupación del puerto de Scene» pueden aparecer a la vez y se tratan por separado.)

</details>

<details><summary><b>SU binary detected</b></summary>

#### Método de detección

Detecta binarios su / similares en rutas habituales.

Se detectó el binario SU (se detectó ROOT)
Atención usuarios de iQoo/Vivo: `/apex/com.android.virt/bin/su` coincide → mueve ese archivo o quítale el bit de ejecución.
Principio general: **no le des permisos root al detector Chunqiu**.

</details>

<details><summary><b>Mount Detector(14)</b></summary>

Pendiente de completar

</details>

<details><summary><b>La lista de apps ocultas surte efecto 2</b></summary>

**Solución:** 
Actualiza hma/hma_oss a la última versión
[Canal de actualizaciones de HMA](https://t.me/HideMyApplist/175)
[Canal de actualizaciones de HMA_OSS](https://t.me/buggychat/121613)
Flashea este módulo para resolverlo [UIDFilter](https://t.me/Suxiaomingpd/402)
Si es la lista de apps ocultas la que surte efecto, desactiva el «camuflaje del origen de instalación» para el detector Chunqiu
</details>

<details><summary><b>Se encontró el tratamiento de pila de HMA</b></summary>

**Solución:** 
[Canal de actualizaciones de HMA](https://t.me/HideMyApplist/175)
[Canal de actualizaciones de HMA_OSS](https://t.me/buggychat/121613)
</details>

## IX. Temporización, residencia de páginas y canales laterales diferenciales

El criterio es la relación de tiempo que tarda la misma operación en distintos portadores y el cambio de estado referenced/residente de las páginas, no un único valor de retorno.

<details><summary><b>Abnormal Environment</b></summary>

#### Método de detección

(coincide con la [explicación del canal lateral de KSU/APatch](/File/Doc/ksu_kp_sidechannel_zh.md) del repositorio):
- **APatch / KernelPatch**: ①**sonda de «página de asignación perezosa»** — se toma la dirección de una página de «asignación perezosa» (que solo ocupa dirección virtual y aún no tiene página física mapeada) como la dirección donde está el superkey y se lanza una petición de autenticación; cuando KernelPatch desreferencia esa dirección, la página se **mapea / se lee de verdad**, y el detector comprueba después si esa página está mapeada para determinar si existe KernelPatch; ②**sonda de latencia de autenticación** — se preparan de antemano un «cmd dentro del rango» y un «cmd fuera del rango», se lanzan autenticaciones por separado y se toman varias medidas sumándolas para estabilizar la relación; si la proporción de tiempos entre ambas supera aproximadamente 2, se determina que existe.
  La salida de esta entrada en la interfaz es una **comparación de kB a nivel de página** (como `No-read control: 0→0 kB, expected` / `Read control: 0→4 kB, expected` / `Target call: 0→4 kB, unexpected read`) y la consistencia entre rondas (`Consistency: n/n`); en esencia, de lo que se trata es de determinar «si esa página se ha mapeado / leído realmente».
- **KernelSU**: el framework usa un hook Kprobe sobre `newfstatat` / `faccessat`, lo que alarga notablemente el tiempo de ambos, mientras que `statx` no se ve afectado; se toma el tiempo total de varias llamadas y se calcula la proporción, y si `newfstatat : statx > 1.2` se determina que existe KernelSU.
- Esto también explica por qué este tipo de KPM de ocultación a nivel de kernel tiene que «rechazar la autenticación antes de evaluar el cmd»: al no entrar en la ruta de lectura / validación del superkey, las dos sondas fallan a la vez.
- Nota: hay otra entrada, `Se encontró la clave de autenticación de APatch`, que mide «si el kernel lee de más la página de argumentos del usuario en esa ruta de syscall», y **la lista de exclusión no le afecta** (la lectura ocurre antes / fuera del punto de interceptación); ver el detalle en esa entrada.

Se detectó KSU/APatch (detección por canal lateral)

Para el principio de detección, consulta [este documento](/File/Doc/ksu_kp_sidechannel_zh.md)

#### Solución

**Solución (familia KernelSU)**: actualiza tu gestor de KernelSU y vuelve a parchear (modo de trabajo LKM) o vuelve a integrar (modos de trabajo GKI y Non-GKI).

**Solución (familia APatch)**:
1. Incrusta / carga **NoHello.kpm** (el enlace del módulo está en «Módulos recomendados» del Prólogo) y añade el detector a la lista de exclusión — ese KPM puede determinar, antes de que KernelPatch evalúe el valor de `cmd`, si la app que lanza la petición de autenticación está en la lista de exclusión, y en tal caso prohibir la autenticación.

2. Las versiones futuras de APatch introducirán un método de autenticación basado en firma, que rechazará directamente la petición de autenticación de las apps que no cumplen la firma pero la han lanzado. Por ahora no está completamente implementado y hay que esperar un tiempo.

**Solución (KPatch-Next)**: actualiza el driver KPatch-Next a 0.13.5-2.

Principio: las versiones antiguas de KPatch-Next heredaban por completo el método de autenticación de KernelPatch, así que los métodos de detección por canal lateral viables en APatch también lo eran en las versiones antiguas de KPatch-Next; pero la última versión de KPatch-Next implementa la autenticación juzgando el uid del componente de espacio de usuario kpatch-android, por lo que ya no se puede detectar por canal lateral.
Prueba real de la comunidad: este elemento es **inestable y aparece de forma probabilística**; la misma versión del gestor puede activarlo en un dispositivo y no en otro (se puede probar a **degradar el gestor**); también aparece con facilidad tras activar la lista de exclusión en APatch.

</details>

<details><summary><b>Se encontró la clave de autenticación de APatch</b></summary>

#### Método de detección

Canal lateral cuyo criterio es «**la página de argumentos de la llamada al sistema se lee de más**». El detector coloca los argumentos / el búfer de la llamada objetivo en una página de usuario monitorizada y mide, antes y después de la llamada, cuántas páginas (kB) ha leído el kernel de esa página:
- `No-read control`: una llamada en la que «el kernel, por semántica, no debería leer esa página» → se espera `0→0 kB`;
- `Read control`: una llamada en la que «el kernel debería leer esa página» → se espera `0→4 kB`;
- `Target call`: la llamada objetivo → si aparece `0→4 kB, unexpected read`, significa que el kernel **lee una vez de más la memoria de usuario** en esa ruta de syscall, es decir, que esa ruta recibe un tratamiento adicional del parche del kernel (la ruta de autenticación de KernelPatch / APatch).

Esta entrada emite además `Argument layouts` (sonda del diseño de registros con el que el kernel lee los argumentos de la llamada al sistema), la consistencia entre rondas `Consistency: n/n`, `Page size` y `Probe duration` (de orden de segundos; el muestreo es bastante pesado).

**Relación con `Abnormal Environment`**: ambas apuntan al mismo tipo de canal lateral de «ruta de autenticación» — la [explicación del canal lateral de KSU/APatch](/File/Doc/ksu_kp_sidechannel_zh.md) del repositorio describe dos criterios, «si la página de asignación perezosa está mapeada» y «la relación de latencia de autenticación»; esta entrada es una implementación que hace la comparación por **cantidad de páginas leídas**, una variante distinta de la misma idea, y pueden corroborarse mutuamente.

#### Solución

Las versiones nuevas de KernelPatch ya han ajustado la ruta de autenticación, así que la explicación antigua de «solo cabe esperar a que el upstream lo corrija» ya no vale para todas las versiones:

- **Actualizar APatch**: usa la versión nueva de [APatch](https://github.com/bmax121/APatch) que ya integra ese cambio. La condición clave es que **el KernelPatch que se ejecuta realmente incluya la nueva lógica y que la imagen parcheada no traiga un SuperKey predefinido**; instalar solo el APK del gestor nuevo no equivale a que el parche del kernel esté actualizado. Actualiza el parche del kernel siguiendo el proceso oficial de actualización de la versión correspondiente, reinicia y vuelve a medir.
- **También se puede considerar [Aster](https://github.com/LyraVoid/Aster)**: gestor desarrollado por 有希 (Matsuzaka Yuki), autor de FolkPatch, sobre la cadena de capacidades de APatch. El proyecto usa una interfaz moderna Miuix; según la presentación del proyecto y los comentarios del autor, su orientación es la de cambios contenidos y estabilidad ante todo. Los usuarios que quieran probar esta vía pueden consultar el repositorio y obtener la versión adaptada. Usarlo exige igualmente confirmar el KernelPatch en ejecución y la condición de ausencia de SuperKey predefinido; no basta con cambiar el APK para dar la corrección por hecha.
- **Aviso de versiones**: según los comentarios de versión facilitados por el mantenedor, FolkPatch **115032** todavía no ha cambiado al KernelPatch que incluye este cambio, por lo que aún puede activar este elemento; esto no es una conclusión sobre las versiones posteriores de FolkPatch.

La versión nueva solo lee el primer argumento y ejecuta `auth_superkey()` cuando se cumple `has_preset_superkey()`. Sin SuperKey predefinido se salta esa lectura: el UID del gestor de confianza obtiene autorización completa, los UID normales ya autorizados se marcan solo como llamadores de confianza y las operaciones restringidas siguen necesitando autorización adicional. Por eso, **nueva lógica + sin SuperKey predefinido** puede eliminar esta lectura extra de páginas a la que apunta esta entrada; si sigue habiendo un SuperKey predefinido, la ruta de lectura correspondiente sigue existiendo. Esto no equivale a haber eliminado el SuperKey ni garantiza pasar otros elementos de detección.

[Base en el código fuente](https://github.com/bmax121/KernelPatch/blob/997b687f19d150642d56a5c4a49dc06143d33422/kernel/patch/common/supercall.c#L395-L434). La «última versión» de APatch hay que distinguirla entre el Release oficial, las compilaciones de CI y el KernelPatch que llevan incorporado: no se puede dar por hecho que ya incluye el cambio solo por el nombre de la versión. Antes de cambiar de gestor o de actualizar el parche del kernel, conserva la imagen de arranque original y un medio de recuperación disponible; esta explicación no pretende que se cambie de solución de Root a ciegas por un único resultado de detección.

#### Nota

Esta entrada, en la interfaz en inglés, **no tiene por ahora un título en inglés equivalente** (solo se muestra en chino).

</details>

<details><summary><b>Miscellaneous Check(12)</b></summary>

#### Método de detección

Usa la residencia de páginas de `smaps` (`Referenced`) junto con `MADV_COLD` / `clear_refs` para hacer un escaneo heurístico y detectar mapeos ocultos o implementaciones del tipo Zygisk; la implementación actual tiene problemas y puede dejar de funcionar o dar falsos positivos.

Detecta heurísticamente implementaciones de Zygisk (sobre todo el proveedor de Zygisk) escaneando smaps, pero la forma de implementación actual tiene problemas, lo que hace que la detección no funcione.

Ignora esta entrada hasta que el método de detección se corrija o se elimine.

</details>

## X. Servicios locales y forma de la terminal

El criterio es la ocupación de puertos locales, la consulta de servicios del sistema y la forma del tty.

<details><summary><b>Se detectó ocupación del puerto de Scene</b></summary>

#### Método de detección

Comprueba si el puerto local / servicio que usa Scene está escuchando.

Consulta este [proyecto](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) e intenta resolverlo.

Ignora este elemento de detección, o desactiva el permiso de accesibilidad de scene, o actualiza scene a 9.3.1 o superior.

</details>

<details><summary><b>Thanox service detected</b></summary>

#### Método de detección

Comprueba los servicios relacionados con Thanox.

Se detectó el servicio Thanox.

Puedes usar este módulo xp para ocultarlo: [hideThanox](https://t.me/Suxiaomingpd/125).

</details>

<details><summary><b>Entorno de terminal dudoso</b></summary>

#### Método de detección

Comprueba si hay rastros de pty (emulación de terminal).

Se detectó Pty.

</details>

## Apéndice: entradas no incluidas en los criterios anteriores

<details><summary><b>Something wrong</b></summary>

#### Método de detección

Excepción interna / acierto sin clasificar.

Desconocido

</details>

<details><summary><b>Entorno dudoso 1 (detección experimental)</b></summary>

#### Método de detección

Determinación experimental de consistencia del entorno (reporte de la comunidad: aparece con el módulo de ocultación de apps en modo de lista negra + marcando el preajuste «teclado»).

Tras activar en el módulo de ocultación de apps el modo de lista negra para ocultar el detector, ¿aparece este elemento de detección si se marca la opción «teclado» de los preajustes?

</details>

<details><summary><b>Información falsificada no válida(1)</b></summary>

#### Método de detección

Se activa cuando Widevine (`MediaDrm`) informa `securityLevel = L1`, `openSession()` lanza `NotProvisionedException` y `getProvisionRequest().getData()` devuelve datos de longitud **0**.

Nota: **cuando el dispositivo informa L3, este punto de detección se omite directamente** (solo con `securityLevel = L1` se continúa con la determinación posterior).

#### Síntoma

El dispositivo muestra Widevine L1 (tanto DRM Info como la «información del dispositivo» del detector muestran L1), pero esta entrada sigue determinando «no coincide con L1». Esta entrada **no tiene detalle desplegable** en la interfaz (es una entrada de tipo resumen).

**Primer paso: determinar primero si es un falso positivo**
1. Reproduce contenido que **necesite L1 para decodificarse** (HD / 1080p+ de Netflix / Disney+ / Prime, etc.):
   - Si se reproduce con normalidad en HD / 1080p+ ⇒ el L1 en sí es normal y esta entrada **con alta probabilidad es un falso positivo** (se sabe que en dispositivos Xiaomi, incluidos **dispositivos de fábrica sin desbloquear**, también se activa de forma estable); puedes ignorarla y esperar a una actualización de versión;
   - Si solo se reproduce en SD ⇒ continúa con el paso 2.

2. Examina los módulos que «falsifican el estado L1»: la lista target del módulo de claves, `keybox.xml`, la sincronización del parche de seguridad y los distintos módulos de PIF / camuflaje de propiedades; desactívalos uno a uno y **reinicia** para volver a medir.

3. Solo en último lugar plantéate la «clave RKP remota (RKPConfig)»: si el propio dispositivo ya es RKP (entrega remota de claves) normalmente no sirve, y actualmente en los modelos Xiaomi no sirve en general.

⚠️ **Aviso de seguridad**: las apps del tipo RKPConfig hacen que el dispositivo solicite a Google la entrega de claves RKP, lo que **altera el suministro de claves / el estado de certificación del dispositivo**; antes de instalarlas, confirma que la fuente es fiable y que se puede revertir.
Complemento de las pruebas de la comunidad: **en dispositivos falsamente rebloqueados / sin desbloqueo / sin root alguno también se activa de forma probabilística**, así que se puede ignorar directamente; si quieres intentarlo, aun así se recomienda determinar primero con el «primer paso» de arriba si el L1 funciona realmente.

</details>

<details><summary><b>Miscellaneous Check(4/5/6/7/8/9)</b></summary>

#### Método de detección

Un grupo de detecciones de emulador / máquina virtual, comportamiento de cambio de dispositivo, ROM de terceros y portadas, etc.; en algunos modelos (como Poco / Samsung de dispositivos extranjeros) hay falsos positivos.

Algunas detecciones de emulador / máquina virtual, de comportamiento de cambio de dispositivo y de ROM de terceros y portadas.

Falsos positivos en dispositivos extranjeros Poco / Samsung (pendiente de corrección).
Reporte de la comunidad: en modelos de ultramar Poco / Samsung hay falsos positivos; en algunos dispositivos, usar Scene también lo activa.
Si sigue activándose tras desinstalar el módulo que cambia el dispositivo, en la mayoría de los casos se debe a restos del módulo o a comportamientos irreversibles.

</details>

---

## Apéndices

<details><summary><b>Apéndice A: nombres de paquete de riesgo / en lista negra (85)</b></summary>

Recopilado a partir de los aciertos medidos por la comunidad; cambia con las versiones.

- `cn.android.x`
- `cn.aodlyric.xiaowine`
- `cn.geektang.privacyspace`
- `cn.kwaiching.hook`
- `cn.myflv.monitor.noactive`
- `cn.myflv.noactive`
- `com.apocalua.run`
- `com.byyoung.setting`
- `com.coderstory.toolkit`
- `com.cshlolss.vipkill`
- `com.ddm.qute`
- `com.demo.serendipity`
- `com.didjdk.adbhelper`
- `com.dna.tools`
- `com.example.ourom`
- `com.fankes.enforcehighrefreshrate`
- `com.fankes.tsbattery`
- `com.fkzhang.wechatxposed`
- `com.fuck.android.rimet`
- `com.github.tianma8023.xposed.smscode`
- `com.hchen.appretention`
- `com.hchen.switchfreeform`
- `com.houvven.impad`
- `com.kooritea.fcmfix`
- `com.lerist.fakelocation`
- `com.luckyzyx.luckytool`
- `com.modify.installer`
- `com.nnnen.plusne`
- `com.omarea.vtools`
- `com.padi.hook.hookqq`
- `com.qq.qcxm`
- `com.rifsxd.ksunext`
- `com.rkg.IAMRKG`
- `com.sevtinge.hyperceiler`
- `com.shatyuka.zhiliao`
- `com.silverlab.app.deviceidchanger.free`
- `com.sukisu.ultra`
- `com.suqi8.oshin`
- `com.syyf.quickpay`
- `com.tencent.JYNB`
- `com.tencent.jingshi`
- `com.termux`
- `com.tsng.hidemyapplist`
- `com.tsng.pzyhrx.hma`
- `com.twifucker.hachidori`
- `com.wei.vip`
- `com.wn.app.np`
- `com.xayah.databackup.foss`
- `com.yuanwofei.cardemulator.pro`
- `com.yxer.packageinstalles`
- `com.zhufucdev.motion_emulator`
- `dialog.box`
- `dknb.con`
- `dknb.coo8`
- `github.tornaco.android.thanos`
- `have.fun`
- `io.github.Retmon403.oppotheme`
- `io.github.a13e300.ksuwebui`
- `io.github.qauxv`
- `io.github.vvb2060.magisk`
- `kk.dk.anqu`
- `lin.xposed`
- `me.bingyue.IceCore`
- `me.gm.cleaner`
- `me.plusne`
- `me.simpleHook`
- `me.teble.xposed.autodaily`
- `miko.client`
- `moe.fuqiuluo.portal`
- `name.monwf.customiuizer`
- `nep.timeline.freezer`
- `nep.timeline.re_telegram`
- `one.yufz.hmspush`
- `org.lsposed.lspatch`
- `org.lsposed.lspd`
- `org.lsposed.manager`
- `ru.maximoff.apktool`
- `top.bienvenido.saas.i18n`
- `top.hookvip.pro`
- `top.sacz.timtool`
- `tornaco.apps.shortx.ext`
- `vn.kwaiching.tao`
- `xzr.hkf`
- `xzr.konabess`
- `zako.zako.zako`

</details>

<details><summary><b>Apéndice B: archivos y directorios sospechosos / de trampas (68)</b></summary>

Solo se enumeran los archivos y directorios **sospechosos o relacionados con trampas** (se pueden limpiar según haga falta).
Rutas del sistema como `/proc`, `/sys`, `/dev`, `/system` son objetos que el detector **lee**, **no las borres**.

- `/data/A内核.ini`
- `/data/BingHPJY/pz.cfg`
- `/data/BingPUBG`
- `/data/Dit驱动`
- `/data/HPX`
- `/data/HPY`
- `/data/encore/custom_default_cpu_gov`
- `/data/encore/default_cpu_gov`
- `/data/gpu_freq_table.conf`
- `/data/js`
- `/data/js.sh`
- `/data/local/MIO`
- `/data/local/luckys`
- `/data/local/stryker/`
- `/data/local/tmp denied`
- `/data/local/tmp/A内核公益-和平精英0215x1`
- `/data/local/tmp/A内核公益-和平精英0215x1(1)`
- `/data/local/tmp/A内核公益-和平精英0215x1(2)`
- `/data/local/tmp/DisabledAllGoogleServices`
- `/data/local/tmp/HyperCeiler`
- `/data/local/tmp/Surfing_update`
- `/data/local/tmp/android_server`
- `/data/local/tmp/android_server64`
- `/data/local/tmp/cleaner_starter`
- `/data/local/tmp/encore_logo.png`
- `/data/local/tmp/gdbserver`
- `/data/local/tmp/horae_control.log`
- `/data/local/tmp/luckys`
- `/data/local/tmp/mount_mask`
- `/data/local/tmp/resetprop`
- `/data/local/tmp/scriptTMP`
- `/data/local/tmp/simpleHook`
- `/data/local/tmp/yshell`
- `/data/local/中野三玖`
- `/data/nh.ko`
- `/data/nh2`
- `/data/nh3`
- `/data/nh4`
- `/data/nh5`
- `/data/swap_config.conf`
- `/data/system/AppRetention`
- `/data/system/Freezer/`
- `/data/system/HPX`
- `/data/system/HPY`
- `/data/system/NoActive/`
- `/data/system/junge/`
- `/data/system/liboxmem.so`
- `/data/system/xydriver.ko`
- `/data/南瓜三角洲公益最新版本.sh`
- `/data/物资.txt`
- `/dev/Bing`
- `/my_product/etc/permissions/oplus_google_cn_gms_features.xml`
- `/sdcard/Download/com.niunaijun.blackdexa64_logcat.txt`
- `/sdcard/Download/dexdump/`
- `/sdcard/fart`
- `/storage/emulated/0/`
- `/storage/emulated/0/Android/Clash/`
- `/storage/emulated/0/Android/HChai/`
- `/storage/emulated/0/Android/Yume-Yunyun/`
- `/storage/emulated/0/Android/naki/`
- `/storage/emulated/0/Documents/advanced/`
- `/storage/emulated/0/Download/advanced/`
- `/storage/emulated/0/MT2/`
- `/storage/emulated/0/TpTestReport/screenOn/OK/0/`
- `/storage/emulated/0/rlgg/`
- `/storage/emulated/0/弱隐.sh`
- `/storage/emulated/0/落叶配置`
- `/storage/emulated/elgg/`

</details>

<details><summary><b>Apéndice C: propiedades del sistema comprobadas (34)</b></summary>

- `dalvik.vm.dex2oat-flags`
- `persist.chunqiu.path_hide`
- `persist.chunqiu.path_hide=1`
- `persist.debug.dalvik.vm.core_platform_api_policy`
- `persist.logd.size`
- `persist.logd.size.crash`
- `persist.logd.size.main`
- `persist.logd.size.system`
- `persist.sys.pihooks.disable.gms`
- `persist.sys.pihooks_BRAND`
- `persist.sys.pihooks_DEVICE`
- `persist.sys.pihooks_DEVICE_INIT`
- `persist.sys.pihooks_MANUFACTURE`
- `persist.sys.pihooks_MODEL`
- `persist.sys.pihooks_PRODUCT`
- `persist.sys.pihooks_RELEASE`
- `persist.sys.pihooks_SDK_INT`
- `persist.sys.pixelprops.gapps`
- `persist.sys.pixelprops.gms`
- `persist.sys.pixelprops.google`
- `persist.sys.pixelprops.gphotos`
- `persist.sys.spoof.gms`
- `persist.sys.vold_app_data_isolation_enabled`
- `ro.boot.flash.locked`
- `ro.boot.selinux`
- `ro.boot.vbmeta.avb_version`
- `ro.boot.vbmeta.device_state`
- `ro.boot.vbmeta.digest`
- `ro.boot.verifiedbootstate`
- `ro.build.date.utc`
- `ro.build.type`
- `ro.build.version.sdk`
- `ro.product.brand`
- `ro.product.brand=`

</details>
