from .base import *
import environ

DEBUG = False

ALLOWED_HOSTS = ["dlbcnashville-production.up.railway.app", "dlbcnashville.org"]

env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
DEBUG = env('DEBUG')

try:
    from .local import *
except ImportError:
    pass
