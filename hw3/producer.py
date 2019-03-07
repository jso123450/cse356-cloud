import pika
from functools import partial
from constants import HOST, EXCHANGE, EXCHANGE_TYPE, ENCODING

def on_open(connection, key=None, msg=None):
    connection.channel(partial(on_channel_open, connection=connection,key=key, msg=msg))

def on_channel_open(channel,connection=None,key=None,msg=None):   
    channel.exchange_declare(exchange=EXCHANGE,
                             exchange_type=EXCHANGE_TYPE)
    channel.basic_publish(exchange=EXCHANGE,
                          routing_key=key,
                          body=msg)
    connection.close()

def publish_on(key, msg):
    pika.SelectConnection(pika.ConnectionParameters(host=HOST),
                          on_open_callback=partial(on_open,key=key,msg=msg))
    
    # print(" [x] Sent %r:%r" % (key, msg))

if __name__ == "__main__":
    keys = ["test"]
    msg = "secret sent"
    publish_on(keys[0],msg)