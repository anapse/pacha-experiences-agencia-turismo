echo "============================================"
echo "  🏜️  Pacha Experiences - Plataforma Turística"
echo "============================================"
echo ""
echo "📦 Iniciando servicios..."
echo ""

# Iniciar backend
echo "🔧 Backend: http://localhost:3001"
echo "   API:     http://localhost:3001/api"
echo ""
cd backend
start /B node server.js
cd ..

# Esperar que backend inicie
timeout /t 2 /nobreak >nul

# Iniciar frontend
echo "🎨 Frontend: http://localhost:5173"
echo ""
cd frontend
start /B npx vite --host
cd ..

echo "============================================"
echo "  ✅ Servicios iniciados"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔧 Backend:  http://localhost:3001"
echo "  📋 Admin:    admin@pacha.com / admin123"
echo "============================================"
