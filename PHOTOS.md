# Photos à déposer dans `/public/photos`

Toutes les photos sont traitées en **noir & blanc** automatiquement (filtre duotone),
plein cadre, avec le watermark NCB. Tant qu'un fichier manque, un placeholder propre
s'affiche — déposez le fichier au bon nom et il apparaît immédiatement (aucun code à changer).

## Fichiers attendus (racine `/public/photos/`)

| Fichier | Page / usage | Cadrage conseillé |
|---|---|---|
| `hero-poster.jpg` | Accueil — poster de la vidéo hero (Oïana au bassin, visage→nombril, légèrement éclairci) | visage haut |
| `bassin.jpg` | Bassin privé + offre accueil — piscine intérieure, poutres bois | large, non coupée |
| `maison-basque.jpg` | Cours à domicile — maison basque (montrer la maison, pas le toit) | `center 80%` appliqué |
| `ocean.jpg` | Initiation océan — sauveteurs / vue océan Côte Basque | — |
| `kinesiologie.jpg` | Kinésiologie — médecine chinoise / fleurs de Bach / buste phrénologie | — |
| `surf.jpg` | Surf — surfeuse en combinaison avec planche (pas un océan vide) | — |
| `reservation.jpg` | (réserve) paysage Côte Basque non réutilisé ailleurs | — |
| `collectif.jpg` | Accueil — bloc « une école pensée autrement » | — |

## Portraits équipe (`/public/photos/equipe/`)

Un fichier par experte, cadrage **visage propre** (jamais coupé) :

`emma.jpg` · `elea.jpg` · `oiana.jpg` · `thais.jpg` · `clara.jpg` · `audrey.jpg` · `clara-d.jpg` · `maika.jpg`

> Les portraits peuvent aussi être gérés depuis l'admin (`/admin/equipe` → upload),
> qui les stocke dans le bucket Supabase `team-photos` et prend le pas sur le fichier statique.

## Vidéo hero

La vidéo est déjà hébergée (Annexe C) et référencée dans `lib/constants.ts`
(`HERO_VIDEO_URL`). Le `hero-poster.jpg` sert d'image de repli.

## Règles

- Aucune photo n'est réutilisée deux fois (sauf les portraits d'équipe).
- Tous les `alt` sont descriptifs et localisés (SEO) — définis dans `lib/photos.ts`.
- Corriger l'orientation EXIF avant dépôt (pas de double rotation).
