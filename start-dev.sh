#!/bin/bash

# Verifica si se pasó el flag '--stay' para permanecer en la rama actual
stay_in_current_branch=false
for arg in "$@"; do
  if [ "$arg" == "--stay" ]; then
    stay_in_current_branch=true
  fi
done

# Verifica la rama actual
current_branch=$(git branch --show-current)

# Si no estás en la rama 'development' y no se pasó el flag '--stay', cámbiate
if [ "$current_branch" != "development" ] && [ "$stay_in_current_branch" == false ]; then
    echo "Advertencia: No estás en la rama 'development'. Estás en '$current_branch'."
    echo "Cambiando a la rama 'development'..."
    git checkout development
fi

vite
