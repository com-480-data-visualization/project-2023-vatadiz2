from flask import Flask, render_template

app = Flask(__name__)
app.config['SERVER_NAME'] = 'localhost:5001'

movie_name = "Hateful Eight"

@app.route('/')
def index():
    # Pass the data to the template
    return render_template('index.html', data=movie_name)

# If get request is made to /add/<word>/<minutes_in>
@app.route('/add/word/<word>/<minutes_in>')
def add(word, minutes_in):

    pathified_string = movie_name.lower().replace(" ", "_") + '.csv'
    init_csv(pathified_string)

    entry = movie_name + ',word,' + word.strip() + ',' + minutes_in
    add_to_csv(pathified_string, entry)

    return "true"

# If get request is made to /add/death/<minutes_in>
@app.route('/add/death/<minutes_in>')
def add_death(minutes_in):
    
        pathified_string = movie_name.lower().replace(" ", "_") + '.csv'
        init_csv(pathified_string)
    
        entry = movie_name + ',death,,' + minutes_in
        add_to_csv(pathified_string, entry)
    
        return "true"


def init_csv(file_name):
    # Check if file exists, if not create it with the headers
    try:
        with open(file_name, 'r') as f:
            pass
    except FileNotFoundError:
        with open(file_name, 'w') as f:
            f.write('movie,type,word,minutes_in')
    

def add_to_csv(file_name, entry):
    # Add the entry to the csv file with a new line
    with open(file_name, 'a') as f:
        f.write('\n' + entry)

if __name__ == '__main__':
    app.run()
