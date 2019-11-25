from os import path

import redis
from environs import Env


env = Env()

MEGABYTE = 1024 * 1024

# 2CH URL
DVACH_DOMAINS = ('2ch.hk', '2ch.pm', '2ch.re', '2ch.tf', '2ch.wf', '2ch.yt', '2-ch.so')
ALLOWED_BOARDS = ('b', 'gd', "pr", 'mlp', 'a')
MAX_SIZE = 22 * MEGABYTE  # 22MB

BASE_DIR = path.abspath('')
DB_ENGINE = env.str("DB_ENGINE", 'sqlite:///test.db')

# Celery configs
BROKER = env.str("BROKER", 'redis://localhost:6379/0')

# Redis caching
CACHING_REDIS = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)

WEBM_PATH = path.join(BASE_DIR, 'webm_files')

## SCREAMER DETERMENITION
# GOOD = -20.0             # If lower than this not ear damaging GREEN   %0
LOUD = -12.0  # if bigger Just loud, most likely not annoying YELLOW  %50
SCREAM = -5.0  # Very loud, if bigger 80% scream ORANGE
DEFENITLY_SCREAM = -0.5  #if bigger then 100% scream RED

LOG_LEVEL = env.str("LOG_LEVEL", 'DEBUG')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        },
    },
    'handlers': {
        'stdout': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
        'main': {
            'level': LOG_LEVEL,
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard',
            'filename': 'logs/main.log',
            'maxBytes': 50 * MEGABYTE,  # 50mb
            'backupCount': 10,
        },
        'celery': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard',
            'filename': 'logs/celery.log',
            'maxBytes': 50 * MEGABYTE,  # 50mb
            'backupCount': 10,
        },
    },
    'loggers': {
        'webmtube': {
            'handlers': ['stdout', 'main'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'webmtube.tasks': {
            'handlers': ['stdout', 'celery'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'gunicorn': {
            'handlers': ['stdout'],
            'level': 'INFO',
            'propagate': True,
        }
    },
}
