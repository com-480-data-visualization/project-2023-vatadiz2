// fetch("data/tarantino.csv")
//     .then(response => response.text())
//     .then(html => {
//         // Create a new div element to contain the HTML code
//         const div = document.createElement("div");
//         div.innerHTML = html;

// const { count } = require("d3-array");

//         // Insert the new div element into the parent container
//         document.body.appendChild(div);
//     })
//     .catch(error => console.log(error));

// Import the CSV file into the script

//source for vector : https://www.vecteezy.com/vector-art/93059-skull-bones-silhouette-free-vector
var dataset = [];

var maxNumberOfSwears = 0;
var maxMinutes = 0;

const swearTypes = new Map();
const FuckFamily = ['fuck', 'fucked', 'fucking', 'fucks', 'motherfucker', 'motherfuckers', 'fuckface', 'fuckhead', 'fucker', 'fuckup','fuckers','motherfucking']
const ShitFamily = ['bullshit', 'shit', 'shitty', 'shithead', 'horeshit', 'shitless', 'shitting', 'shitload', 'shittiest', 'horseshit', 'chickenshit']
const RacialFamily = ['jew', 'jap', 'n-word', 'negro', 'japs', 'gook', 'gooks','wetback', 'slope', 'squaw']

FuckFamily.forEach( k => {
    swearTypes.set(k, 'FuckFamily');
});

ShitFamily.forEach( k => {
    swearTypes.set(k, 'ShitFamily');
});

RacialFamily.forEach( k => {
    swearTypes.set(k, 'RacialFamily');
});



const movieColors = {
    'Reservoir Dogs': 'rgb(164,157,156)',
    'Pulp Fiction': 'rgb(208,202,203)',
    'Jackie Brown': 'rgb(201,144,108)',
    'Kill Bill: Vol. 1': 'rgb(243,210,72)',
    'Kill Bill: Vol. 2': 'rgb(205,63,51)',
    'Inglorious Basterds': 'rgb(195,185,156)',
    'Django Unchained': 'rgb(213,178,85)',
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
  
        // Word is stored with the accurate minute as well
        if (d.type === 'word') {
            let wData = {
                word: d.word,
                timestamp: d.minutes_in
            }
            minutes[minutesIn].words.push(wData);
        //   minutes[minutesIn].words.push(d.word);
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
    
    // Load movie data for movie popup
    d3.json("data/movies.json", (data) => {
        let counterRefs = generateMoviePopup(data, processedData);

        generateLines(processedData, counterRefs);
        generateGraphMovies(processedData);
    });
    
  };

  // Load the CSV file
d3.csv("data/tarantino.csv", processData);

// Step 1: Define a function to generate the lines based on processedData
const generateLines = (processedData, counterRefs) => {
    
    // Create the lines based on the maximum number of minutes
    let absLineCount = 0;
    for (let i = 1; i <= maxMinutes; i++) {
        
        // Determine the line class for styling
        let lineClass = 'line-middle';
        if(absLineCount % 5 == 0) {
            lineClass = 'line-top';
        } else if (absLineCount % 5 == 4) {
            lineClass = 'line-bottom';
        }


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

        let deathData = {};
        
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
                    span.style.outlineColor = movieColors[movieTitle];
                    span.classList.add('data-dot');
                    span.style.width = `${((minutes[i].words.length / maxNumberOfSwears) * 90) + 10}%`;
                    dataField.appendChild(span);

                    // Add modal effect at the current minute
                    setupModalForDot(span, minutes[i], movieColors[movieTitle], counterRefs[movieTitle]);
                }
                if (minutes[i].deaths > 0) {
                    hasDeath = true;
                    numberDeaths += minutes[i].deaths;
                    deathData[movieTitle] = minutes[i].deaths;
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
            skull.src = 'img/skull.svg';
            endPunchHoleDiv.appendChild(count);
            endPunchHoleDiv.appendChild(skull);

            // To indicate that the area is interactable
            endPunchHoleDiv.classList.add('interactable');
            setupModalForDeath(endPunchHoleDiv, deathData);

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

        absLineCount++;
    }
};

/**
 * Creates the modal effect binds for the dot
 * @param {*} dotEl 
 * @param {*} data data with the words for this minute/movie
 */
function setupModalForDot(dotEl, data, color, counterRef){
    const modalHolder = document.getElementById('reelPopup');
    let wordsNb = data.words.length;

    let oneTime = false; // Avoid scroll event listener to be added multiple times

    // Modal creation
    let modal = createModal(data);

    // Setup event listeners
    dotEl.addEventListener('mouseenter', () => {
        modalHolder.appendChild(modal);
    });

    dotEl.addEventListener('mouseleave', () => {
        modalHolder.removeChild(modal);
    });

    // On move, update the position of the modal
    dotEl.addEventListener('mousemove', (e) => {
        // Take into account the scroll position
        modal.style.left = e.clientX + 40 + 'px';
        modal.style.top = e.clientY - 15 + window.scrollY + 'px';
    });

    // Event listener on scroll to make dot appear when reached bottom of screen
    dotEl.classList.add('hidden');

    window.addEventListener('scroll', () => {
        if (dotEl.getBoundingClientRect().top < window.innerHeight - 100) {
            if(oneTime) return;
            dotEl.classList.add('appear');
            dotEl.classList.remove('hidden');
            counterRef.innerHTML = parseInt(counterRef.innerHTML) + wordsNb;
            oneTime = true;
            
            // Add shake effect
            let parentDiv = counterRef.parentElement;
            parentDiv.classList.add('small-shake');
            setTimeout(() => {
                parentDiv.classList.remove('small-shake');
            }, 100);

            // Add big shake effect
            if(wordsNb > 8) {
                // Trick to reset animation
                parentDiv.style.animation = 'none';
                parentDiv.offsetHeight; /* trigger reflow */
                parentDiv.style.animation = null; 

                parentDiv.classList.add('big-shake');
                setTimeout(() => {
                    parentDiv.classList.remove('big-shake');
                }, 300);
            }

        } else {
            if(!oneTime) return;
            dotEl.classList.remove('appear');
            dotEl.classList.add('hidden');
            counterRef.innerHTML = parseInt(counterRef.innerHTML) - wordsNb;
            oneTime = false;
        }
    });


    /**
     * Create the modal element for this specific dot
     * @param {*} d 
     * @returns 
     */
    function createModal(d) {
        let box = document.createElement('div');
        box.classList.add('popup-reel');
        // box.style.backgroundColor = color;

        // Group words by count
        let wordsByCount = d3.nest()
            .key((d) => d.word)
            .rollup((v) => v.length)
            .entries(d.words);

        // Order by count
        wordsByCount.sort((a, b) => b.value - a.value);

        // For each of the words create the element for the modal
        let i = 0;
        wordsByCount.forEach((word) => {
            // Create a list item
            let el = document.createElement('div');
            
            // Word and count
            let nb = document.createElement('span');
            nb.innerHTML = "<small>x</small>" + word.value + " " + word.key;

            // Timestamp(s)
            let timestamps = document.createElement('small');
            timestamps.classList.add('time');

            let tsList = [];
            let onyWord = d.words.filter((w) => w.word == word.key);
            onyWord.forEach((w) => {
                // only seconds
                tsList.push(Math.floor(w.timestamp * 60 % 60));
            });

            timestamps.textContent += "at ";
            timestamps.textContent += tsList.join(', ');
            timestamps.textContent += " sec";

            el.appendChild(nb);
            el.appendChild(timestamps);
            box.appendChild(el);

            el.style.animationDelay = i * 0.05 + 's';

            i++;
        });
        
        return box;
    }
}

function getFamily(word) { 
    const defaultFamily = 'others';
     // Check if the swearTypes map has an entry for the given word
     for (const [swearWord, family] of swearTypes.entries()) {
        if (swearWord === word) {
          return family; // Return the corresponding family
        }
      }
    
      return defaultFamily; // Return the default family if word is not found
    } // Default family if word is not found

function setupModalForDeath(skullEl, data){
    const modalHolder = document.getElementById('reelPopup');

    // Modal creation
    let modal = createModal(data);

    // Setup event listeners
    skullEl.addEventListener('mouseenter', () => {
        modalHolder.appendChild(modal);
    });

    skullEl.addEventListener('mouseleave', () => {
        modalHolder.removeChild(modal);
    });

    // On move, update the position of the modal
    skullEl.addEventListener('mousemove', (e) => {
        // The box should appear on the left of the mouse
        modal.style.left = e.clientX - 40 - modal.offsetWidth + 'px';
        // Take into account the scroll position
        modal.style.top = e.clientY - 15 + window.scrollY + 'px';
    });

    /**
     * Create the modal element for this specific skull
     * @param {*} d 
     * @returns 
     */
    function createModal(d) {
        let box = document.createElement('div');
        box.classList.add('popup-reel-death');

        // Create array from object
        let deaths = [];
        for (const [title, killCount] of Object.entries(d)) {
            deaths.push({title, killCount});
        }

        // Sort by kill count
        deaths.sort((a, b) => b.killCount - a.killCount);

        let i = 0;
        // For each key title value death count
        deaths.forEach((death) => {
            console.log(death);
            // Create a list item
            let el = document.createElement('div');
            
            // Death count
            let nb = document.createElement('span');
            nb.innerHTML = "<small>x</small>" + death.killCount;

            // Movie names
            let name = document.createElement('small');
            name.classList.add('name');

            name.textContent = death.title

            el.appendChild(nb);
            el.appendChild(name);
            box.appendChild(el);

            el.style.animationDelay = i * 0.05 + 's';

            i++;
        });
        
        return box;
    }
}

const generateGraphMovies = (processedData) => {
    const graphContainer = d3.select('.graphs');
    const reelStyles = getComputedStyle(document.querySelector('.graphs'));

    const graphWidth = parseFloat(reelStyles.getPropertyValue('--graphWidth'));
    const graphHeight = parseFloat(reelStyles.getPropertyValue('--graphHeight'));
    const padding = parseFloat(reelStyles.getPropertyValue('--padding'));
    const rectangleSize = 5.5;
    const dotColor = reelStyles.getPropertyValue('--dotColor');
    const maxMinutes = Math.max(...processedData.map((movie) => movie.lastOccurence));
    const margin = { top: 60, right: 20, bottom: 20, left: 40 }; // Margins around the plot area
    const plotWidth = graphWidth - margin.left - margin.right; // Width of the plot area
    const plotHeight = graphHeight - margin.top - margin.bottom; // Height of the plot area
    processedData.forEach((movie) => {
        // Create a new SVG element for each graph
        //Create a data object for each movie, being an array containing the number of swears for each minute. If the map doesnt contain a minute, add 0
        let numberWordsPerMinutes = [];
        for (let i = 0; i < maxMinutes; i++) {
            if (movie.minutes[i]) {
                numberWordsPerMinutes.push(movie.minutes[i].words.length);
            } else {
                numberWordsPerMinutes.push(0);
            }
        }
       
        //console.log(numberWordsPerMinutes);
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

        // Generate data for scatter plot
const scatterData = [];
numberWordsPerMinutes.forEach((value, index) => {
  if (value > 1) {
    for (let i = 1; i <= value; i++) {
      scatterData.push({ x: index + 1, y: i, family: getFamily(movie.minutes[index].words[i-1].word), word: movie.minutes[index].words[i-1].word});
    }
  }
});

//console.log(scatterData);
//keep only first character or number of each words
var movieTitle = movie.movieTitle.replace(/[^a-zA-Z0-9]/g, '');

// svg
//   .selectAll('circle')
//   .data(scatterData)
//   .enter()
//   .append('circle')
//   .attr('cx', (d) => xScale(d.x))
//   .attr('cy', (d) => yScale(d.y))
//   .attr('r', dotRadius)
//   .style('fill', movieColors[movie.movieTitle])
//   .on('mouseover', function(d) {
//     // Change the style or behavior when the mouse is over a circle
//     d3.select(this).style('fill', 'red');
//   })
//   .on('mouseout', function(d) {
//     // Revert the style or behavior when the mouse leaves a circle
//     d3.select(this).style('fill', movieColors[movie.movieTitle]);
//   });

// Create separate groups for each swear family
const groups = svg
  .selectAll('g.swear-group')
  .data(['FuckFamily', 'RacialFamily', 'ShitFamily', 'others']) // Add the names of your swear families here
  .enter()
  .append('g')
  .attr('class', d => `swear-group ${d}`);

  // Create the tooltip
const tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html((d) => `<span>${d.word}</span><br><small>(${d.family})</small>`);


// Append rectangles to the corresponding group based on the swear family
groups
  .selectAll('rect')
  .data(d => scatterData.filter(item => item.family === d))
  .enter()
  .append('rect')
  .attr('x', (d) => xScale(d.x) - rectangleSize/2)
  .attr('y', (d) => yScale(d.y))
  .attr('width', rectangleSize)
  .attr('height', rectangleSize)
  .style('fill', movieColors[movie.movieTitle])
  .style('transition', '0.1s opacity')
  .on('mouseover', function(d) {
    // Highlight all circles of the same family
    const family = d.family;
    svg.selectAll(`g.swear-group:not(.${family}) rect`).style('opacity', 0.3);
    // Show the tooltip
    tip.show(d, this);
  })
  .on('mouseout', function() {
    // Revert the opacity of all circles when the mouse leaves
    svg.selectAll('rect').style('opacity', 1);
    // Hide the tooltip
    tip.hide();
  })
  .call(tip);

  // Add x-axis
svg
.append('g')
.attr('class', movieTitle)
.style('stroke', movieColors[movie.movieTitle])
.attr('transform', `translate(0, ${plotHeight})`)
.call(d3.axisBottom(xScale));

// Add y-axis
svg
.append('g')
.attr('class', movieTitle)
.style('stroke', movieColors[movie.movieTitle])
.call(d3.axisLeft(yScale)
    .ticks(5)
    .tickPadding(10)
    );

// Add CSS styles for the axis lines and paths
svg
  .append('style')
  .text(`
    .${movieTitle} line {
      stroke: ${movieColors[movie.movieTitle]};
    }
    .${movieTitle} path {
      stroke: ${movieColors[movie.movieTitle]};
    }
  `);

  
// Add title
svg
  .append('text')
  .attr('class', 'title')
  .attr('x', plotWidth / 2)
  .attr('y', margin.top / 2)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .style('fill', movieColors[movie.movieTitle])
  .text(movie.movieTitle);
  });
};

/**
 * Generate the bottom popup tab for the movies
 * @param {*} data data on the movies
 * @param {*} wordsData only to get order of movies
 * @returns the reference to the nb counters for each movie
 * 
 */
function generateMoviePopup(data, wordsData){
    const reel = document.querySelector('.reel-box'); // The main box container

    let movieCounters = {};

    // Create the popup container
    let nav = document.createElement("nav");

    // for all keys as movies and values
    wordsData.forEach((entry) => {
        let title = entry.movieTitle;
        let mData = data[title];
        
        // console.log(mData);
        // console.log(title);

        // Create the movie tabs
        let movie = document.createElement("div");
        let t = document.createElement("h2");
        t.innerText = title;
        t.style.color = movieColors[title];
        let img = document.createElement("img");
        img.src = "img/movies/cover/" + mData.code + ".png";

        let nb = document.createElement("span");
        nb.innerText = 0;
        nb.classList.add("nb");

        // Add the nb counter to the movieCounters object
        movieCounters[title] = nb;

        // Append the elements to the movie tab
        movie.appendChild(nb);
        movie.appendChild(t);
        movie.appendChild(img);
        nav.appendChild(movie);

        // Create on click event to show movie info panel
        movie.addEventListener('click', () => {
            openInfoModal(mData);
        });
    });

    // Append the popup to the body
    reel.appendChild(nav);

    // Hide scrollbar if reached the end of reel
    window.addEventListener('scroll', () => {
        if (window.innerHeight >= reel.getBoundingClientRect().bottom - 120) {
            nav.classList.add('ready');
        } else {
            nav.classList.remove('ready');
        }
    });

    return movieCounters;

}

/**
 * Opens or closes the info modal with the movie's data
 * @param {*} data data on the movie, or null if closing
 */
function openInfoModal(data = null){
    let modal = document.querySelector('.info-layer');
    if(data == null) {
        modal.classList.remove('open');
        return;
    }
    modal.classList.add('open');

    // List element index for animation
    let liDelay = 5; // Start with a small delay

    // Close button
    let close = document.createElement("img");
    close.src = "img/back.svg";
    close.classList.add("back");
    close.addEventListener('click', () => {
        openInfoModal(null);
    });

    // Title line
    let main = modal.querySelector('main');
    main.innerHTML = ""; // Clear the main

    let titleArea = document.createElement("h1");
    let runtime = Math.floor(data.runtime / 60) + "h" + data.runtime % 60;
    titleArea.innerHTML = `<strong>${data.title}</strong> <small>(${data.year})</small> <span class="time">${runtime}</span>`;
    titleArea.prepend(close);

    // Synopsis box
    let synopsis = document.createElement("div");
    synopsis.classList.add("synopsis");

    let innerS = document.createElement("div");
    innerS.innerHTML = "<h2>Synopsis</h2>";
    innerS.innerHTML += `<p>${data.synopsis}</p>`;

    let img = document.createElement("img");
    img.src = "img/movies/header/" + data.code + ".png";
    synopsis.appendChild(innerS);
    synopsis.appendChild(img);

    // Actors box
    let actors = document.createElement("div");
    actors.innerHTML = "<h3>Actors</h3>";
    let aList = document.createElement("ul");
    data.actors.forEach((actor) => {
        let li = document.createElement("li");
        li.innerHTML = `<b>${actor.name}</b> as (${actor.role})`;
        li.style.animationDelay = (liDelay * 0.05) + "s";
        aList.appendChild(li);
        liDelay++;
    });
    actors.appendChild(aList);

    // Fun facts box
    let funFacts = document.createElement("div");
    funFacts.innerHTML = "<h3>Fun facts</h3>";
    let fList = document.createElement("ul");
    data.funfacts.forEach((fact) => {
        let li = document.createElement("li");
        li.innerText = fact;
        li.style.animationDelay = (liDelay * 0.05) + "s";
        fList.appendChild(li);
        liDelay++;
    });
    funFacts.appendChild(fList);

    // Append all to the main
    main.appendChild(titleArea);
    main.appendChild(synopsis);
    main.appendChild(actors);
    main.appendChild(funFacts);
}

// Other closing actions
// Clicking outside the info modal closes it
let infoLayer = document.querySelector('.info-layer');
infoLayer.addEventListener('click', (e) => {
    if(e.target.classList.contains('info-layer')) {
        openInfoModal(null);
    }
});

// Scrolling closes the info modal
window.addEventListener('scroll', (e) => {
    if(infoLayer.classList.contains('open')) {
        openInfoModal(null);
    }
});

// Clicking ESC closes the info modal
window.addEventListener('keydown', (e) => {
    if(e.key == "Escape") {
        if(infoLayer.classList.contains('open')) {
            openInfoModal(null);
        }
    }
});