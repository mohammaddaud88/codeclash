package com.codeclash.codeclash.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class jwtValidator extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String jwt = request.getHeader(JwtConstant.jwtHeader);

        if(jwt == null || !jwt.startsWith("Bearer")){
            filterChain.doFilter(request,response);
        }
        jwt = jwt.substring(7);

        try{
            String email = JwtProvider.getEmailFromJwtToken(jwt);
            List<GrantedAuthority> authorities = new ArrayList<>();

            Authentication authentication = new UsernamePasswordAuthenticationToken(email,null,authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e){
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Invalid or expired token");
            return;
        }

        System.out.println("Extracted JWT: " + jwt);

//        if (jwt == null || !jwt.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;  // Skip validation if no token
//        }
//
//        if(jwt != null){
//            try {
//                String email = JwtProvider.getEmailFromJwtToken(jwt);
//                List<GrantedAuthority> authorities = new ArrayList<>();
//
//                Authentication authentication = new UsernamePasswordAuthenticationToken(email,null,authorities);
//                SecurityContextHolder.getContext().setAuthentication(authentication);
//            } catch (Exception e){
//                throw new BadCredentialsException("Invalid token");
//            }
//        }
        filterChain.doFilter(request,response);
    }
}
