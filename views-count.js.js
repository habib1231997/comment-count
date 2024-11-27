const postId = window.location.pathname;  // Unique ID for the current post  
const defaultViews = [5000, 6000, 7000];  // Default starting views
const minInterval = 2000;  // Minimum interval (2 seconds)
const maxInterval = 20000;  // Maximum interval (20 seconds)
const minIncrementShort = [1, 2];  // Minimum views increment 
const maxIncrementLong = [1, 2, 3];  // Maximum views increment  
const reloadThreshold = 30000;  // Reload threshold in milliseconds
const shortIntervalWeight = 0.4;  // 40% for 2-10 seconds
const longIntervalWeight = 0.6;  // 60% for 11-20 seconds
const reloadIncrementShort = 1;  // Increment if reload within threshold
const reloadIncrementLong = [2, 3, 5];  // Increment if reload after threshold 

// Format views in "k" style
const formatViews = (views) => {
  if (views >= 1000) {
    const whole = Math.floor(views / 1000);
    const fractional = ((views % 1000) / 1000).toFixed(3).slice(2);
    return `${whole}.${fractional}k`;
  }
  return views.toString();
};

// Function to get current views from localStorage or default (randomly selects from first time visit [5000, 6000, 7000])
const getPostViews = () => {
  let views = localStorage.getItem(postId);
  if (!views) {
    views = defaultViews[Math.floor(Math.random() * defaultViews.length)];
    localStorage.setItem(postId, views);
  }
  return parseInt(views);
};

// Update views in localStorage and update the DOM
const updatePostViews = (increment) => {
  const currentViews = getPostViews();
  const newViews = currentViews + increment;
  localStorage.setItem(postId, newViews);

  const viewsElement = document.querySelector(".views-count");
  if (viewsElement) {
    viewsElement.innerText = `${formatViews(newViews)} views`;
  }
};

// Function to get a random increment value from an array
const getRandomIncrement = (increments) => {
  return increments[Math.floor(Math.random() * increments.length)];
};

// Function to determine a random interval and increment
const getRandomIntervalAndIncrement = () => {
  const isShortInterval = Math.random() < shortIntervalWeight;
  const interval = isShortInterval
    ? Math.floor(Math.random() * (10000 - minInterval + 1)) + minInterval // 2-10 seconds
    : Math.floor(Math.random() * (maxInterval - 11000 + 1)) + 11000; // 11-20 seconds

  const increment = isShortInterval
    ? getRandomIncrement(minIncrementShort) // Random increment from [1, 2]
    : getRandomIncrement(maxIncrementLong); // Random increment from [1, 2, 3]

  return { interval, increment };
};

// Randomly update views at random intervals
const randomViewUpdate = () => {
  const { interval, increment } = getRandomIntervalAndIncrement();
  setTimeout(() => {
    updatePostViews(increment);
    randomViewUpdate(); // Recursive call for continuous updates
  }, interval);
};

// Handle page reload to increment views
const handlePageReload = () => {
  const now = Date.now();
  const lastReloadTime = parseInt(localStorage.getItem(`${postId}-last-reload`)) || 0;
  const timeSinceLastReload = now - lastReloadTime;

  if (timeSinceLastReload < reloadThreshold) {
    updatePostViews(reloadIncrementShort); // Increment for quick reloads
  } else {
    updatePostViews(getRandomIncrement(reloadIncrementLong)); // Increment for delayed reloads
  }
  localStorage.setItem(`${postId}-last-reload`, now);
};

// নতুন কোড শুরু: Handle views during browser close and reopen
const handleTimeBasedIncrement = () => {
  const now = Date.now();
  const lastUpdateTime = parseInt(localStorage.getItem(`${postId}-last-update`)) || now;
  const elapsed = now - lastUpdateTime;

  const elapsedIntervals = Math.floor(elapsed / minInterval); // Calculate elapsed intervals
  if (elapsedIntervals > 0) {
    const totalIncrement = elapsedIntervals * getRandomIncrement(minIncrementShort);
    updatePostViews(totalIncrement); // Increment views for elapsed intervals
  }

  localStorage.setItem(`${postId}-last-update`, now); // Update last update time
};
// নতুন কোড শেষ

// Initialize view updates on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  handlePageReload();
  handleTimeBasedIncrement(); // নতুন কোড: Handle views for browser close/reopen
  randomViewUpdate();
});