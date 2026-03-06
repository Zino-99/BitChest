# BitChest
BitChest est une application qui permet aux particuliers d’acheter et de vendre des cryptomonnaies, telles que le Bitcoin ou l’Ethereum.

# 1. Installer les dependances PHP
cd backend && composer install
 
# 2. Configurer l'environnement
cp .env .env.local
# Modifier DATABASE_URL dans .env.local :
# DATABASE_URL="mysql://root:root@127.0.0.1:3306/BitChest?serverVersion=8.0.44&charset=utf8"

 
# 3. Creer la base et executer les migrations
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
 
# 4. Charger le jeu d'essai (10 cryptos + 30j historique + comptes)
php bin/console doctrine:fixtures:load
 
# 5. Demarrer le serveur Symfony
symfony server:start
 
# 6. Lancer la mise a jour des cotations
php bin/console app:update-quotes --watch
12.3 Installation du frontend
# 1. Installer les dependances
cd frontend && npm install
 
# 2. Lancer en mode developpement
npm run dev
 
# 3. Lancer les tests (87 tests doivent passer)
npm run test
 
# 4. Build de production
npm run build
