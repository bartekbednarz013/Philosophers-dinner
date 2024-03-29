# Philosophers dinner
Single page web application that implements solution of Dining Philosophers Problem (with a slight change) and illustrates course of the dinner.

This time our philosophers are reading while eating. Dinner ends when everybody read all of the books. Each philospher chooses a book he hadn't already read, next takes a seat and than tries to get forks. All choices are random. Waiter watches over the dinner and allows max four people to the table at the time.



## Tech Stack
- Django
- Django Channels
- WebSocket


## Screenshots
<h4>Initial page</h4>
<img src="https://user-images.githubusercontent.com/65030121/235091387-43360e6b-c104-4208-b3d5-9539196962e4.jpg">

<h4>Before dinner begins</h4>
<img src="https://user-images.githubusercontent.com/65030121/235091512-649ccb94-f361-4c78-b7ec-0e6e89624ae1.jpg">

<h4>During dinner</h4>
<img src="https://user-images.githubusercontent.com/65030121/235091622-c4448601-f4e8-4a8e-958a-0f2150ae69d1.jpg">
<img src="https://user-images.githubusercontent.com/65030121/235091681-ce99a868-62bb-4df8-8554-782aaf0dc669.jpg">

<h4>After dinner ends</h4>
<img src="https://user-images.githubusercontent.com/65030121/235091844-10c381fb-cf95-447b-b698-1775bdce74b8.jpg">

## Get started
**1. Clone repository.**
```
git clone https://github.com/bartekbednarz013/Philosophers-dinner.git
```
**2. Install dependencies.**
```
pip install -r requirements.txt
```
**3. Go to ***settings.py*** and replace environment variable with your ***SECRET_KEY***.**

**4. Run server.**
```
python manage.py runserver
```
**5. Open** ```http://127.0.0.1:5000/``` **in your browser.**
