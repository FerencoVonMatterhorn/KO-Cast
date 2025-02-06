package main

import (
	"flag"
	"github.com/ferencovonmatterhorn/ko-cast/pkg/webrtc"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

var (
	addr = flag.String("addr", ":8080", "http service address")
)

func main() {
	log.SetLevel(log.InfoLevel)
	// Parse the flags passed to program
	flag.Parse()

	// websocket handler
	http.HandleFunc("/websocket", webrtc.WebsocketHandler)

	// request a keyframe every 3 seconds
	go func() {
		for range time.NewTicker(time.Second * 3).C {
			webrtc.DispatchKeyFrame()
		}
	}()

	// start HTTP server
	log.Infof("Server is starting on address %s", *addr)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Errorf("Failed to start http server: %v", err)
	}
}
