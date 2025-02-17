package main

import (
	"flag"
	"github.com/ferencovonmatterhorn/ko-cast/pkg/config"
	"github.com/ferencovonmatterhorn/ko-cast/pkg/peering"
	"github.com/ferencovonmatterhorn/ko-cast/pkg/websocket"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

func main() {
	cfg, err := config.InitConfig()
	if err != nil {
		log.Errorf("Failed to initialize config: %v", err)
		return
	}
	log.SetLevel(cfg.LogLevel)

	// Parse the flags passed to program
	flag.Parse()

	// websocket handler
	http.HandleFunc("/websocket", websocket.Handle)

	// request a keyframe every 3 seconds
	go func() {
		for range time.NewTicker(time.Second * 3).C {
			peering.DispatchKeyFrame()
		}
	}()

	// start HTTP server
	log.Infof("Server is starting on address %s", cfg.Addr)
	if err := http.ListenAndServe(cfg.Addr, nil); err != nil {
		log.Errorf("Failed to start http server: %v", err)
	}
}
