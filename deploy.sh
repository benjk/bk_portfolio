# Tirer les dernières modifications depuis Git
echo "Pulling latest changes from Git..."
git pull origin main

# Installer les dépendances
echo "Installing dependencies..."
npm install --production

# Construire le projet (si nécessaire)
echo "Building the project..."
npm run build

echo "Deployment completed!"
