from flask import Flask, jsonify, request
# from consumer import listen_on
# from producer import publish_on
from rabbit import listen_on, publish_on
# from constants import JSON_KEY_STATUS, JSON_KEY_KEY, JSON_KEY_KEYS, JSON_KEY_MSG, JSON_VAL_ERR, \
# 						JSON_VAL_OK, STATUS_ERR, STATUS_OK

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

app = Flask(__name__)

@app.route("/")
def hello():
	print("got get req")
	return "<h1 style='color:blue'>Hello There!</h1>"

@app.route("/listen", methods=['POST'])
def listen():
	print("got listen req")
	res = {}
	try:
		req_data = request.get_json()
		keys = req_data[JSON_KEY_KEYS]
		msg = listen_on(keys)
		res[JSON_KEY_MSG] = msg
	except:
		return jsonify(STATUS_ERR)
	return jsonify(res)

@app.route("/speak", methods=['POST'])
def speak():
	print("got speak req")
	try:
		req_data = request.get_json()
		key = req_data[JSON_KEY_KEY]
		msg = req_data[JSON_KEY_MSG]
		publish_on(key,msg)
	except:
		return jsonify(STATUS_ERR)
	return jsonify(STATUS_OK)

if __name__ == "__main__":
    app.run(host='0.0.0.0')
