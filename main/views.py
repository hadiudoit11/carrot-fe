from django.core.handlers.wsgi import WSGIRequest
from rest_framework.decorators import api_view
import logging
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

@api_view(['POST'])
@csrf_exempt
def login(request: WSGIRequest):
    logger.info(f"Received login request with data: {request.data}")
    logger.info(f"Headers: {request.headers}")
    # ... rest of your login view 