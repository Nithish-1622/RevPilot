package com.recovery.autopilot.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private final Map<String, Long> localRequestCounts = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        if (clientIp == null) clientIp = "127.0.0.1";

        String redisKey = "ratelimit:controlplane:" + clientIp;

        try {
            Long count = redisTemplate.opsForValue().increment(redisKey, 1);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, 60, TimeUnit.SECONDS);
            }

            if (count != null && count > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Rate limit exceeded. Maximum 100 requests per minute.");
                return false;
            }
            return true;
        } catch (Exception e) {
            // Fallback gracefully if Redis is temporarily unreachable
            long count = localRequestCounts.merge(clientIp, 1L, Long::sum);
            if (count > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Rate limit exceeded.");
                return false;
            }
            return true;
        }
    }
}
