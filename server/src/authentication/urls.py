from .views import METHODS_BY_PATHS
from django.urls import path


urlpatterns = [
    path(_path, method, name=_path)
    for _path, method in METHODS_BY_PATHS.items()
]
