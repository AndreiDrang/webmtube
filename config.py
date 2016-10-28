from os import path

# 2CH URL
DVACH_DOMAINS = ('2ch.hk',)
ALLOWED_BOARDS = ('b',)
MAX_SIZE = 5000000  # 5MB

BASE_DIR = path.abspath('')
DB_ENGINE = 'sqlite:///db.sqlite3'

WEBM_PATH = path.join(BASE_DIR, 'webm_files')

## SCREAMER DETERMENITION
# GOOD = -20.0             # If lower than this not ear damaging GREEN   %0
LOUD = -12.0  # if bigger Just loud, most likely not annoying YELLOW  %50
SCREAM = -5.0  # Very loud, if bigger 80% scream ORANGE
DEFENITLY_SCREAM = -0.5  #if bigger then 100% scream RED
