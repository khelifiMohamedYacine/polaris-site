# Site web POLARIS Construction

Site vitrine bilingue (français / arabe) pour SARL POLARIS Construction, avec
catalogue de projets immobiliers, fiches détaillées, formulaire de demande,
bouton WhatsApp, et un espace d'administration privé pour gérer les projets,
les photos et les demandes — sans aucune connaissance technique.

Tout fonctionne avec **une seule base PostgreSQL** : projets, photos, demandes
et compte administrateur. Aucun service externe n'est nécessaire.

## 1. Hébergement sur Render

Le fichier [`render.yaml`](render.yaml) décrit tout : le site **et** la base
PostgreSQL. Render les crée et les relie automatiquement.

1. Sur https://dashboard.render.com : **New → Blueprint**, choisissez ce dépôt
   GitHub, puis **Apply**.
2. Dans **polaris-construction → Environment**, renseignez :
   - `ADMIN_EMAIL` — l'e-mail de connexion à l'administration
   - `ADMIN_PASSWORD` — le mot de passe (long, et à garder secret)
   - `NEXT_PUBLIC_SITE_URL` — l'adresse du site, ex. `https://polaris-construction.onrender.com`

   `DATABASE_URL` et `SESSION_SECRET` sont remplis automatiquement par Render.
3. Enregistrez : Render redéploie. Les tables sont créées automatiquement au
   premier démarrage.

- Site : `https://<votre-service>.onrender.com`
- Administration : `https://<votre-service>.onrender.com/admin`

**Changer le mot de passe administrateur** : modifiez `ADMIN_PASSWORD` dans
Render → Environment et enregistrez. Le nouveau mot de passe est appliqué au
redémarrage.

> ⚠️ **Base gratuite Render** : elle expire 30 jours après sa création. Avant
> cette date, passez-la au plan *Basic* (quelques dollars par mois) dans
> Render → polaris-db, sinon les données seront supprimées.

## 2. Lancer le site sur votre ordinateur

```bash
cd polaris-site
npm install
cp .env.local.example .env.local   # puis renseignez ADMIN_EMAIL et ADMIN_PASSWORD
npm run dev
```

Sans `DATABASE_URL`, le site utilise une base PostgreSQL intégrée, stockée dans
le dossier `.data/` — rien à installer. Ouvrez http://localhost:3000 (site) et
http://localhost:3000/admin (administration).

## 3. Notifications par e-mail (facultatif)

Sans configuration, les demandes sont enregistrées et visibles dans
`/admin/inquiries`, mais aucun e-mail n'est envoyé. Pour en recevoir un à
chaque nouvelle demande : créez un compte sur https://resend.com, vérifiez
votre domaine, puis renseignez dans Render `RESEND_API_KEY`,
`NOTIFICATION_EMAIL_FROM` (adresse d'envoi vérifiée) et `NOTIFICATION_EMAIL_TO`.

## 4. Utilisation quotidienne (pour l'administrateur)

- **Ajouter un projet** : « + Ajouter un nouveau projet » → ville, nom, photos,
  statut, puis **Enregistrer**. Le projet reste en **Brouillon** tant que
  « Publication » n'est pas sur **Publié**.
- **Vendu / dernières disponibilités** : ouvrez le projet, changez le
  « Statut du projet », enregistrez.
- **Demandes reçues** : onglet « Demandes » — statut, notes internes, export CSV.
- **Coordonnées de l'entreprise** : onglet « Paramètres ».

## 5. Structure technique (pour un futur développeur)

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4), **next-intl** (FR/AR, RTL)
- **PostgreSQL** via `pg` (`DATABASE_URL`) ; en local, **PGlite** (PostgreSQL embarqué)
- Schéma : [`src/lib/db/schema.ts`](src/lib/db/schema.ts), appliqué automatiquement au démarrage
- Photos stockées en base (`property_images.data`), servies par `/api/images/[id]`
- Connexion admin : mot de passe haché (scrypt) + cookie de session signé (HMAC, `SESSION_SECRET`)
- Toutes les écritures passent par des Server Actions (`src/lib/actions/*`) qui
  vérifient la session administrateur côté serveur.
