import json
from channels.generic.websocket import WebsocketConsumer
import threading

from .philosphers_dinner_thread import DinnerMultithreading


class DinnerConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({"type": "connection", "status": "True"}))
        self.dinner_status = False

    def receive(self, text_data):
        data = json.loads(text_data)
        action = data["action"]

        if not self.dinner_status and action == "start_dinner":
            waiter = data["waiter"]
            how_many_books = int(data["how_many_books"])
            time = float(data["duration"])
            guests = ["Socrates", "Plato", "Aristotle", "Kant", "Nietzsche"]

            dinner = DinnerMultithreading(self, guests, how_many_books, time, waiter)
            self.thread = DinnerThread(dinner)
            self.thread.start()
            self.dinner_status = True

        if self.dinner_status and action == "stop_dinner":
            self.thread.stop()
            self.dinner_status = False

        if action == "unlock":
            self.dinner_status = False


class DinnerThread(threading.Thread):
    def __init__(self, dinner):
        threading.Thread.__init__(self)
        self.dinner = dinner

    def run(self):
        self.dinner.lets_get_it_started()

    def stop(self):
        self.dinner.stop()
