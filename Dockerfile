FROM python:3.7
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000 8001 8080

#CMD [ "adev", "runserver", ".", "--host","0.0.0.0", "-p", "8000"]
#CMD [ "python", "app.py", "--host","0.0.0.0"]