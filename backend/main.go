package main

import (
	"github.com/google/uuid"
	"log"
	"net/http"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pion/webrtc/v4"
)

// ScreenSession stores active screen-sharing sessions
type ScreenSession struct {
	ID             string
	PeerConnection *webrtc.PeerConnection
	RemoteTrack    *webrtc.TrackRemote
}

// Global storage for active sessions
var (
	sessions   = make(map[string]*ScreenSession)
	sessionMux sync.Mutex
)

func main() {
	// Initialize Gin router
	router := gin.Default()

	// Enable CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:4200"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// API Routes
	router.POST("/session", createSession)
	router.GET("/screens", listScreens)

	// Start the server
	log.Println("Server running on :8080")
	log.Fatal(router.Run(":8080"))
}

// Create a new WebRTC screen-sharing session
func createSession(c *gin.Context) {
	// Create WebRTC configuration
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// Create a new PeerConnection
	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create peer connection"})
		return
	}

	// Generate a unique session ID
	sessionID, err := uuid.NewUUID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sessionID"})
		return
	}

	// Handle incoming video track
	peerConnection.OnTrack(func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		log.Println("Received track:", track.Kind())

		// Store session
		sessionMux.Lock()
		sessions[sessionID.String()] = &ScreenSession{
			ID:             sessionID.String(),
			PeerConnection: peerConnection,
			RemoteTrack:    track,
		}
		sessionMux.Unlock()
	})

	// Handle ICE candidates
	peerConnection.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		if candidate != nil {
			log.Println("New ICE candidate:", candidate.String())
		}
	})

	// Read the SDP offer from the request
	var offer webrtc.SessionDescription
	if err := c.ShouldBindJSON(&offer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SDP offer"})
		return
	}

	// Set remote description
	if err := peerConnection.SetRemoteDescription(offer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set remote description"})
		return
	}

	// Create an SDP answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create SDP answer"})
		return
	}

	// Set local description
	if err := peerConnection.SetLocalDescription(answer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set local description"})
		return
	}

	// Return session ID and SDP answer
	c.JSON(http.StatusOK, gin.H{
		"session_id": sessionID,
		"answer":     answer,
	})
}

// Get the list of active screen-sharing sessions
func listScreens(c *gin.Context) {
	sessionMux.Lock()
	defer sessionMux.Unlock()

	// Convert session map to a list of active sessions
	var activeScreens []gin.H
	for _, session := range sessions {
		activeScreens = append(activeScreens, gin.H{
			"session_id": session.ID,
			"active":     session.RemoteTrack != nil,
		})
	}

	c.JSON(http.StatusOK, gin.H{"screens": activeScreens})
}
