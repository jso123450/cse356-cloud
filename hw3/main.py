from flask import Flask, jsonify, request
app = Flask(__name__)

@app.route("/")
def hello():
    return "<h1 style='color:blue'>Hello There!</h1>"

@app.route("/listen", methods=['POST'])
def listen():
	try:
		data = request.json
		if data is None:
			return "none"
		else:
			return jsonify(data)
	except Exception as e:
		print(e)
		return "exception"
    # return jsonify(data['keys'])

@app.route("/speak", methods=['POST'])
def speak():
	try:
		data = request.json
		if data is None:
			return "none"
		else:
			return jsonify(data)
	except Exception as e:
		print(e)
		return "exception"
    # return jsonify(data['msg'])

if __name__ == "__main__":
    app.run(host='0.0.0.0')
