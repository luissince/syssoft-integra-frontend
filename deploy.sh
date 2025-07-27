#!/bin/bash

# Uso: ./deploy.sh test
# o:   ./deploy.sh master

TARGET_BRANCH=$1

if [ -z "$TARGET_BRANCH" ]; then
  echo "❌ Especifica la rama destino: test o master"
  exit 1
fi

SOURCE_BRANCH="development"

echo "🔄 Haciendo merge de $SOURCE_BRANCH → $TARGET_BRANCH..."

git fetch origin
git checkout $TARGET_BRANCH || git switch $TARGET_BRANCH
git pull origin $TARGET_BRANCH
git merge origin/$SOURCE_BRANCH

if [ $? -ne 0 ]; then
  echo "❌ Hubo conflictos al hacer merge. Cancela y resuelve primero."
  exit 1
fi

git push origin $TARGET_BRANCH
echo "✅ ¡Despliegue a '$TARGET_BRANCH' listo!"
