export const timer = (
  seconds: number,
  onTick: Function,
  onComplete: Function
) => {
  let remainingSeconds = seconds;

  // Function to handle the ticking
  function tick() {
    if (remainingSeconds > 0) {
      // Call the onTick callback with the remaining time
      onTick(remainingSeconds);
      remainingSeconds--;
      // Set the timer for the next tick
      setTimeout(tick, 1000);
    } else {
      // Call the onComplete callback when the countdown reaches zero
      onComplete();
    }
  }

  // Start the timer
  tick();
};

// Example usage:

// Callback for each tick
function handleTick(remainingSeconds: number) {
  console.log(`Time remaining: ${remainingSeconds} seconds`);
}

// Callback when the timer completes
function handleComplete() {
  console.log("Timer completed!");
}

// Create a timer for 10 seconds
// timer(10, handleTick, handleComplete);
