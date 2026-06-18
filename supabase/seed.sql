-- ─────────────────────────────────────────────────────────────
-- Seed (Annexe A). Réexécutable : upsert équipe, remplace
-- témoignages / FAQ / content_blocks, régénère les créneaux démo.
-- ─────────────────────────────────────────────────────────────

-- ── Équipe (ordre strict) ─────────────────────────────────────
insert into public.team_members (slug, name, tagline, role, bio, services, whatsapp, display_order, is_active)
values
  ('emma', 'Emma', 'Celle qui a tout imaginé.', 'Fondatrice · Kinésiologue certifiée',
   'Kinésiologue certifiée, maître-nageuse et ancienne sauveteuse à Anglet. Fondatrice de Natation Côte Basque, elle a réuni cette équipe pour proposer une vision moderne et complète de l''apprentissage : plus humaine, plus adaptée, accessible à tous.',
   '{kine,bassin}', null, 1, true),
  ('elea', 'Eléa', 'Celle qui rend tout simple.', 'Secrétariat · Coordination',
   'Eléa orchestre toute l''organisation du collectif : planning, réservations, annulations, suivi des cours. Toujours disponible et réactive, c''est elle qui fait le lien entre les élèves et les professeures — et qui permet à toute l''équipe d''avancer ensemble.',
   '{}', null, 2, true),
  ('oiana', 'Oïana', 'Maître-nageuse & spécialiste du mouvement.', 'Bassin · Domicile · Océan',
   'Ancienne nageuse de compétition à Biarritz pendant plus de dix ans, maître-nageuse et sauveteuse. Spécialisée dans la compréhension du corps et du mouvement, elle allie expertise technique et expérience du terrain.',
   '{bassin,domicile,ocean}', null, 3, true),
  ('thais', 'Thaïs', 'Maître-nageuse & championne du monde.', 'Bassin · Domicile · Océan',
   'Ancienne sauveteuse en équipe de France, maître-nageuse et championne du monde de sauvetage côtier — elle incarne une expertise aquatique de très haut niveau, du débutant au sportif confirmé.',
   '{bassin,domicile,ocean}', null, 4, true),
  ('clara', 'Clara', 'Maître-nageuse & infirmière, bilingue.', 'Domicile · Océan · FR/EN',
   'Infirmière de formation, maître-nageuse et sauveteuse. Une vraie sensibilité à la pédagogie et au rythme de chacun, en particulier pour les profils anxieux ou débutants. Bilingue français/anglais pour les familles internationales.',
   '{domicile,ocean}', null, 5, true),
  ('audrey', 'Audrey', 'La spécialiste des enfants qu''on dit difficiles.', 'Domicile · Éducatrice Jeunes Enfants',
   'Maître-nageuse et Éducatrice de Jeunes Enfants. Une double expertise rare pour l''apprentissage dès le plus jeune âge. Spécialiste des enfants en bas âge, elle accompagne aussi les profils en difficulté ou neuroatypiques.',
   '{domicile}', null, 6, true),
  ('clara-d', 'Clara D.', 'Le surf comme thérapie.', 'Surf · Naturopathie · Réflexologie',
   'Surfeuse talentueuse et professeure de surf, naturopathe et réflexologue. Elle développe une approche globale du bien-être à travers le surf : apprentissage, plaisir et reconnexion au corps.',
   '{surf}', '33677836604', 7, true),
  ('maika', 'Maïka', 'Elle parle aux tout-petits comme personne.', 'Kinésiologue · Petite enfance',
   'Kinésiologue certifiée, spécialisée dans l''accompagnement de la petite enfance. Elle travaille aussi en crèche et en MAM, avec une approche très douce centrée sur la sécurité émotionnelle des tout-petits dès 3 ans.',
   '{kine}', '33665573740', 8, true)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  role = excluded.role,
  bio = excluded.bio,
  services = excluded.services,
  whatsapp = excluded.whatsapp,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

-- ── Témoignages ───────────────────────────────────────────────
delete from public.testimonials;
insert into public.testimonials (author, location, quote, display_order, published)
values
  ('Sophie, maman de Léo (5 ans) — Anglet', 'Anglet',
   'Léo hurlait dès qu''on approchait de l''eau. Trois séances avec Emma, et il saute du bord en riant. On n''y croyait plus.', 1, true),
  ('Thomas (42 ans) — Bayonne', 'Bayonne',
   'Je n''avais jamais vraiment su nager. À 42 ans, j''ai osé. Aujourd''hui je fais mes longueurs sans paniquer. Merci Oïana.', 2, true),
  ('Laurène, maman de 3 enfants — Biarritz', 'Biarritz',
   'Les cours à la maison ont tout changé. La prof s''adapte à chacun, mes trois enfants adorent. Un vrai luxe, simple.', 3, true);

-- ── FAQ ───────────────────────────────────────────────────────
delete from public.faq_items;
insert into public.faq_items (page, question, answer, display_order, published)
values
  ('home', 'Qu''est-ce qu''il faut apporter ?', 'Juste un maillot et des lunettes, on s''occupe du reste.', 1, true),
  ('home', 'Combien faut-il de séances ?', 'On conseille d''en réserver 5 à 10 à l''avance — on est souvent complet. Annulation sans frais jusqu''à 48h avant.', 2, true),
  ('home', 'Vous vous déplacez jusqu''où ?', 'Sur tout le Pays Basque : Bayonne, Anglet, Biarritz, Bidart, Guéthary, Saint-Jean-de-Luz, Hendaye, Ciboure et bien plus.', 3, true),
  ('home', 'C''est pour les adultes aussi ?', 'Absolument. Enfants dès 3 ans et adultes de tous niveaux — débutants, perfectionnement, peur de l''eau, remise en forme.', 4, true),
  ('home', 'C''est disponible toute l''année ?', 'Oui — bassin privé, cours à domicile, initiation océan, kinésiologie et surf, toute l''année.', 5, true),
  ('home', 'Comment réserver ?', 'Directement en ligne pour les cours de natation et les initiations océan. Sur WhatsApp pour la kinésiologie et le surf. Réponse sous 24h.', 6, true),
  ('reservation', 'Quel est le délai de réponse ?', 'On s''engage à répondre sous 24h. On échange par WhatsApp plutôt que par téléphone : ça nous laisse le temps de bien répondre à chacun.', 1, true),
  ('reservation', 'Quel matériel faut-il ?', 'Juste un maillot et des lunettes. On s''occupe du reste.', 2, true),
  ('reservation', 'Peut-on annuler un cours ?', 'Oui, annulation sans frais jusqu''à 48h avant.', 3, true),
  ('reservation', 'C''est pour les adultes aussi ?', 'Bien sûr. Enfants dès 3 ans et adultes de tous niveaux, partout sur la Côte Basque.', 4, true),
  ('reservation', 'Comment choisit-on notre professeure ?', 'On vous propose la plus adaptée à votre profil. Si vous avez une préférence, dites-le nous.', 5, true),
  ('reservation', 'Combien de séances ?', '5 à 10 à l''avance — on est souvent complet. Plus tôt vous réservez, plus de choix de créneaux.', 6, true);

-- ── Content blocks éditables (sous-ensemble) ──────────────────
delete from public.content_blocks;
insert into public.content_blocks (page, key, value)
values
  ('home', 'hero_subtitle', 'Nous sommes un collectif de maîtres-nageuses diplômées — chacune avec sa spécialité : spécialiste du mouvement, experte des enfants en difficulté, kinésiologue de la peur de l''eau, surf-thérapeute, athlète de haut niveau. Ensemble, bien plus que des profs de natation : une experte pour chaque besoin.'),
  ('home', 'manifesto_text', 'Toutes maîtres-nageuses diplômées — et chacune avec une spécialité rare. Vous ne tombez pas sur « un prof ». Vous trouvez LA spécialiste de votre besoin.'),
  ('bassin', 'hero_text', 'Une piscine privée, couverte et chauffée, 2 couloirs de 20 mètres, sans foule ni bruit. Pour les enfants : mini-groupes de 3 maximum, par niveau. Pour les adultes : séances individuelles, personnalisées selon vos objectifs. Toute l''année.'),
  ('domicile', 'hero_text', 'Pas de trajet, pas de vestiaire bondé. Votre professeure arrive chez vous, dans votre piscine. Pour les enfants, le cadre rassurant de la maison ; pour les adultes, l''intimité pour progresser à l''abri des regards. Partout sur la Côte Basque.'),
  ('domicile', 'offer', 'Venez avec un ami ou un voisin — jusqu''à 3 enfants du même niveau pour partager les frais. Moins de 15€ par enfant.'),
  ('ocean', 'hero_text', 'Pour tous ceux, enfants comme adultes, qui ont envie de nager en conscience dans l''océan. L''étape après la piscine — tout ce qu''on n''apprend pas dans un bassin.'),
  ('kine', 'hero_text', 'Certains enfants pleurent avant d''entrer dans l''eau. Certains adultes n''ont jamais osé. Ce n''est pas une fatalité — c''est un blocage, et il se lève. 90% de nos élèves, petits comme grands, débloquent leurs appréhensions dès la première séance.'),
  ('surf', 'hero_text', 'Pour la première vague ou pour se réconcilier avec l''océan. Avec Clara D. — surfeuse, naturopathe, réflexologue — le surf devient bien plus qu''un sport : une reconnexion. Pour tous les âges.'),
  ('reservation', 'hero_text', 'Trois façons de réserver, selon ce que vous cherchez. Simple, rapide, humain — on vous répond toujours sous 24h.');

-- ── Créneaux bassin de démonstration (week-ends à venir) ──────
delete from public.bookings;
delete from public.pool_slots;
insert into public.pool_slots (starts_at, ends_at, audience, level, teacher_id, capacity, price_cents, is_open)
values
  (date_trunc('day', now()) + interval '8 days' + interval '10 hours',
   date_trunc('day', now()) + interval '8 days' + interval '10 hours 45 minutes',
   'enfant', 1, (select id from public.team_members where slug = 'oiana'), 3, 4500, true),
  (date_trunc('day', now()) + interval '8 days' + interval '11 hours',
   date_trunc('day', now()) + interval '8 days' + interval '11 hours 45 minutes',
   'enfant', 2, (select id from public.team_members where slug = 'oiana'), 3, 4500, true),
  (date_trunc('day', now()) + interval '9 days' + interval '10 hours',
   date_trunc('day', now()) + interval '9 days' + interval '10 hours 45 minutes',
   'enfant', 3, (select id from public.team_members where slug = 'thais'), 3, 4500, true),
  (date_trunc('day', now()) + interval '8 days' + interval '14 hours',
   date_trunc('day', now()) + interval '8 days' + interval '15 hours',
   'adulte', null, (select id from public.team_members where slug = 'thais'), 1, 6000, true),
  (date_trunc('day', now()) + interval '9 days' + interval '14 hours',
   date_trunc('day', now()) + interval '9 days' + interval '15 hours',
   'adulte', null, (select id from public.team_members where slug = 'oiana'), 1, 6000, true),
  (date_trunc('day', now()) + interval '15 days' + interval '10 hours',
   date_trunc('day', now()) + interval '15 days' + interval '10 hours 45 minutes',
   'enfant', 1, (select id from public.team_members where slug = 'thais'), 3, 4500, true);
