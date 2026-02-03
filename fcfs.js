function fcfs(jobsInput) {
    const jobs = JSON.parse(JSON.stringify(jobsInput));
    
    jobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    const timeline = [];
    
    for (let i = 0; i < jobs.length; i++) {
        if (currentTime < jobs[i].arrivalTime) {
            currentTime = jobs[i].arrivalTime;
        }
        
        if (jobs[i].startTime === -1) {
            jobs[i].startTime = currentTime;
        }
        
        timeline.push({
            name: jobs[i].name,
            start: currentTime,
            end: currentTime + jobs[i].burstTime
        });
        
        currentTime += jobs[i].burstTime;
        jobs[i].finishTime = currentTime;
        jobs[i].turnaroundTime = jobs[i].finishTime - jobs[i].arrivalTime;
        jobs[i].waitingTime = jobs[i].turnaroundTime - jobs[i].burstTime;
    }
    
    return { jobs, timeline };
}