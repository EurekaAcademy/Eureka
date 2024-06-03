from .base import *
import environ

DEBUG = False

ALLOWED_HOSTS = ["eurekadataacademy.com", "eureka-production-6efb.up.railway.app"]

env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
DEBUG = env('DEBUG')

DATABASES = {
    "default": dj_database_url.config(default='postgresql://postgres:qDeZYDXnjsGIKOhMQjofGqcPUwWPuiPS@monorail.proxy.rlwy.net:31039/railway', conn_max_age=1800),
}

try:
    from .local import *
except ImportError:
    pass
