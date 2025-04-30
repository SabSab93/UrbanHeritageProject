
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

- `POST /maillot/create` – Créer un maillot **ok**
- `PUT /maillot/:id` – Modifier un maillot **ok**
- `DELETE /maillot/:id` – Supprimer un maillot **ok**

- `POST /artiste/create` – Créer un artiste **ok**
- `PUT /artiste/:id` – Modifier un artiste **ok**
- `DELETE /artiste/:id` – Supprimer un artiste **ok**

- `POST /association` – Créer une association **ok**
- `PUT /association/:id` – Modifier une association **ok**
- `DELETE /association/:id` – Supprimer une association **ok**

- `GET /client/` – Liste de tous les clients **ok**

- `GET /avis/` – Tous les avis **ok**
- `GET /avis/:id` – Avis par ID **ok**

- `POST /avoir/create` – Generation avoir 
- `GET /avoir/` – Liste des avoirs 

- `GET /lignecommande/` – Toutes les lignes de commandes **ok**

- `PUT /commande/:id` – Modifier une commande **pas utilisée** 
- `DELETE /commande/:id` – Supprimer une commande **pas utilisée** A voir si je supp il redevient null et conserve ligne commande

- `GET /facture/all` – Toutes les factures 
- `GET /facture/regenerate-pdf/:numero_facture` – Régénérer une facture PDF **ok**

- `POST /tva/create` – Créer une TVA **ok**
- `PUT /tva/:id` – Modifier une TVA **ok**
- `DELETE /tva/:id` – Supprimer une TVA **ok**

- `GET /reduction/` – Voir toutes les reductions **ok**
- `GET /reduction/:id` – Voir une reduction **ok**
- `POST /reduction/create` – Créer une réduction **ok**
- `PUT /reduction/:id` – Modifier une réduction  **ok**
- `DELETE /reduction/:id` – Supprimer une réduction **ok**

- `POST /auth/register-client` – Inscription Admin **ok**

- `GET /role/` – Voir tous les roles  **ok**
- `GET /role/:id` – Voir un role **ok**
- `POST /role/create` – Créer un role **ok**
- `PUT /role/:id` – Modifier un role  **ok**
- `DELETE /role/:id` – Supprimer un role **ok**

- `POST /personnalisation/create` – Créer une personnalisation **ok**
- `PUT /personnalisation/:id` – Modifier une personnalisation **ok**
- `DELETE /personnalisation/:id` – Supprimer une personnalisation **ok**

- `POST /methode-livraison/create` – Créer une méthode **ok**
- `PUT /methode-livraison/:id` – Modifier une méthode **ok**
- `DELETE /methode-livraison/:id` – Supprimer une méthode **ok**

- `POST /lieu-livraison/create` – Créer un lieu **ok**
- `PUT /lieu-livraison/:id` – Modifier un lieu **ok**
- `DELETE /lieu-livraison/:id` – Supprimer un lieu **ok**

- `POST /livreur/create` – Créer un livreur **ok**
- `PUT /livreur/:id` – Modifier un livreur **ok**
- `DELETE /livreur/:id` – Supprimer un livreur **ok**

- `PUT /retour/:id/reception` – Réceptionner un retour (génère avoir) **ok**

- `GET /stock` – Tous les stocks **ok**
- `GET /stock/:id` – Stock par ID **ok**
- `POST /stock/create` – Creation d'un stock pour une taille specifique **ok** 
- `POST /stock/create-multiple` – Creation  4 stocks (S, M, L, XL) pour un maillot avec vérification  **ok**
- `GET /stock/detail/:id_maillot` – Stock par taille **ok**
- `DELETE /stock/:id` – Supprimer un stock  **ok**

- `GET /stockmaillot` – Tous les mouvement de stocks   **ok**
- `GET /stockmaillot/:id` – Un mouvement par ID  **ok**
- `GET /stockmaillot/:id_stock` – Tous les mouvements d'un stock précis  **ok**
- `DELETE /stockmaillot/:id` – Supprimer un mouvement (sans mise à jour des champs obsolètes)  **ok**


### 👤 Routes Authentifiées (client)

- `GET /client/:id/details` – Détails des commandes d’un client **ok**
- `GET /client/:id/details` – Client par ID (authentifié) **ok**
- `GET /client/:id` – Détails d’un client **ok**
- `PUT /client/:id` – Mise à jour d'un client **ok**
- `DELETE /client/:id` – Suppression du compte client passage anonyme **A TESTER A LA FIN**

- `POST /commande/create` – Créer une commande **pas utilisée**
- `POST /commande/finaliser` – Finaliser une commande **ok**
- `GET /commande` – Liste des commandes **ok**
- `GET /commande/:id` – Voir une commande **ok**
- `POST /commande/valider-paiement/:id` – Valider le paiement **ok**
- `POST /commande/:id_commande/reduction` – Appliquer une réduction **ok**

- `GET /lignecommande/client/:id_client` – Lignes d’un client **ok**
- `GET /lignecommande/client/:id_client/total` – Total panier **ok**
- `GET /lignecommande/client/:id_client/panier` – Lecture du  panier client **ok**
- `GET /lignecommande/client/:id_client/lignes` – lignes commande d'un client **ok**

- `GET livraison/commande/:id_commande` - Livraison liée à une commande **ok**
- `POST /livraison/create` – Créer une livraison **pas utilisée**
- `PUT /livraison/:id` – Modifier une livraison **ok**
- `DELETE /livraison/:id` – Supprimer une livraison **pas utilisée**

- `POST /retour/demander` – Demander un retour  **ok**


- `POST /avis/create` – Créer un avis  **ok**
- `DELETE /avis/:id` – Supprimer un avis  **ok**

- `POST /facture/create/:id_commande` – Creation facture  **ok**
- `GET /facture` – Toutes les factures du client connecté **ok**
- `GET /facture/download/:numero_facture` – Télécharger une facture **ok**
- `GET /facture/:numero_facture` – Récupérer une facture par son numéro au client connecté **ok**

- `POST /stockmaillot/create` – Generation de mouvement de stock  **ok**

- `GET /stock/public/disponibilite/:id_maillot` – Stock public par maillot **ok**

- `POST /stripe/create-checkout-session/:id_commande` – Créer une session Stripe (paiement) **pas utilisée**


### 🌍 Routes Publiques

- `GET /maillot` – Tous les maillots **ok**
- `GET /maillot/:id` – Maillot par ID **ok**
- `GET /maillot/coup-de-coeur` – Les maillots les plus vendus **ok**
- `GET /maillot/nouveautes` - La liste des nouvels arrivages **ok**

- `GET /artiste` – Tous les artistes **ok**
- `GET /artiste/:id` – Artiste par ID **ok**

- `GET /association` – Toutes les associations **ok**
- `GET /association/:id` – Association par ID **ok**

- `GET /avis/maillot/:id"` – Tous les avis d’un maillot **ok**
- `GET /avis/maillot/:id/stats"` Statistiques d’avis pour un maillot **ok**
- 
- `GET /personnalisation` – Toutes les personnalisations **ok**
- `GET /personnalisation/:id` – Personnalisation par ID **ok**

- `GET /lignecommande/:id/id_ligne` – Détails ligne commande **ok**
- `POST /lignecommande/create` – Ajouter au panier **ok**
- `PUT /lignecommande/:id_ligne` – Modifier une ligne **ok**
- `DELETE /lignecommande/:id_ligne` – Suppression d'une ligne du panier **ok**
- `DELETE /lignecommande/cleanup` – Nettoyer paniers expirés 
- `GET /lignecommande/:id/details` – Détails ligne avec personnalisations **ok**

- `GET /lignecommande-personnalisation/` – Liste des personnalisations **ok**
- `GET /lignecommande-personnalisation/:id_lignecommande` : Personnalisations par ligne **ok**
- `POST /lignecommande-personnalisation/create` – Ajouter une personnalisation **ok**
- `PUT /lignecommande-personnalisation/:id_lignecommande/` – Modifier une personnalisation **ok**
- `DELETE /lignecommande-personnalisation/:id_lignecommande/:id_personnalisation` – Supprimer une personnalisation **ok**

- `GET /reduction/public/actives` – Réductions actives (côté client - message pop-up ou champ promo) **ok**

- `GET /methode-livraison` – Méthodes de livraison **ok**
- `GET /methode-livraison/:id` – Méthode par ID **ok**

- `GET /lieu-livraison` – Lieux de livraison **ok**
- `GET /lieu-livraison/:id` – Lieu par ID **ok**

- `GET /livreur` – Tous les livreurs **ok**
- `GET /livreur/:id` – Livreur par ID **ok**

- `GET /tva` – Toutes les TVA **ok**
- `GET /tva/:id` – TVA par ID **ok**

- `POST /auth/login` – login **ok**
- `POST /auth/register-client` – Inscription Client **ok**
- `POST /auth/activate/{token_activation}` – Activation compte Client **ok**
- `POST /auth/forgot-password` - Mot de passe oublié **ok**

- `GET stock/public/disponibilite/:id_maillot` – Disponibilité d’un maillot par taille (quantité + statut) **ok**
