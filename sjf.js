function sjf(jobsInput) {
    const jobs = JSON.parse(JSON.stringify(jobsInput));
    
    jobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let completed = 0;
    const timeline = [];
    
    while (completed < jobs.length) {
        let selectedJob = -1;
        let shortestBurst = Infinity;
        
        for (let i = 0; i < jobs.length; i++) {
            if (!jobs[i].finished && 
                jobs[i].arrivalTime <= currentTime && 
                jobs[i].burstTime < shortestBurst) {
                shortestBurst = jobs[i].burstTime;
                selectedJob = i;
            }
        }
        
        if (selectedJob === -1) {
            let nextArrival = Infinity;
            for (let i = 0; i < jobs.length; i++) {
                if (!jobs[i].finished && jobs[i].arrivalTime < nextArrival) {
                    nextArrival = jobs[i].arrivalTime;
                }
            }
            
            currentTime = nextArrival;
            continue;
        }
        
        if (jobs[selectedJob].startTime === -1) {
            jobs[selectedJob].startTime = currentTime;
        }
        
        timeline.push({
            name: jobs[selectedJob].name,
            start: currentTime,
            end: currentTime + jobs[selectedJob].burstTime
        });
        
        currentTime += jobs[selectedJob].burstTime;
        jobs[selectedJob].finishTime = currentTime;
        jobs[selectedJob].turnaroundTime = jobs[selectedJob].finishTime - jobs[selectedJob].arrivalTime;
        jobs[selectedJob].waitingTime = jobs[selectedJob].turnaroundTime - jobs[selectedJob].burstTime;
        jobs[selectedJob].finished = true;
        completed++;
    }
    
    return { jobs, timeline };
}