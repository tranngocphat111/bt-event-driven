package com.foodorder.gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final String SECRET =
            "mynoonersecretkeyforfoodorderingsystemminibysoftware";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        System.out.println("PATH: " + path);
        System.out.println("METHOD: " + exchange.getRequest().getMethod());

        // Public endpoints (KHÔNG cần token)
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();

            var request = exchange.getRequest().mutate()
                    .header("X-User", username)
                    .build();

            return chain.filter(exchange.mutate().request(request).build());

        } catch (Exception e) {
            return unauthorized(exchange);
        }
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/users/login")
                || path.startsWith("/api/users/register")
                || path.startsWith("/api/users/verify-token")
                || path.startsWith("/api/v1/auth/refresh")
                || path.startsWith("/api/movies")
                || path.startsWith("/api/showtimes");
        // 👈 thêm nếu muốn public
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}