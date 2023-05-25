// fetch("data/tarantino.csv")
//     .then(response => response.text())
//     .then(html => {
//         // Create a new div element to contain the HTML code
//         const div = document.createElement("div");
//         div.innerHTML = html;

//         // Insert the new div element into the parent container
//         document.body.appendChild(div);
//     })
//     .catch(error => console.log(error));

// Import the CSV file into the script

//source for vector : https://www.vecteezy.com/vector-art/93059-skull-bones-silhouette-free-vector
var dataset = [];

var maxNumberOfSwears = 0;
var maxMinutes = 0;

const movieColors = {
    'Reservoir Dogs': '#FF0000',
    'Pulp Fiction': '#FFA500',
    'Jackie Brown': '#FFFF00',
    'Kill Bill: Vol. 1': '#008000',
    'Kill Bill: Vol. 2': '#0000FF',
    'Inglorious Basterds': '#EE82EE',
    'Django Unchained': '#FFC0CB',
  };

// Load the CSV file into the script
d3.csv("data/tarantino.csv", (data) => {
    dataset = data.map((d) => {
        return {
            movie: d.movie,
            type: d.type,
            word: d.word,
            minues_in: +d.minutes_in,
        };
    });
    //console.log(dataset);
});


// Create a nested array based on movie titles
const processData = (data) => {
    const nestedData = d3.nest()
      .key(d => d.movie)
      .entries(data);
  
    // Process each movie's data
    const processedData = nestedData.map(movie => {
      const { key: movieTitle, values } = movie;
  
      // Create an object for each minute to store words and deaths
      const minutes = {};
      var lastOccurence = 0;
  
      values.forEach(d => {
        // Determine the discrete minutes_in value
        const minutesIn = Math.ceil(d.minutes_in);

        // Determine the last occurence of a word or death
        if (minutesIn > lastOccurence) {
            lastOccurence = minutesIn;
        }
  
        // Add word or death to the corresponding minute object
        if (!minutes[minutesIn]) {
          minutes[minutesIn] = {
            words: [],
            deaths: 0
          };
        }
  
        if (d.type === 'word') {
          minutes[minutesIn].words.push(d.word);
        } else if (d.type === 'death') {
          minutes[minutesIn].deaths++;
        }
      });
  
      // Return the processed movie data
      return {
        movieTitle,
        lastOccurence,
        minutes
      };
    });
    // Find the maximum number of minutes across all movies
    maxMinutes = Math.max(...processedData.map((movie) => movie.lastOccurence));
    // console.log(maxMinutes);

    maxNumberOfSwears = Math.max(...processedData.map((movie) => Math.max(...Object.values(movie.minutes).map((minute) => minute.words.length))));
    // console.log(maxNumberOfSwears);
    generateLines(processedData);
    generateGraphMovies(processedData);
    // console.log(processedData);
  };

  // Load the CSV file
d3.csv("data/tarantino.csv", processData);

// Step 1: Define a function to generate the lines based on processedData
const generateLines = (processedData) => {
    
  
    // Create the lines based on the maximum number of minutes
    for (let i = 1; i <= maxMinutes; i++) {
        // console.log(i);
        const lineClass = i === 0 ? 'line-top' : i === maxMinutes ? 'line-bottom' : 'line-middle';
        const line = document.createElement('div');
        line.classList.add('line', lineClass);
        const sideClass = document.createElement('div');
        sideClass.classList.add('side');
        const punchHoleDiv = document.createElement("div");
        punchHoleDiv.classList.add("punch-hole");
        punchHoleDiv.textContent = (i).toString();
        sideClass.appendChild(punchHoleDiv);
        line.appendChild(sideClass);
        // console.log(line);

        const dataDiv = document.createElement('div');
        dataDiv.classList.add('data');
        line.appendChild(dataDiv);

        const lineHeight = line.offsetHeight;
        var hasDeath = false;
        var numberDeaths = 0;
        
        // Check for each movie if there are words at the current minute
        processedData.forEach((movie) => {
            // console.log(movie);
            const { movieTitle, minutes, words } = movie;
            const colorName = `--color-${movieTitle.replace(/\s+/g, '-')}`;
            const computedStyle = getComputedStyle(document.documentElement);
            const color = computedStyle.getPropertyValue(colorName);
            const dataField = document.createElement('div');
            dataField.classList.add('data-field');

            if(minutes[i]) {
                if (minutes[i].words.length > 0) {
                    const span = document.createElement('span');  
                    span.style.backgroundColor = movieColors[movieTitle];
                    span.classList.add('data-dot');
                    span.style.width = `${((minutes[i].words.length / maxNumberOfSwears) * 90) + 10}%`;
                    span.style.height = `${((minutes[i].words.length / maxNumberOfSwears) * 90) + 10}%`;
                    dataField.appendChild(span);
                }
                if (minutes[i].deaths > 0) {
                    hasDeath = true;
                    numberDeaths += minutes[i].deaths;
                }
            }
            dataDiv.appendChild(dataField);
        });

        const endSideClass = document.createElement('div');
        endSideClass.classList.add('side');
        const endPunchHoleDiv = document.createElement("div");
        endPunchHoleDiv.classList.add("punch-hole");
        if(hasDeath) {

            let skull = document.createElement('img');
            let count = document.createElement('span');
            count.textContent = numberDeaths.toString() + "x";
            count.style.color = "white";
            count.style.fontStyle = "bold";
            skull.src = 'assets/skull.svg';
            endPunchHoleDiv.appendChild(count);
            endPunchHoleDiv.appendChild(skull);
            // const svgPath = 'assets/skull.svg';
            // // Loop through each path element and set the fill and stroke attributes
            // fetch(svgPath)
            // .then(response => response.text())
            // .then(svgData => {
            //     // Process the SVG data
            //     endPunchHoleDiv.innerHTML = svgData;
            // });
            // endPunchHoleDiv.textContent = "death";
        }
        endSideClass.appendChild(endPunchHoleDiv);
        line.appendChild(endSideClass);
    //   console.log(line);
      // Append the line to the reel
      document.querySelector('.reel').appendChild(line);
    }
};

d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv", function(data) {
    console.log(data.price);
});

const generateGraphMovies = (processedData) => {
    const graphContainer = d3.select('.graphs');
    const reelStyles = getComputedStyle(document.querySelector('.graphs'));

    const graphWidth = parseFloat(reelStyles.getPropertyValue('--graphWidth'));
    const graphHeight = parseFloat(reelStyles.getPropertyValue('--graphHeight'));
    const padding = parseFloat(reelStyles.getPropertyValue('--padding'));
    const dotRadius = parseFloat(reelStyles.getPropertyValue('--dotRadius'));
    const dotColor = reelStyles.getPropertyValue('--dotColor');
    const maxMinutes = Math.max(...processedData.map((movie) => movie.lastOccurence));
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Margins around the plot area
    const plotWidth = graphWidth - margin.left - margin.right; // Width of the plot area
    const plotHeight = graphHeight - margin.top - margin.bottom; // Height of the plot area
    processedData.forEach((movie) => {
        // Create a new SVG element for each graph
        //Create a data object for each movie, being an array containing the number of swears for each minute. If the map doesnt contain a minute, add 0
        let array = [];
        for (let i = 0; i < maxMinutes; i++) {
            if (movie.minutes[i]) {
                array.push(movie.minutes[i].words.length);
            } else {
                array.push(0);
            }
        }
       
        console.log(array.length);
        const svg = graphContainer
          .append('svg')
          .attr('width', graphWidth) // Set the width of the graph SVG element
          .attr('height', graphHeight) // Set the height of the graph SVG element
          .style('background-color', '#1f1f1f')
          .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`); // Apply margins to the plot area

        // // X axis: scale and draw:
        // let x = d3.scaleLinear()
        // .domain([0, maxMinutes])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        // .range([0, graphWidth]);
        // svg.append("g")
        // .attr("transform", "translate(0," + graphHeight + ")")
        // .call(d3.axisBottom(x));

         // console.log(movie.minutes.length);
         const xScale = d3
         .scaleLinear()
         .domain([0, maxMinutes])
         .range([0, plotWidth]);

 const yScale = d3
   .scaleLinear()
   .domain([0, maxNumberOfSwears])
   .range([plotHeight, 0]);

        const dotRadius = 1; // Radius of the dots

        // Generate data for scatter plot
const scatterData = [];
array.forEach((value, index) => {
  if (value > 1) {
    for (let i = 1; i <= value; i++) {
      scatterData.push({ x: index + 1, y: i });
    }
  }
});

svg
  .selectAll('circle')
  .data(scatterData)
  .enter()
  .append('circle')
  .attr('cx', (d) => xScale(d.x))
  .attr('cy', (d) => yScale(d.y))
  .attr('r', dotRadius)
  .style('fill', 'steelblue');

  // Add x-axis
svg
.append('g')
.attr('class', 'x-axis')
.attr('transform', `translate(0, ${plotHeight})`)
.call(d3.axisBottom(xScale));

// Add y-axis
svg
.append('g')
.attr('class', 'y-axis')
.call(d3.axisLeft(yScale));

// Add title
svg
  .append('text')
  .attr('class', 'title')
  .attr('x', plotWidth / 2)
  .attr('y', margin.top)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .text(movie.movieTitle);


        // const hist = d3.histogram()
        // .value((d) => d)
        // .domain(x.domain())
        // .thresholds(x.ticks(maxMinutes));

        // const bins = hist(array);

        // console.log(bins);

       

    //   svg.selectAll('.svg')
    //   .data(movie.minutes, (d) => d.key) // Use the key as the data identifier
    //   .enter()
    //   .append('circle')
    //   .attr('class', 'dot')
    //   .attr('cx', (d) => xScale(d.key)) // Set the x-coordinate based on the key (minute)
    //   .attr('cy', (d) => {
    //     if (d.value) {
    //       return yScale(d.value.length); // Set the y-coordinate based on the number of occurrences
    //     } else {
    //       return yScale(0); // If the minute has no occurrences, set the y-coordinate to the minimum value on the y-axis scale
    //     }
    //   })
    //   .attr('r', dotRadius) // Set the radius of the dots
    //   .style('fill', dotColor); // Set the color of the dots
    // svg.selectAll("rect")
    //   .data(bins)
    //   .enter()
    //   .append('rect')
    //     .attr('x', (d) => x(d.x0)) // Set the x-coordinate of the rectangle
    //     .attr('y', (d) => yScale(d.length)) // Set the y-coordinate of the rectangle
    //     .attr('width', (d) => x(d.x1) - x(d.x0) - 1) // Set the width of the rectangle based on bin width
    //     .attr('height', (d) => graphHeight - yScale(d.length)) // Set the height of the rectangle based on bin frequency
    //     .style('fill', 'steelblue'); // Set the color of the bars
  });

      console.log(graphContainer);
};
  
