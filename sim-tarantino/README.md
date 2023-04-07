# Tarantino Swear Words Logger

This is a sub-poject which allows you to manually log the swear words and death in movies, in the most convenient way possible. It may of course be used for other movies, not only Tarantino's.

## Setup

The logger is a website based module which runs with Python on Flask. Simply run `host.py` and go to `localhost:5001` in your browser.

You must set the name of the movie by changing the `movie_name` variable in `host.py` before you run it. The name will be used to save the log file.

## How to use

Open the project on your broswer. As you start the movie, start the timer by clicking on the "Start" button. As you see a swear word or a death, click on the corresponding button.

You can pause the timer at any time by clicking on the "Pause" button. You can also re-time the timer by entering a timestamp in the text field and clicking on "Re-time".

#### Swear words
You have a list of predefined swear words that you can click to immediately log a swear word at the given time. A list of most recently logged words is going to appear that you can use to quick access the words you have already logged: this is good for words that apprear more often.

If you want to log a swear word that is not in the list, you can click "+ Add word". The timer will remember when you click it, and you will be able to type it in the text field. The word will be logged and added to the list of words.

#### Deaths
You can log a death by clicking on the "Death" button.

## Log file
The swear word will be logged with the time elapsed since the start of the movie, in a csv file, with the following format :

| Column | Description |
| -------------- | ------ |
| `movie` | Movie title |
| `type` | Whether the event was a profane word or a death (by keyword “death” or “word”) |
| `word` | The specific profane word, if the event was a word |
| `minutes_in` | The number of minutes into the film the event occurred |