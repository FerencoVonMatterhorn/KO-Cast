package config

import (
	"flag"
	"fmt"
	log "github.com/sirupsen/logrus"
)

// Config holds the configuration values
type Config struct {
	Addr     string
	LogLevel log.Level
}

// InitConfig parses command-line flags and returns a Config struct
func InitConfig() (*Config, error) {
	// Define flags
	addr := flag.String("addr", ":8080", "http service address")
	logLevel := flag.String("loglevel", "info", "log level (debug, info, warn, error, fatal, panic)")

	// Parse flags
	flag.Parse()

	// Parse log level
	level, err := log.ParseLevel(*logLevel)
	if err != nil {
		return nil, fmt.Errorf("invalid log level specified: %v", err)
	}

	// Return parsed configuration
	return &Config{
		Addr:     *addr,
		LogLevel: level,
	}, nil
}
