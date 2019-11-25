celery:
	celery -A webmtube.tasks worker --loglevel=info --concurrency=2
server:
	gunicorn -b 0.0.0.0:8000 'webmtube.app:api'