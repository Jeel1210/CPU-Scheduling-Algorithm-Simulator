function srtn(jobsInput) {
    const jobs = JSON.parse(JSON.stringify(jobsInput));
    
    jobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let completed = 0;
    const timeline = [];
    let lastSelectedJob = -1;
    
    while (completed < jobs.length) {
        let selectedJob = -1;
        let shortestRemaining = Infinity;
        
        for (let i = 0; i < jobs.length; i++) {
            if (!jobs[i].finished && 
                jobs[i].arrivalTime <= currentTime && 
                jobs[i].remainingTime < shortestRemaining) {
                shortestRemaining = jobs[i].remainingTime;
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
        
        let runTime = jobs[selectedJob].remainingTime;
        let nextPreemption = Infinity;
        
        for (let i = 0; i < jobs.length; i++) {
            if (!jobs[i].finished && jobs[i].arrivalTime > currentTime && jobs[i].arrivalTime < currentTime + runTime) {
                if (jobs[i].arrivalTime < nextPreemption) {
                    nextPreemption = jobs[i].arrivalTime;
                }
            }
        }
        
        let timeSlice = (nextPreemption === Infinity) 
            ? runTime 
            : nextPreemption - currentTime;
        
        if (selectedJob !== lastSelectedJob) {
            timeline.push({
                name: jobs[selectedJob].name,
                start: currentTime,
                end: currentTime + timeSlice
            });
        } else {            
            timeline[timeline.length - 1].end = currentTime + timeSlice;
        }
        
        currentTime += timeSlice;
        jobs[selectedJob].remainingTime -= timeSlice;
        
        if (jobs[selectedJob].remainingTime === 0) {
            jobs[selectedJob].finished = true;
            jobs[selectedJob].finishTime = currentTime;
            jobs[selectedJob].turnaroundTime = jobs[selectedJob].finishTime - jobs[selectedJob].arrivalTime;
            jobs[selectedJob].waitingTime = jobs[selectedJob].turnaroundTime - jobs[selectedJob].burstTime;
            completed++;
        }
        
        lastSelectedJob = selectedJob;
    }
    
    return { jobs, timeline };
}