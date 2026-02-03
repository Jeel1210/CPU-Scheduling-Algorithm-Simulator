# 🖥️ CPU Scheduling Algorithms Simulator

A web-based simulator that visualizes and compares popular CPU scheduling algorithms used in Operating Systems. Users can input processes with arrival and burst times, run simulations, and observe scheduling behavior through tables and an animated Gantt chart.

---

## ✨ Features

- Add and remove processes dynamically
- Supports multiple CPU scheduling algorithms:
  - First Come First Serve (FCFS)
  - Shortest Job First (Non-preemptive)
  - Shortest Remaining Time Next (Preemptive)
  - Round Robin
- Displays:
  - Start time and finish time
  - Turnaround time
  - Waiting time
  - Average turnaround and waiting time
- Interactive Gantt chart with:
  - Play / Pause control
  - Adjustable animation speed
- Clean, dark-themed UI for better readability

---

## 📥 Input Parameters

For each process:
- Process ID (e.g., P1, P2)
- Arrival Time
- Burst Time

For Round Robin:
- Time Quantum

---

## 📊 Output

- Detailed scheduling table for the selected algorithm
- Calculated metrics:
  - Turnaround Time
  - Waiting Time
  - Average Turnaround Time
  - Average Waiting Time
- Visual execution timeline using a Gantt chart

---

## 🛠️ Tech Stack

- HTML
- CSS
- JavaScript

---

## 🚀 How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cpu-scheduling-simulator.git
