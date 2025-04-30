
# 🎽 UrbanHeritage - API Backend

Projet backend développé en **Express.js** avec l'ORM **Prisma** et base de données PostgreSQL.

---

## ⚙️ Installation

1. Clonez le projet : `git clone <repo>`
2. Déplacez-vous dans le dossier cloné : `cd urbanheritage-backend`
3. Installez les dépendances : `npm install`
4. Ajoutez le fichier `.gitignore` avec les entrées : `db`, `dist`, `node_modules`, `.env`
5. Créez le fichier `.env` avec les variables de connexion (voir projet original)
6. Lancez le serveur : `npm run dev`
7. Modifiez `src/index.ts` pour ajouter vos routes

## 🚀 Déploiement Git

1. Créez un nouveau dépôt sur GitHub (utilisez la clé SSH)
2. Supprimez le `.git` existant : `rm -rf .git`
3. Ajoutez le dépôt distant : `git remote add origin <clé SSH>`
4. Renommez la branche : `git branch -M main`
5. Versionnez et poussez :

```bash
git add .
git commit -m "first commit"
git push -u origin main
```

---

## 🌐 Utilisation du Backend

Sur la base route API:  `http://localhost:1992/api/`

### 🔐 Routes Admin

- `POST /maillot/create` – Créer un maillot 
- `PUT /maillot/:id` – Modifier un maillot 
- `DELETE /maillot/:id` – Supprimer un maillot 

- `POST /artiste/create` – Créer un artiste 
- `PUT /artiste/:id` – Modifier un artiste 
- `DELETE /artiste/:id` – Supprimer un artiste 

- `POST /association` – Créer une association 
- `PUT /association/:id` – Modifier une association 
- `DELETE /association/:id` – Supprimer une association 

- `GET /avis/` – Tous les avis 
- `GET /avis/:id` – Avis par ID 

- `POST /avoir/create` – Generation avoir 
- `GET /avoir/` – Liste des avoirs 

- `GET /lignecommande/` – Toutes les lignes de commandes 

- `PUT /commande/:id` – Modifier une commande 
- `DELETE /commande/:id` – Supprimer une commande 

- `GET /facture/all` – Toutes les factures 
- `GET /facture/regenerate-pdf/:numero_facture` – Régénérer une facture PDF 

- `POST /tva/create` – Créer une TVA 
- `PUT /tva/:id` – Modifier une TVA 
- `DELETE /tva/:id` – Supprimer une TVA 

- `GET /reduction/` – Voir toutes les reductions 
- `GET /reduction/:id` – Voir une reduction 
- `POST /reduction/create` – Créer une réduction 
- `PUT /reduction/:id` – Modifier une réduction  
- `DELETE /reduction/:id` – Supprimer une réduction 


- `GET /role/` – Voir tous les roles  
- `GET /role/:id` – Voir un role 
- `POST /role/create` – Créer un role 
- `PUT /role/:id` – Modifier un role  
- `DELETE /role/:id` – Supprimer un role 

- `POST /personnalisation/create` – Créer une personnalisation 
- `PUT /personnalisation/:id` – Modifier une personnalisation 
- `DELETE /personnalisation/:id` – Supprimer une personnalisation 

- `POST /methode-livraison/create` – Créer une méthode 
- `PUT /methode-livraison/:id` – Modifier une méthode 
- `DELETE /methode-livraison/:id` – Supprimer une méthode 

- `POST /lieu-livraison/create` – Créer un lieu 
- `PUT /lieu-livraison/:id` – Modifier un lieu 
- `DELETE /lieu-livraison/:id` – Supprimer un lieu 

- `POST /livreur/create` – Créer un livreur 
- `PUT /livreur/:id` – Modifier un livreur 
- `DELETE /livreur/:id` – Supprimer un livreur 

- `PUT /retour/:id/reception` – Réceptionner un retour (génère avoir) 

- `GET /stock` – Tous les stocks 
- `GET /stock/:id` – Stock par ID 
- `POST /stock/create` – Creation d'un stock pour une taille specifique 
- `POST /stock/create-multiple` – Creation  4 stocks (S, M, L, XL) pour un maillot avec vérification  
- `GET /stock/detail/:id_maillot` – Stock par taille 
- `DELETE /stock/:id` – Supprimer un stock  

- `GET /stockmaillot` – Tous les mouvement de stocks  
- `GET /stockmaillot/:id` – Un mouvement par ID 
- `GET /stockmaillot/:id_stock` – Tous les mouvements d'un stock précis 
- `DELETE /stockmaillot/:id` – Supprimer un mouvement (sans mise à jour des champs obsolètes) 


### 👤 Routes Authentifiées (client)

- `GET /client/:id/details` – Détails des commandes d’un client 
- `GET /client/:id/details` – Client par ID (authentifié) 
- `PUT /client/:id` – Mise à jour d'un client 
- `DELETE /client/:id` – Suppression du compte client passage anonyme 

- `POST /commande/create` – Créer une commande 
- `POST /commande/finaliser` – Finaliser une commande 
- `GET /commande` – Liste des commandes 
- `GET /commande/:id` – Voir une commande 
- `POST /commande/valider-paiement/:id` – Valider le paiement 
- `POST /commande/:id_commande/reduction` – Appliquer une réduction 

- `GET /lignecommande/client/:id_client` – Lignes d’un client 
- `GET /lignecommande/client/:id_client/total` – Total panier 
- `GET /lignecommande/client/:id_client/panier` – Lecture du  panier client 
- `GET /lignecommande//client/:id_client/lignes` – lignes client 

- `GET livraison/commande/:id_commande` - Livraison liée à une commande 
- `POST /livraison/create` – Créer une livraison 
- `PUT /livraison/:id` – Modifier une livraison 
- `DELETE /livraison/:id` – Supprimer une livraison 

- `POST /retour/demander` – Demander un retour 
- `POST /retourlignecommande/create` – Ajouter une ligne au retour  --> a chercher cette route si utile

- `POST /avis/create` – Créer un avis  
- `DELETE /avis/:id` – Supprimer un avis  

- `POST /facture/:id_commande` – Creation facture  
- `GET /facture` – Toutes les factures du client connecté 
- `GET /facture/download/:numero_facture` – Télécharger une facture 
- `GET /facture/:numero_facture` – Récupérer une facture par son numéro 

- `POST /stockmaillot/create` – Generation de mouvement de stock 

- `GET /stock/public/disponibilite/:id_maillot` – Stock public par maillot 

- `POST /stripe/create-checkout-session/:id_commande` – Créer une session Stripe (paiement)


### 🌍 Routes Publiques

- `GET /maillot` – Tous les maillots 
- `GET /maillot/:id` – Maillot par ID 
- `GET /maillot/coup-de-coeur` – Les maillots les plus vendus 
- `GET /maillot/nouveautes` - La liste des nouvels arrivages 

- `GET /artiste` – Tous les artistes 
- `GET /artiste/:id` – Artiste par ID 

- `GET /association` – Toutes les associations 
- `GET /association/:id` – Association par ID 

- `GET /avis/maillot/:id"` – Tous les avis d’un maillot 
- `GET /avis/maillot/:id/stats"` Statistiques d’avis pour un maillot 
- 
- `GET /personnalisation` – Toutes les personnalisations 
- `GET /personnalisation/:id` – Personnalisation par ID 

- `GET /lignecommande/:id/id_ligne` – Détails ligne commande 
- `POST /lignecommande/create` – Ajouter au panier 
- `PUT /lignecommande/:id_ligne` – Modifier une ligne 
- `DELETE /lignecommande/:id_ligne` – Suppression d'une ligne du panier
- `DELETE /lignecommande/cleanup` – Nettoyer paniers expirés 
- `GET /lignecommande/:id/details` – Détails ligne avec personnalisations 

- `GET /lignecommande-personnalisation/` – Liste des personnalisations 
- `GET /lignecommande-personnalisation/:id_lignecommande` : Personnalisations par ligne 
- `POST /lignecommande-personnalisation/create` – Ajouter une personnalisation 
- `PUT /lignecommande-personnalisation/:id_lignecommande/` – Modifier une personnalisation 
- `DELETE /lignecommande-personnalisation/:id_lignecommande/:id_personnalisation` – Supprimer une personnalisation 

- `GET /reduction/public/actives` – Réductions actives (côté client - message pop-up ou champ promo) 

- `GET /methode-livraison` – Méthodes de livraison 
- `GET /methode-livraison/:id` – Méthode par ID 

- `GET /lieu-livraison` – Lieux de livraison 
- `GET /lieu-livraison/:id` – Lieu par ID 

- `GET /livreur` – Tous les livreurs 
- `GET /livreur/:id` – Livreur par ID 

- `GET /tva` – Toutes les TVA 
- `GET /tva/:id` – TVA par ID 

- `GET stock/public/disponibilite/:id_maillot` – Disponibilité d’un maillot par taille (quantité + statut) 
