# Site web POLARIS Construction

Site vitrine bilingue (français / arabe) pour SARL POLARIS Construction, avec
catalogue de projets immobiliers, fiches détaillées, formulaire de demande,
bouton WhatsApp, et un espace d'administration privé pour gérer les projets,
les photos et les demandes — sans aucune connaissance technique.

## 1. Ce dont vous avez besoin avant de commencer

Vous aurez besoin de deux comptes gratuits :

1. **Supabase** (base de données, authentification, stockage des photos) — https://supabase.com
2. **Vercel** (hébergement du site) — https://vercel.com

Les deux proposent un plan gratuit largement suffisant pour démarrer.

## 2. Créer le projet Supabase

1. Allez sur https://supabase.com, créez un compte, puis cliquez sur **New project**.
2. Choisissez un nom (ex. `polaris-construction`), un mot de passe de
   base de données (notez-le), et une région proche (Europe).
3. Une fois le projet créé, allez dans **SQL Editor** → **New query**, collez
   le contenu du fichier [`../polaris-site-notes/schema.sql`](../polaris-site-notes/schema.sql)
   et cliquez sur **Run**. Cela crée toutes les tables, règles de sécurité
   (Row Level Security) et la ligne de paramètres du site.
4. Allez dans **Storage** → **New bucket**, nommez-le exactement
   `property-images`, et activez **Public bucket**.
5. Toujours dans Storage, ouvrez le bucket → **Policies** → ajoutez les 4
   règles commentées en bas du fichier `schema.sql` (lecture publique,
   écriture réservée aux administrateurs connectés). Copiez chaque bloc
   commenté dans le SQL Editor (enlevez les `--` au début de chaque ligne
   avant de l'exécuter).
6. Allez dans **Authentication** → **Providers**, vérifiez que seule
   l'authentification par **e-mail/mot de passe** est activée, et dans
   **Authentication** → **Settings**, désactivez **Allow new users to sign up**
   (pour qu'aucun inconnu ne puisse créer de compte admin).
7. Créez le compte administrateur : **Authentication** → **Users** → **Add user**
   → renseignez l'e-mail et le mot de passe de votre père. C'est ce compte qui
   servira à se connecter sur `/admin`.
8. Allez dans **Project Settings** → **API** et notez trois valeurs :
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ à garder secrète, jamais dans le navigateur)

## 3. Configurer le projet en local

```bash
cd polaris-site
npm install
cp .env.local.example .env.local
```

Ouvrez `.env.local` et remplissez les valeurs obtenues à l'étape 2 :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Puis renseignez les coordonnées de l'entreprise directement dans Supabase :
**Table Editor** → `site_settings` → modifiez l'unique ligne avec le
téléphone, le numéro WhatsApp (format international, ex. `+213551234567`),
l'e-mail et l'adresse.

Lancez le site en local pour vérifier que tout fonctionne :

```bash
npm run dev
```

Ouvrez http://localhost:3000 (site public) et http://localhost:3000/admin
(connexion avec le compte créé à l'étape 2.7).

## 4. Déployer le site (Vercel)

1. Créez un dépôt Git (GitHub) et poussez le contenu de `polaris-site/`.
2. Sur https://vercel.com, **Add New Project** → importez ce dépôt.
3. Dans **Environment Variables**, ajoutez les mêmes variables que dans
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`, et les
   variables d'e-mail si vous activez les notifications — voir section 6).
4. Cliquez sur **Deploy**. Après quelques minutes, le site est en ligne sur
   une adresse `*.vercel.app`.

## 5. Connecter votre nom de domaine

1. Achetez un domaine (ex. chez un registrar local algérien ou international).
2. Dans Vercel : **Project Settings** → **Domains** → ajoutez votre domaine.
3. Vercel indique les enregistrements DNS à créer chez votre registrar
   (généralement un enregistrement `A` ou `CNAME`). Une fois ajoutés, le
   certificat HTTPS est généré automatiquement.

## 6. Activer les notifications par e-mail (facultatif)

Sans configuration, les demandes sont toujours enregistrées dans la base de
données et visibles dans `/admin/inquiries` — mais aucun e-mail n'est envoyé.
Pour recevoir un e-mail à chaque nouvelle demande :

1. Créez un compte sur https://resend.com (gratuit).
2. Vérifiez votre domaine d'envoi dans Resend.
3. Créez une clé API et ajoutez-la comme `RESEND_API_KEY` dans Vercel.
4. Ajoutez aussi `NOTIFICATION_EMAIL_FROM` (adresse d'envoi vérifiée) et
   `NOTIFICATION_EMAIL_TO` (adresse qui doit recevoir les demandes).
5. Redéployez le projet.

## 7. Utilisation quotidienne (pour l'administrateur)

- Connexion : `votredomaine.dz/admin`
- **Ajouter un projet** : bouton « + Ajouter un nouveau projet » → remplir la
  ville, le nom, ajouter des photos, choisir le statut, puis cliquer sur
  **Enregistrer**. Le projet reste en **Brouillon** tant qu'il n'est pas
  publié — changez « Publication » sur **Publié** pour qu'il apparaisse sur
  le site.
- **Marquer comme vendu / dernières disponibilités** : ouvrez le projet,
  changez le « Statut du projet », enregistrez.
- **Demandes reçues** : onglet « Demandes » — changez le statut d'une demande
  au fur et à mesure du suivi, ajoutez des notes internes, exportez en CSV.
- **Coordonnées de l'entreprise** : onglet « Paramètres ».

## 8. Structure technique (pour un futur développeur)

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) — site + admin
- **next-intl** — routage et traductions FR/AR avec RTL
- **Supabase** — PostgreSQL (Row Level Security), Auth, Storage
- **Resend** (facultatif) — notifications e-mail
- Base de données : voir [`../polaris-site-notes/schema.sql`](../polaris-site-notes/schema.sql)
- Toutes les actions d'écriture passent par des Server Actions
  (`src/lib/actions/*`) protégées côté serveur par une vérification de
  session Supabase, en plus des règles RLS côté base de données.
