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
var dataset = [];

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
  
    generateLines(processedData);
    console.log(processedData);
  };

  // Load the CSV file
d3.csv("data/tarantino.csv", processData);

// Step 1: Define a function to generate the lines based on processedData
const generateLines = (processedData) => {
    // Find the maximum number of minutes across all movies
    const maxMinutes = Math.max(...processedData.map((movie) => movie.lastOccurence));
    console.log(maxMinutes);

    const maxNumberOfSwears = Math.max(...processedData.map((movie) => Math.max(...Object.values(movie.minutes).map((minute) => minute.words.length))));
    console.log(maxNumberOfSwears);
  
    // Create the lines based on the maximum number of minutes
    for (let i = 1; i <= maxMinutes; i++) {
        console.log(i);
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
        console.log(line);

        const dataDiv = document.createElement('div');
        dataDiv.classList.add('data');
        line.appendChild(dataDiv);

        const lineHeight = line.offsetHeight;
        var hasDeath = false;
        
        // Check for each movie if there are words at the current minute
        processedData.forEach((movie) => {
            console.log(movie);
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
                }
            }
            dataDiv.appendChild(dataField);
        });

        const endSideClass = document.createElement('div');
        endSideClass.classList.add('side');
        const endPunchHoleDiv = document.createElement("div");
        endPunchHoleDiv.classList.add("punch-hole");
        if(hasDeath) {
            endPunchHoleDiv.textContent = "death";
        }
        endSideClass.appendChild(endPunchHoleDiv);
        line.appendChild(endSideClass);
      console.log(line);
      // Append the line to the reel
      document.querySelector('.reel').appendChild(line);
    }
  };
  
