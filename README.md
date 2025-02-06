# KO-Cast 🎥💻

KO-Cast is a platform designed for real-time screen streaming, perfect for sharing your screen while searching for stock options that are close to KO 📉 or other use cases. Built with modern technologies, KO-Cast enables seamless video streaming through **WebRTC** and provides an intuitive user experience with a frontend powered by **Angular**.

## Features ✨
- **WebRTC Streaming**: Share your screen in real-time with others
- **Angular Frontend**: A dynamic and responsive UI for easy access to the platform
- **Go Backend**: High-performance backend to handle streaming and data management

## Technologies 🛠️
- **Go**: The backend is powered by Go, ensuring fast and efficient handling of WebRTC connections and streaming tasks.
- **Angular**: The frontend is built with Angular, providing a responsive and user-friendly interface for interacting with the streaming platform.
- **Pion WebRTC**: The [Pion](https://github.com/pion/webrtc) WebRTC library handles real-time communication, allowing for low-latency screen sharing and video streaming.

## Installation 📦

1. Clone the repository:
   ```bash
   git clone https://github.com/FerencoVonMatterhorn/KO-Cast.git
   cd KO-Cast
    ```
2. Install dependencies for the frontend (Angular):
   ```bash
    cd frontend
    npm install
3. Run the project:
   - Start the backend:
     ```bash
     go run main.go
     ```
   - Start the frontend:
     ```bash
     ng serve
     ```
4. Access the application in your browser at http://localhost:4200.

## Usage 💡
Once the server is running, you can start streaming your screen by accessing the platform via the Angular frontend.
Share your screen with others through WebRTC for a seamless live-streaming experience.
