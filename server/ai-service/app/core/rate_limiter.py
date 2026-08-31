import time
# pyrefly: ignore [missing-import]
from fastapi import Request, HTTPException
from app.core.llm import redis_client, redis_available

RATE_LIMIT_REQUESTS = 10000  # max requests for high-throughput batch recovery benchmarks
RATE_LIMIT_WINDOW = 60     # per window in seconds
IN_MEMORY_RATELIMIT = {}

async def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    key = f"ratelimit:{client_ip}"
    current_time = int(time.time())

    if redis_available:
        try:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, current_time - RATE_LIMIT_WINDOW)
            pipe.zadd(key, {str(current_time) + ":" + str(time.time()): current_time})
            pipe.zcard(key)
            pipe.expire(key, RATE_LIMIT_WINDOW)
            results = pipe.execute()
            req_count = results[2]

            if req_count > RATE_LIMIT_REQUESTS:
                raise HTTPException(status_code=429, detail="Rate limit exceeded. Too many requests.")
            return True
        except HTTPException:
            raise
        except Exception as e:
            print(f"Redis rate limiter warning: {e}")
            return True

    # Fallback to local tracking
    history = IN_MEMORY_RATELIMIT.get(client_ip, [])
    history = [t for t in history if t > current_time - RATE_LIMIT_WINDOW]
    if len(history) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")
    history.append(current_time)
    IN_MEMORY_RATELIMIT[client_ip] = history
    return True
