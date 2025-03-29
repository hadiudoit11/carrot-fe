ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '0.0.0.0',
    'host.docker.internal'
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://0.0.0.0:3000",
    "http://host.docker.internal:3000"
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# You might also want to add these for development
CORS_ORIGIN_WHITELIST = [
    "http://localhost:3000",
    "http://0.0.0.0:3000",
    "http://host.docker.internal:3000"
] 