function assignTasksWithPriorityAndDependencies(developers, tasks) {
    // Initialize result arrays
    const developerAssignments = developers.map(dev => ({
        name: dev.name,
        assignedTasks: [],
        totalHours: 0
    }));
    const unassignedTasks = [];

    // Sort tasks by priority (descending) and dependencies handled later
    tasks.sort((a, b) => b.priority - a.priority);

    // Keep track of completed tasks for dependency resolution
    const completedTasks = new Set();

    // Helper function to check if all dependencies are met
    function dependenciesMet(task) {
        return task.dependencies.every(dep => completedTasks.has(dep));
    }

    // Attempt to assign each task
    for (const task of tasks) {
        if (!dependenciesMet(task)) {
            unassignedTasks.push(task);
            continue;
        }

        // Filter developers who are eligible for the task
        const eligibleDevelopers = developers
            .map((dev, i) => ({ ...dev, index: i }))
            .filter(dev => 
                dev.skillLevel >= task.difficulty &&
                dev.maxHours - developerAssignments[dev.index].totalHours >= task.hoursRequired &&
                (dev.preferredTaskType === task.taskType || dev.skillLevel > task.difficulty)
            );

        // Sort eligible developers by preference match and lowest total hours for balance
        eligibleDevelopers.sort((a, b) => {
            const prefMatchA = a.preferredTaskType === task.taskType ? 1 : 0;
            const prefMatchB = b.preferredTaskType === task.taskType ? 1 : 0;
            return (prefMatchB - prefMatchA) || 
                   (developerAssignments[a.index].totalHours - developerAssignments[b.index].totalHours);
        });

        // Assign task to the best matching developer if one is available
        if (eligibleDevelopers.length > 0) {
            const bestDev = eligibleDevelopers[0];
            developerAssignments[bestDev.index].assignedTasks.push(task.taskName);
            developerAssignments[bestDev.index].totalHours += task.hoursRequired;
            completedTasks.add(task.taskName);
        } else {
            // No suitable developer found, mark task as unassigned
            unassignedTasks.push(task);
        }
    }

    // Return the developer assignments and unassigned tasks
    return {
        developerAssignments,
        unassignedTasks: unassignedTasks.map(task => task.taskName)
    };
}

// Example data
const developers = [
    { name: 'Alice', skillLevel: 7, maxHours: 40, preferredTaskType: 'feature' },
    { name: 'Bob', skillLevel: 9, maxHours: 30, preferredTaskType: 'bug' },
    { name: 'Charlie', skillLevel: 5, maxHours: 35, preferredTaskType: 'refactor' }
];
const tasks = [
    { taskName: 'Feature A', difficulty: 7, hoursRequired: 15, taskType: 'feature', priority: 4, dependencies: [] },
    { taskName: 'Bug Fix B', difficulty: 5, hoursRequired: 10, taskType: 'bug', priority: 5, dependencies: [] },
    { taskName: 'Refactor C', difficulty: 9, hoursRequired: 25, taskType: 'refactor', priority: 3, dependencies: ['Bug Fix B'] },
    { taskName: 'Optimization D', difficulty: 6, hoursRequired: 20, taskType: 'feature', priority: 2, dependencies: [] },
    { taskName: 'Upgrade E', difficulty: 8, hoursRequired: 15, taskType: 'feature', priority: 5, dependencies: ['Feature A'] }
];

// Run function with example data
const result = assignTasksWithPriorityAndDependencies(developers, tasks);
console.log(result);
