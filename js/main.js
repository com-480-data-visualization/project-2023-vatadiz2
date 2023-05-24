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
});

