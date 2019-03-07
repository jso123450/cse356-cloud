from flask import Flask, jsonify, request
from rabbit import listen_on, publish_on
app = Flask(__name__)

JSON_KEY_STATUS = 'status'
JSON_KEY_KEY = 'key'
JSON_KEY_KEYS = 'keys'
JSON_KEY_MSG = 'msg'
JSON_VAL_ERR = 'ERROR'
JSON_VAL_OK = 'OK'

STATUS_ERR = {}
STATUS_ERR[JSON_KEY_STATUS] = JSON_VAL_ERR

STATUS_OK = {}
STATUS_OK[JSON_KEY_STATUS] = JSON_VAL_OK

@app.route("/")
def hello():
    return "<h1 style='color:blue'>Hello There!</h1>"

@app.route("/listen", methods=['POST'])
def listen():
	res = {}
	try:
		req_data = request.get_json()
		keys = req_data[JSON_KEY_KEYS]
		msg = listen_on(keys)
		res[JSON_KEY_MSG] = msg
	# except:
	# 	return jsonify(STATUS_ERR)
	return jsonify(res)

@app.route("/speak", methods=['POST'])
def speak():
	try:
		req_data = request.get_json()
		key = req_data[JSON_KEY_KEY]
		msg = req_data[JSON_KEY_MSG]
		publish_on(key,msg)
	# except:
	# 	return jsonify(STATUS_ERR)
	return jsonify(STATUS_OK)

if __name__ == "__main__":
    app.run(host='0.0.0.0')
