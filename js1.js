document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();    
    document.querySelector('.algorithm-btn[data-algorithm="fcfs"]').classList.add('active');
    addAnimationStyles();
});

function setupEventListeners() {
    document.querySelectorAll('.algorithm-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.algorithm-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            if (this.dataset.algorithm === 'rr') {
                document.getElementById('quantum-input').style.display = 'block';
            } else {
                document.getElementById('quantum-input').style.display = 'none';
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-job-btn')) {
            if (document.querySelectorAll('.job-row').length > 1) {
                e.target.parentElement.remove();
            } else {
                alert('You need at least one job!');
            }
        }
    });
}

function addJobRow() {
    const jobContainer = document.getElementById('job-container');
    const jobCount = document.querySelectorAll('.job-row').length + 1;
    
    const jobRow = document.createElement('div');
    jobRow.className = 'job-row';
    
    jobRow.innerHTML = `
        <input type="text" class="job-name" placeholder="Job Name (e.g. P${jobCount})" value="P${jobCount}">
        <input type="number" class="arrival-time" placeholder="Arrival Time" min="0" value="0">
        <input type="number" class="burst-time" placeholder="Burst Time" min="1" value="5">
        <button class="remove-job-btn">X</button>
    `;
    
    jobContainer.appendChild(jobRow);
}

function runSimulation() {
    const jobs = getJobsData();
    
    if (!validateJobs(jobs)) {
        return;
    }
    
    const algorithm = document.querySelector('.algorithm-btn.active').dataset.algorithm;
    
    let results;
    let title;
    
    switch(algorithm) {
        case 'fcfs':
            results = fcfs(jobs);
            title = "First Come First Serve (FCFS)";
            break;
        case 'sjf':
            results = sjf(jobs);
            title = "Shortest Job First (SJF) - Non-preemptive";
            break;
        case 'srtn':
            results = srtn(jobs);
            title = "Shortest Remaining Time Next (SRTN) - Preemptive";
            break;
        case 'rr':
            const quantum = parseInt(document.getElementById('time-quantum').value);
            if (isNaN(quantum) || quantum < 1) {
                showError("Please enter a valid time quantum (minimum 1).");
                return;
            }
            results = roundRobin(jobs, quantum);
            title = `Round Robin (Time Quantum: ${quantum})`;
            break;
    }
    
    displayResults(results, title);
}

function getJobsData() {
    const jobRows = document.querySelectorAll('.job-row');
    const jobs = [];
    
    jobRows.forEach((row, index) => {
        const name = row.querySelector('.job-name').value || `P${index+1}`;
        const arrivalTime = parseInt(row.querySelector('.arrival-time').value);
        const burstTime = parseInt(row.querySelector('.burst-time').value);
        
        jobs.push({
            id: index,
            name: name,
            arrivalTime: arrivalTime,
            burstTime: burstTime,
            remainingTime: burstTime,
            finished: false,
            finishTime: 0,
            turnaroundTime: 0,
            waitingTime: 0,
            startTime: -1
        });
    });
    
    return jobs;
}

function validateJobs(jobs) {
    for (let job of jobs) {
        if (isNaN(job.arrivalTime) || job.arrivalTime < 0) {
            showError(`Invalid arrival time for ${job.name}. Please enter a non-negative number.`);
            return false;
        }
        
        if (isNaN(job.burstTime) || job.burstTime < 1) {
            showError(`Invalid burst time for ${job.name}. Please enter a positive number.`);
            return false;
        }
    }
    
    return true;
}

function showError(message) {
    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'block';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(errorElement);
}

function displayResults(results, title) {
    const { jobs, timeline } = results;
    
    jobs.sort((a, b) => a.id - b.id);
    
    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'block';
    
    document.getElementById('result-title').textContent = title;
    
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    
    const table = document.createElement('table');
    
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Job</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Start Time</th>
            <th>Finish Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
        </tr>
    `;
    table.appendChild(tableHeader);
    
    const tableBody = document.createElement('tbody');
    jobs.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.name}</td>
            <td>${job.arrivalTime}</td>
            <td>${job.burstTime}</td>
            <td>${job.startTime}</td>
            <td>${job.finishTime}</td>
            <td>${job.turnaroundTime}</td>
            <td>${job.waitingTime}</td>
        `;
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    
    resultsContainer.appendChild(table);
    
    const avgTurnaroundTime = jobs.reduce((sum, job) => sum + job.turnaroundTime, 0) / jobs.length;
    const avgWaitingTime = jobs.reduce((sum, job) => sum + job.waitingTime, 0) / jobs.length;
    
    const averageTimes = document.createElement('div');
    averageTimes.className = 'average-times';
    averageTimes.innerHTML = `
        <p><strong>Average Turnaround Time:</strong> ${avgTurnaroundTime.toFixed(2)}</p>
        <p><strong>Average Waiting Time:</strong> ${avgWaitingTime.toFixed(2)}</p>
    `;
    
    resultsContainer.appendChild(averageTimes);
    
    createAnimatedGanttChart(timeline, resultsContainer);
}

function createAnimatedGanttChart(timeline, container) {
    const endTime = timeline.reduce((max, slot) => Math.max(max, slot.end), 0);
    
    const colors = {};
    const uniqueJobs = [...new Set(timeline.map(slot => slot.name))].sort();
    
    uniqueJobs.forEach((jobName, index) => {
        const hue = (index * 137) % 360;
        colors[jobName] = `hsl(${hue}, 70%, 40%)`;
    });
    
    const ganttSection = document.createElement('div');
    ganttSection.innerHTML = `<h3>Gantt Chart</h3>`;
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'playback-controls';
    controlsDiv.style.margin = '10px 0';
    controlsDiv.style.display = 'flex';
    controlsDiv.style.alignItems = 'center';
    controlsDiv.style.gap = '10px';
    
    controlsDiv.innerHTML = `
        <button id="play-pause-btn" class="play-btn">Play</button>
        <div>
            <label for="playback-speed">Speed: </label>
            <select id="playback-speed">
                <option value="0.5">0.5x</option>
                <option value="1" selected>1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
            </select>
        </div>
        <input type="range" id="time-slider" min="0" max="${endTime}" value="0" step="0.1" style="flex-grow: 1;">
        <span id="current-time-display">0.0</span>
    `;
    
    ganttSection.appendChild(controlsDiv);
    
    const ganttChart = document.createElement('div');
    ganttChart.className = 'gantt-chart';
    
    const ganttContainer = document.createElement('div');
    ganttContainer.className = 'gantt-container';
    ganttContainer.style.width = `${Math.max(endTime * 30, 500)}px`;
    ganttContainer.style.position = 'relative';
    ganttContainer.style.height = `${uniqueJobs.length * 50 + 40}px`;
    
    const timeAxis = document.createElement('div');
    timeAxis.className = 'time-axis';
    timeAxis.style.position = 'relative';
    timeAxis.style.height = '30px';
    timeAxis.style.width = '100%';
    timeAxis.style.borderBottom = '1px solid #ccc';
    
    for (let t = 0; t <= endTime; t++) {
        const timeLine = document.createElement('div');
        timeLine.className = 'time-line';
        timeLine.style.position = 'absolute';
        timeLine.style.left = `${t * 30}px`;
        timeLine.style.height = '10px';
        timeLine.style.width = '1px';
        timeLine.style.backgroundColor = '#888';
        timeLine.style.top = '20px';
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'gantt-time';
        timeLabel.textContent = t;
        timeLabel.style.position = 'absolute';
        timeLabel.style.left = `${t * 30}px`;
        timeLabel.style.top = '0px';
        timeLabel.style.transform = 'translateX(-50%)';
        timeLabel.style.fontSize = '12px';
        
        timeAxis.appendChild(timeLine);
        timeAxis.appendChild(timeLabel);
    }
    
    ganttContainer.appendChild(timeAxis);
    
    const processRows = document.createElement('div');
    processRows.className = 'process-rows';
    processRows.style.position = 'relative';
    processRows.style.height = `${uniqueJobs.length * 50}px`;
    
    uniqueJobs.forEach((jobName, index) => {
        const row = document.createElement('div');
        row.className = 'process-row';
        row.style.position = 'relative';
        row.style.height = '50px';
        row.style.width = '100%';
        row.style.borderBottom = '1px solid #eee';
        
        const processLabel = document.createElement('div');
        processLabel.className = 'process-label';
        processLabel.textContent = jobName;
        processLabel.style.position = 'absolute';
        processLabel.style.left = '0';
        processLabel.style.width = '60px';
        processLabel.style.height = '100%';
        processLabel.style.display = 'flex';
        processLabel.style.alignItems = 'center';
        processLabel.style.justifyContent = 'center';
        processLabel.style.backgroundColor = colors[jobName];
        processLabel.style.color = 'white';
        processLabel.style.fontWeight = 'bold';
        processLabel.style.zIndex = '5';
        
        row.appendChild(processLabel);
        
        const processTimeline = timeline.filter(slot => slot.name === jobName);
        
        processTimeline.forEach((slot, slotIndex) => {
            const bar = document.createElement('div');
            bar.className = 'gantt-bar';
            bar.style.position = 'absolute';
            bar.style.left = `${slot.start * 30 + 60}px`;
            bar.style.width = `${(slot.end - slot.start) * 30}px`;
            bar.style.height = '30px';
            bar.style.top = '10px';
            bar.style.backgroundColor = colors[jobName];
            bar.style.opacity = '0';
            bar.style.display = 'flex';
            bar.style.alignItems = 'center';
            bar.style.justifyContent = 'center';
            bar.style.color = 'white';
            bar.style.fontWeight = 'bold';
            bar.style.borderRadius = '4px';
            bar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            bar.dataset.index = slotIndex;
            bar.dataset.startTime = slot.start;
            bar.dataset.endTime = slot.end;
            
            const startLabel = document.createElement('div');
            startLabel.className = 'time-label start';
            startLabel.textContent = slot.start;
            startLabel.style.position = 'absolute';
            startLabel.style.bottom = '32px';
            startLabel.style.left = '0';
            startLabel.style.fontSize = '10px';
            startLabel.style.opacity = '0';
            
            const endLabel = document.createElement('div');
            endLabel.className = 'time-label end';
            endLabel.textContent = slot.end;
            endLabel.style.position = 'absolute';
            endLabel.style.bottom = '32px';
            endLabel.style.right = '0';
            endLabel.style.fontSize = '10px';
            endLabel.style.opacity = '0';
            
            bar.appendChild(startLabel);
            bar.appendChild(endLabel);
            
            row.appendChild(bar);
        });
        
        processRows.appendChild(row);
    });
    
    ganttContainer.appendChild(processRows);
    
    const timelineMarker = document.createElement('div');
    timelineMarker.className = 'timeline-marker';
    timelineMarker.style.position = 'absolute';
    timelineMarker.style.top = '0';
    timelineMarker.style.height = '100%';
    timelineMarker.style.width = '2px';
    timelineMarker.style.backgroundColor = 'red';
    timelineMarker.style.zIndex = '10';
    timelineMarker.style.left = '60px';
    timelineMarker.style.pointerEvents = 'none';
    
    ganttContainer.appendChild(timelineMarker);
    
    ganttChart.appendChild(ganttContainer);
    ganttSection.appendChild(ganttChart);
    
    const legendDiv = document.createElement('div');
    legendDiv.className = 'process-legend';
    legendDiv.style.display = 'flex';
    legendDiv.style.flexWrap = 'wrap';
    legendDiv.style.gap = '10px';
    legendDiv.style.margin = '15px 0';
    
    uniqueJobs.forEach(jobName => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.marginRight = '15px';
        
        const colorBox = document.createElement('div');
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = colors[jobName];
        colorBox.style.marginRight = '5px';
        
        const jobLabel = document.createElement('span');
        jobLabel.textContent = jobName;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(jobLabel);
        legendDiv.appendChild(legendItem);
    });
    
    ganttSection.appendChild(legendDiv);
    container.appendChild(ganttSection);
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.style.padding = '8px 16px';
    playPauseBtn.style.backgroundColor = '#4CAF50';
    playPauseBtn.style.color = 'white';
    playPauseBtn.style.border = 'none';
    playPauseBtn.style.borderRadius = '4px';
    playPauseBtn.style.cursor = 'pointer';
    
    let isPlaying = false;
    let currentTime = 0;
    let animationFrameId = null;
    let lastTimestamp = null;
    let playbackSpeed = 1;
    
    function updateGanttChart(time) {
        document.getElementById('current-time-display').textContent = time.toFixed(1);
        document.getElementById('time-slider').value = time;
        timelineMarker.style.left = `${time * 30 + 60}px`;
        
        const ganttBars = document.querySelectorAll('.gantt-bar');
        ganttBars.forEach(bar => {
            const startTime = parseFloat(bar.dataset.startTime);
            const endTime = parseFloat(bar.dataset.endTime);
            
            const startLabel = bar.querySelector('.time-label.start');
            const endLabel = bar.querySelector('.time-label.end');
            
            if (time >= startTime && time <= endTime) {
                bar.style.opacity = '1';
                const progress = (time - startTime) / (endTime - startTime);
                const width = ((endTime - startTime) * progress * 30);
                bar.style.width = `${width}px`;
                bar.style.transition = 'width 0.1s linear';
                startLabel.style.opacity = '1';
                endLabel.style.opacity = '0';
            } else if (time > endTime) {
                bar.style.opacity = '1';
                bar.style.width = `${(endTime - startTime) * 30}px`;
                startLabel.style.opacity = '1';
                endLabel.style.opacity = '1';
            } else {
                bar.style.opacity = '0.0';
                startLabel.style.opacity = '0';
                endLabel.style.opacity = '0';
            }
        });
    }
    
    function animateGanttChart(timestamp) {
        if (!isPlaying) return;
        
        if (lastTimestamp === null) {
            lastTimestamp = timestamp;
        }
        
        const delta = (timestamp - lastTimestamp) / 1000 * playbackSpeed;
        lastTimestamp = timestamp;
        currentTime += delta;
        
        if (currentTime >= endTime) {
            currentTime = endTime;
            isPlaying = false;
            playPauseBtn.textContent = 'Replay';
        }
        
        updateGanttChart(currentTime);
        
        if (isPlaying) {
            animationFrameId = requestAnimationFrame(animateGanttChart);
        }
    }
    
    function togglePlayPause() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseBtn.textContent = 'Pause';
            lastTimestamp = null;
            
            if (currentTime >= endTime) {
                currentTime = 0;
                const ganttBars = document.querySelectorAll('.gantt-bar');
                ganttBars.forEach(bar => {
                    bar.style.opacity = '0';
                    bar.style.width = '0px';
                    
                    const timeLabels = bar.querySelectorAll('.time-label');
                    timeLabels.forEach(label => {
                        label.style.opacity = '0';
                    });
                });
            }
            
            animationFrameId = requestAnimationFrame(animateGanttChart);
        } else {
            playPauseBtn.textContent = 'Play';
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        }
    }
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    document.getElementById('playback-speed').addEventListener('change', function() {
        playbackSpeed = parseFloat(this.value);
    });
    
    document.getElementById('time-slider').addEventListener('input', function() {
        if (isPlaying) {
            togglePlayPause();
        }
        currentTime = parseFloat(this.value);
        updateGanttChart(currentTime);
    });
    
    updateGanttChart(0);
}

function addAnimationStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .timeline-marker {
            position: absolute;
            top: 0;
            height: 100%;
            width: 2px;
            background-color: red;
            z-index: 10;
            pointer-events: none;
        }
        .gantt-bar {
            position: absolute;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            overflow: hidden;
            white-space: nowrap;
        }
        .play-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .play-btn:hover {
            background-color: #45a049;
        }
        input[type="range"] {
            height: 8px;
            -webkit-appearance: none;
            background: #d3d3d3;
            outline: none;
            border-radius: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #4CAF50;
            cursor: pointer;
            border-radius: 50%;
        }
        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #4CAF50;
            cursor: pointer;
            border-radius: 50%;
        }
        .gantt-container {
            position: relative;
            margin-top: 20px;
            overflow-x: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .process-row {
            position: relative;
            border-bottom: 1px solid #eee;
        }
        .process-label {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 60px;
            background-color: #f5f5f5;
            border-right: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .time-axis {
            padding-left: 60px;
            position: relative;
            height: 30px;
            border-bottom: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .gantt-time {
            position: absolute;
            transform: translateX(-50%);
            font-size: 12px;
            color: #666;
        }
        .time-label {
            font-size: 10px;
            position: absolute;
            color: #333;
            background-color: rgba(255,255,255,0.8);
            padding: 2px 4px;
            border-radius: 2px;
            transition: opacity 0.3s;
        }
    `;
    document.head.appendChild(styleEl);
}