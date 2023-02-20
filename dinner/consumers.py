import json
from channels.generic.websocket import WebsocketConsumer

from .philosphers_dinner_process import Process
from .philosphers_dinner_thread import ThreadDinner

class DinnerConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

        self.send(text_data=json.dumps({"type": "connection_established", "message": "You are now connected!"}))

    def receive(self, text_data):
        data = json.loads(text_data)
        implementation = data["implementation"]
        waiter = data["waiter"]
        how_many_books = int(data["how_many_books"])
        time = data["time"]

        guests = ["Sokrates", "Platon", "Nietzsche", "Arystoteles", "Kant"]

        # print(
        #     "Implementation: {}\nWaiter: {}\nBooks: {}".format(
        #         implementation, "yep" if waiter else "nope", how_many_books
        #     )
        # )
        # print()

        if implementation == "multiprocessing":
            # dinner = ProcessDinner(guests, how_many_books, waiter)
            # dinner.lets_get_it_started()
            self.send(text_data=json.dumps({"type": "Error", "message": "Multiprocessing option is unavailable."}))
        else:
            dinner = ThreadDinner(self, guests, how_many_books, time, waiter)
            dinner.lets_get_it_started()


    # def dinner_message(self, event):
    #     message = event["message"]
    #     await self.send(text_data=json.dumps({"type": "dinner", "message": message}))
