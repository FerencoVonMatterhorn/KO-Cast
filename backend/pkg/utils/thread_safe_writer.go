package utils

import (
	"github.com/gorilla/websocket"
	"sync"
)

// Helper to make Gorilla Websockets threadsafe
type ThreadSafeWriter struct {
	*websocket.Conn
	sync.Mutex
}

func (t *ThreadSafeWriter) WriteJSON(v interface{}) error {
	t.Lock()
	defer t.Unlock()

	return t.Conn.WriteJSON(v)
}
