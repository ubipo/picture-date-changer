function cleanup {
    echo PIDS: $VITE_PID $ELECTRON_PID
    kill $VITE_PID $ELECTRON_PID
    exit
}

trap cleanup INT

npm run dev:vite &
VITE_PID=$!
npm run dev:electron &
ELECTRON_PID=$!

sleep infinity
