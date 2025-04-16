-- Trigger function pour mettre à jour Stock
CREATE OR REPLACE FUNCTION maj_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type_mouvement = 'entree' THEN
    UPDATE "Stock"
    SET quantite_entree = quantite_entree + NEW.quantite_stock,
        quantite_total = quantite_total + NEW.quantite_stock
    WHERE id_stock = NEW.id_stock;
  ELSIF NEW.type_mouvement = 'sortie' THEN
    UPDATE "Stock"
    SET quantite_sortie = quantite_sortie + NEW.quantite_stock,
        quantite_total = quantite_total - NEW.quantite_stock
    WHERE id_stock = NEW.id_stock;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. Création du trigger qui utilise cette fonction
CREATE TRIGGER trigger_maj_stock
AFTER INSERT ON "StockMaillot"
FOR EACH ROW
EXECUTE FUNCTION maj_stock();
