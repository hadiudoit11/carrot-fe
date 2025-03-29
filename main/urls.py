from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.contrib import admin

schema_view = get_schema_view(
   openapi.Info(
      title="API Documentation",
      default_version='v1',
      description="API documentation",
   ),
   public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Your other URL patterns...
    
    # API documentation URLs
    path('docs/', include_docs_urls(title='API Documentation')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] 