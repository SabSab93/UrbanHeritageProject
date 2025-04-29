# Projet initial pour l'utilisation API avec auth. 

Projet en Express.js avec l'ORM Prisma

## Installation

1. Clonez le projet
2. Déplacez vous dans le dossier cloné
3. installez les dépendances avec la commande `npm install` 
4. Ajouter le fichier .gitignore `touch .gitignore`et inscrire : db / dist / node_modules / .env
5. Inscrire les elements dans .env (recopier dans l'ancien projet)
6. Lancez le projet avec la commande `npm run dev`
7. Modifiez le fichier `src/index.ts` pour commencer à coder

## Ajout du depot distant sur GIT
6. Creer le repo dans Git, recuperer la clé SSH
7. Supprimer .git dans le projet
8. Lancer l'ajout du dépôt : `git remote add <clé SSH>`
9. Modifier  branch `git branch -M main`
10. `git add .`
11. `git commit -m "first_commit"`
12. `git push -u origin main`


## Utilisation du Backend 
### API UrbanHeritage - Routes Backend 


### 👕 Maillots

| Méthode | URL              | Description              |
|--------:|------------------|--------------------------|
| GET     | /maillots        | Récupérer tous les maillots |
| GET     | /maillots/:id    | Récupérer un maillot par ID |
| POST    | /maillots        | Créer un nouveau maillot |
| PUT     | /maillots/:id    | Modifier un maillot       |
| DELETE  | /maillots/:id    | Supprimer un maillot      |

### 🎨 Artistes

| Méthode | URL              | Description              |
|--------:|------------------|--------------------------|
| GET     | /artistes        | Liste des artistes       |
| GET     | /artistes/:id    | Détails d’un artiste     |
| POST    | /artistes        | Créer un artiste         |
| PUT     | /artistes/:id    | Modifier un artiste      |
| DELETE  | /artistes/:id    | Supprimer un artiste     |

...

### 📦 Commandes / Paiement / Livraison
(À compléter selon ta structure actuelle)
