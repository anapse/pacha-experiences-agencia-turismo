echo "============================================"
echo "  🏜️  Pacha Experiences - Plataforma Turística"
echo "============================================"
echo ""

# Iniciar backend
echo "🔧 Backend: http://localhost:3001"
cd backend
node server.js &
BACKEND_PID=$!
cd ..

sleep 2

# Iniciar frontend
echo "🎨 Frontend: http://localhost:5173"
cd frontend
npx vite --host &
FRONTEND_PID=$!
cd ..

echo "============================================"
echo "  ✅ Servicios iniciados"
echo "  🌐 Frontend:  http://localhost:5173"
echo "  🔧 Backend:   http://localhost:3001"
echo "  📋 Admin:     admin@pacha.com / admin123"
echo "============================================"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
