# Ponce.PersonalDashboard.Web

[Leer en español](#español)

## English

The frontend of a personal-use app I made so I can add random useful things I'd like to keep track of in a single place. You can find the backend here: [Ponce.PersonalDashboard.Core](https://github.com/Martin-Ponce/Ponce.PersonalDashboard.Core.git). Security is handled by my identity provider, which you can check out here: [Ponce.IdentityProvider](https://github.com/Martin-Ponce/Ponce.IdentityProvider.git).

So far the features include:
- [Overview](#overview)
- [Finances](#finances)
- [Calendar](#calendar)
- [JobApplications](#job-applications)
- [Goals](#goals)

You can use it in English, Spanish or Swedish, and there's a light theme (Sky) and a dark one (Night).

> If you're here for the code side of things (setup, config, sign-in, Docker), that's all in [`docs/`](docs/README.md).

### Signing in

Hit **Log in with identity provider**, sign in on the identity provider's page, and it drops you right back
in. Your password never touches the dashboard. When you're done, **Sign out** is in the sidebar.

### Overview

The home page, basically a quick look at everything else:

- **At a glance:** your account balance and how much it moved this month, how you're doing against your
  budget, the next important date, your active job applications and any interviews coming up.
- **Monthly spending** for the last few months, how much of this month's budget is gone, and where most of
  the money went.
- **Upcoming dates** from the calendar, with the ones that are just a few days away flagged.
- **Your latest job applications.**

Don't need all of it? **Customize** lets you hide what you don't care about, and switch the theme or
language while you're at it. Oh, and the greeting changes every time you open the page.

### Finances

Where the money went (and came from), month by month.

1. Pick a month and hit **Set budget**. Every month gets its own, and you need one before you can add
   anything (it'll suggest last month's).
2. **Add entry** for every expense or income: a name, an amount and a category.
3. Made a mistake? The pencil next to an entry lets you edit or delete it.

You get the month's total spent, total earned, net, and how much of the budget you've burned through.
**Filter & sort** helps when the list gets long (by name, type, category or amount). The account balance at
the top counts every month, not just the one you're looking at.

### Calendar

Your month at a glance. Click a day to see what's on it, tick things off, delete them, or add new ones (time
and note are optional). Days that already passed are striped, and an orange dot means you left something
unfinished there. **Coming up** shows what's next; click one to jump straight to that day.

### Job applications

Keeps track of every application you send, month by month: company, role, location, work mode (on-site,
hybrid or remote), status (applied, interview, offer or rejected) and the salary, if you want to note it.

- **Add application** to log a new one; the pencil edits or deletes it.
- The **pipeline** tells you how many are at each stage, and the totals show how many you sent, how many
  are still alive, and your response rate.
- **Filter & sort** lets you search by company or role, or filter by status, work mode or city.
- If you updated an application after the day you sent it, its last-updated date shows up in bold.

### Goals

For building habits, one week at a time.

- **Daily goals** are things you want to do on certain days, like "Go to the gym" on Monday, Wednesday and
  Friday. Pick a day of this week up top and tick off what you did. Forgot to log yesterday? You can still
  do it. Doing a goal on a day you didn't plan counts as a bonus, and skipping a planned day marks it as
  missed.
- **Weekly goals** say how many days a week a daily goal should get done, like reading 5 days a week. They
  fill up on their own as you tick the daily goal, and reset every Monday. Each daily goal can have one.

### Settings

Tweak it to your liking: theme, display name and profile picture, language, date format, main currency
(with or without cents) and time zone. You see changes right away; hit **Save changes** to keep them or
**Discard** to back out. Everything's saved to your account, so it follows you to any device.

---

## Español

El frontend de una app de uso personal que hice para ir agregando cosas útiles de las que quiero llevar un registro en un solo lugar. El backend lo encuentras aquí: Ponce.PersonalDashboard.Core (add repo link). La seguridad la maneja mi proveedor de identidad, que puedes ver aquí: Ponce.IdentityProvider (add repo link).

Hasta ahora tiene:
- [Resumen](#resumen)
- [Finanzas](#finanzas)
- [Calendario](#calendario)
- [Solicitudes de empleo](#solicitudes-de-empleo)
- [Metas](#metas)

La puedes usar en inglés, español o sueco, y tiene un tema claro (Sky) y uno oscuro (Night).

> Si vienes por el lado del código (instalación, configuración, inicio de sesión, Docker), todo eso está en [`docs/`](docs/README.md).

### Iniciar sesión

Dale a **Iniciar sesión con el proveedor de identidad**, entra en la página del proveedor y te regresa
directo al panel. Tu contraseña nunca pasa por el panel. Cuando termines, **Cerrar sesión** está en la barra
lateral.

### Resumen

La página de inicio, básicamente un vistazo rápido a todo lo demás:

- **Resumen:** el saldo de tu cuenta y cuánto se movió este mes, cómo vas con tu presupuesto, la próxima
  fecha importante, tus solicitudes de empleo activas y las entrevistas que vienen.
- **Gasto mensual** de los últimos meses, cuánto llevas del presupuesto de este mes y en qué se te fue más
  dinero.
- **Próximas fechas** del calendario, con las que están a pocos días marcadas.
- **Tus solicitudes de empleo más recientes.**

¿No necesitas todo? Con **Personalizar** escondes lo que no te interesa, y de paso cambias el tema o el
idioma. Ah, y el saludo cambia cada vez que abres la página.

### Finanzas

En qué se te fue el dinero (y de dónde llegó), mes a mes.

1. Elige un mes y dale a **Definir presupuesto**. Cada mes tiene el suyo, y lo necesitas antes de poder
   agregar algo (te sugiere el del mes pasado).
2. **Añade un movimiento** por cada gasto o ingreso: un nombre, una cantidad y una categoría.
3. ¿Te equivocaste? El lápiz junto a cada movimiento te deja editarlo o borrarlo.

Ves el total gastado del mes, el total ganado, el neto y cuánto del presupuesto ya se fue. **Filtrar y
ordenar** ayuda cuando la lista crece (por nombre, tipo, categoría o cantidad). El saldo de la cuenta de
arriba cuenta todos los meses, no solo el que estás viendo.

### Calendario

Tu mes de un vistazo. Haz clic en un día para ver qué tiene, marcar cosas como hechas, borrarlas o agregar
nuevas (la hora y la nota son opcionales). Los días que ya pasaron se ven rayados, y un punto naranja quiere
decir que dejaste algo pendiente ese día. **Próximamente** te muestra lo que sigue; haz clic en uno para
saltar directo a ese día.

### Solicitudes de empleo

Lleva el registro de cada solicitud que mandas, mes a mes: empresa, puesto, ubicación, modalidad
(presencial, híbrida o remota), estado (enviada, entrevista, oferta o rechazada) y el salario, si lo quieres
anotar.

- **Añadir solicitud** para registrar una nueva; el lápiz la edita o la borra.
- El **proceso** te dice cuántas hay en cada etapa, y los totales muestran cuántas mandaste, cuántas siguen
  vivas y tu tasa de respuesta.
- **Filtrar y ordenar** te deja buscar por empresa o puesto, o filtrar por estado, modalidad o ciudad.
- Si actualizaste una solicitud después del día en que la mandaste, su fecha de última modificación sale en
  negritas.

### Metas

Para armar hábitos, una semana a la vez.

- **Las metas diarias** son cosas que quieres hacer ciertos días, como "Ir al gimnasio" lunes, miércoles y
  viernes. Elige un día de esta semana arriba y marca lo que hiciste. ¿Se te olvidó registrar ayer? Todavía
  puedes. Cumplir una meta un día que no tenías previsto cuenta como extra, y saltarte un día previsto lo
  marca como olvidado.
- **Las metas semanales** dicen cuántos días a la semana debes cumplir una meta diaria, como leer 5 días a la
  semana. Se llenan solas conforme marcas la meta diaria y se reinician cada lunes. Cada meta diaria puede
  tener una.

### Ajustes

Déjalo a tu gusto: tema, nombre visible y foto de perfil, idioma, formato de fecha, moneda principal (con o
sin centavos) y zona horaria. Ves los cambios al momento; dale a **Guardar cambios** para quedártelos o a
**Descartar** para echarte para atrás. Todo se guarda en tu cuenta, así que te sigue a cualquier
dispositivo.
