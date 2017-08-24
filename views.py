from flask import Flask
from flask import Response
from flask import render_template

app = Flask(__name__)

@app.route("/")
def index():
    #return "Hello World"
	#return render_template("test.html")
	return render_template("index.html")
	
@app.route("/xkcd/")
def xkcd():
    with open('comicGenerator/css/xkcd.css') as f:
	    return Response(f.read(), mimetype='text/css')

if __name__ == "__main__":
    app.run()