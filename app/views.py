from flask import Response
from flask import render_template
from app import app

@app.route("/")
def index():
    #return "Hello World"
	#return render_template("test.html")
	return render_template("index.html")
	
@app.route("/xkcd/")
def xkcd():
    with open('comicGenerator/css/xkcd.css') as f:
	    return Response(f.read(), mimetype='text/css')

