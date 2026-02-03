function roundRobin(jobsInput, quantum) {
    const jobs = JSON.parse(JSON.stringify(jobsInput));
    
    jobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let completed = 0;
    const timeline = [];
    let queue = [];
    
    while (completed < jobs.length) {
        for (let i = 0; i < jobs.length; i++) {
            if (!jobs[i].finished && 
                jobs[i].arrivalTime <= currentTime && 
                !queue.includes(i) && 
                jobs[i].remainingTime > 0) {
                queue.push(i);
            }
        }
        
        if (queue.length === 0) {
            let nextArrival = Infinity;
            let nextJobIndex = -1;
            
            for (let i = 0; i < jobs.length; i++) {
                if (!jobs[i].finished && jobs[i].arrivalTime < nextArrival) {
                    nextArrival = jobs[i].arrivalTime;
                    nextJobIndex = i;
                }
            }
            
            if (nextJobIndex !== -1) {
                currentTime = nextArrival;
                queue.push(nextJobIndex);
            } else {
                break;
            }
        }
        
        const jobIndex = queue.shift();
        
        if (jobs[jobIndex].startTime === -1) {
            jobs[jobIndex].startTime = currentTime;
        }
        
        const timeSlice = Math.min(quantum, jobs[jobIndex].remainingTime);
        
        timeline.push({
            name: jobs[jobIndex].name,
            start: currentTime,
            end: currentTime + timeSlice
        });
        
        currentTime += timeSlice;
        jobs[jobIndex].remainingTime -= timeSlice;
        
        for (let i = 0; i < jobs.length; i++) {
            if (!jobs[i].finished && 
                jobs[i].arrivalTime > currentTime - timeSlice && 
                jobs[i].arrivalTime <= currentTime && 
                !queue.includes(i) && 
                i !== jobIndex) {
                queue.push(i);
            }
        }
        
        if (jobs[jobIndex].remainingTime === 0) {
            jobs[jobIndex].finished = true;
            jobs[jobIndex].finishTime = currentTime;
            jobs[jobIndex].turnaroundTime = jobs[jobIndex].finishTime - jobs[jobIndex].arrivalTime;
            jobs[jobIndex].waitingTime = jobs[jobIndex].turnaroundTime - jobs[jobIndex].burstTime;
            completed++;
        } else {
            queue.push(jobIndex);
        }
    }
    
    return { jobs, timeline };
}