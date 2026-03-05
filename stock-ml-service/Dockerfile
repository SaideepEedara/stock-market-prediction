FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install --default-timeout=1000 --no-cache-dir --prefer-binary -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "ml_api:app", "--host", "0.0.0.0", "--port", "8001"]