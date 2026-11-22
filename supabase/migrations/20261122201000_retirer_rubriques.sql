-- Retrait des rubriques (décision de l'utilisateur, 23/11/2026) : elles ne servaient qu'à colorer
-- les séances. Les séances prennent désormais une couleur fixe de la charte, définie dans le code.
-- La suppression de la table emporte ses règles RLS (lecture participant, écriture admin).

alter table public.sessions drop column rubrique_id;
drop table public.rubriques;
