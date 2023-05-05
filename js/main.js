fetch("test.html")
    .then(response => response.text())
    .then(html => {
        // Create a new div element to contain the HTML code
        const div = document.createElement("div");
        div.innerHTML = html;

        // Insert the new div element into the parent container
        document.body.appendChild(div);
    })
    .catch(error => console.log(error));
