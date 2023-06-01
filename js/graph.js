 // Parameters for the chart (values between 0 and 100)
 const parameter1 = 75;
 const parameter2 = 25;

 // Calculate the angles for the chart segments
 const angle1 = parameter1 * 3.6;
 const angle2 = parameter2 * 3.6;

 // Set the widths of the chart segments
 const chartLeft = document.querySelector('.chart-left');
 const chartRight = document.querySelector('.chart-right');
 chartLeft.style.transform = `rotate(${angle1}deg)`;
 chartRight.style.transform = `rotate(${angle2}deg)`;

 // Display the percentage in the center
 const chartPercentage = document.querySelector('.chart-percentage');
 chartPercentage.textContent = `${parameter1}%`;