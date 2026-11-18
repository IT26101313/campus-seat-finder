# Campus Seat Finder

Project Objective:

Build a web application that helps university students find and reserve available study seats on campus.

Design & UI Requirements:

• Theme: Modern, clean, and university-themed interface suitable for a hackathon demonstration.

• Color Palette: Blue and white.

• Navigation: Simple, intuitive navigation bar.

• Responsiveness: Mobile-friendly layout that adapts smoothly to different screen sizes.

Core Pages & Features:

1. Home Page: Features a welcoming hero section with a prominent search button to quickly locate study spaces.

2. Student Dashboard: Displays an overview of available university study rooms.

3. Visual Seat Availability: Color-coded status indicators showing green for available, red for occupied, and grey for unavailable seats.

4. Interactive Seat Map: A clickable floor plan/layout where students can select specific seats.

5. Reservation System: A functional booking flow allowing students to reserve their selected seat.

   6.Automatic Sensor-Based Seat Detection

Use an ESP32 microcontroller connected to pressure sensors (FSR).

System operation:

When a student sits on a chair, the pressure sensor detects pressure.

ESP32 processes the sensor reading.

ESP32 sends the seat occupancy status through Wi-Fi.

The website automatically changes the seat status to OCCUPIED (red).

When the student leaves the chair, the pressure sensor detects the absence of pressure.

ESP32 sends the updated status.

The website automatically changes the seat status to AVAILABLE (green).

Use stable sensor readings to prevent false occupancy changes.

7. Admin Dashboard: An administrative view tracking overall room occupancy and seat status.

Technical & Data Constraints:

• Ensure the seat selection and reservation workflows are fully interactive and functional on the frontend.

• Use clearly labeled sample data for all rooms, seats, and occupancy metrics—do not attempt to integrate or simulate real-time sensor data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe770a1d-3625-4e0b-9aa3-71c15d4dfb15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
