package com.codeclash.codeclash.config;


import com.codeclash.codeclash.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;
import java.util.Collection;
@Component
@EnableWebSecurity
@AllArgsConstructor
@Configuration
public class SecurityConfig {
    private UserDetailsService userDetailsService;
    private JwtAuthenticationEntryPoint authenticationEntryPoint;
    private JwtAuthenticationFilter authenticationFilter;

    @Autowired
    private UserRepository userRepository;

    @Bean
    public static PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration configuration = new CorsConfiguration();
                        configuration.setAllowCredentials(true);

                        configuration.setAllowedOrigins(Arrays.asList("http://192.168.9.100:3000","http://localhost:3000"
                        ));
                        configuration.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept"));
                        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                        configuration.setAllowedHeaders(Arrays.asList("*"));
                        configuration.setMaxAge(Duration.ofMinutes(5L));
                        return configuration;
                    }
                }))
                .csrf(csrf->csrf.disable())
                .authorizeHttpRequests(auth ->{
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers("/api/quiz/**").permitAll();
                    auth.requestMatchers("/ws/**").permitAll();
                    auth.requestMatchers("/api/open/**").permitAll();
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager();
    }

}
