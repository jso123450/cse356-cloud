import pika

HOST = 'localhost'
EXCHANGE = 'hw3'
EXCHANGE_TYPE = 'direct'

def listen_on(keys):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE,
                            exchange_type=EXCHANGE_TYPE)

    result = channel.queue_declare(exclusive=True)
    queue_name = result.method.queue

    for binding_key in keys:
        channel.queue_bind(exchange=EXCHANGE,
                        queue=queue_name,
                        routing_key=binding_key)

    print(' [*] Waiting for message. To exit press CTRL+C')

    frame, properties, body = channel.basic_get(queue=queue_name)

    print(' [x] Received %r' % (body))

    # def callback(ch, method, properties, body):
    #     print(" [x] %r:%r" % (method.routing_key, body))
    #     return body

    # channel.basic_consume(callback,
    #                     queue=queue_name)

    # channel.start_consuming()

def publish_on(key, msg):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE,
                            exchange_type=EXCHANGE_TYPE)

    channel.basic_publish(exchange=EXCHANGE,
                        routing_key=key,
                        body=msg)

    print(" [x] Sent %r:%r" % (key, msg))
    connection.close()