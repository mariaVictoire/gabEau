-- Tarifs officiels juillet 2026
-- Nouveaux formats : container_500l, container_100l
-- cubic_meter (cubitainer 1 m³) : 4 000 FCFA
-- container_500l (grand fût)     : 2 000 FCFA
-- container_200l (fût)           :   800 FCFA
-- container_100l (petite livr.) :  400 FCFA
--
-- Aucune contrainte ENUM sur product_type : les nouvelles valeurs sont acceptées directement.

ALTER TABLE requests ALTER COLUMN price_fcfa SET DEFAULT 4000;
