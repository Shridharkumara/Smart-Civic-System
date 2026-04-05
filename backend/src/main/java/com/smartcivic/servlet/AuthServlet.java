package com.smartcivic.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcivic.util.DbUtil;
import com.smartcivic.util.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/auth/register", "/api/auth/login"})
public class AuthServlet extends HttpServlet {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        String path = request.getServletPath();
        String body = readBody(request);
        Map<String, String> data = mapper.readValue(body, Map.class);

        try (Connection conn = DbUtil.getConnection()) {
            if (path.endsWith("register")) {
                handleRegister(response, conn, data);
            } else if (path.endsWith("login")) {
                handleLogin(response, conn, data);
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), Map.of("error", "Database error"));
        }
    }

    private void handleRegister(HttpServletResponse response, Connection conn, Map<String, String> data) throws IOException, SQLException {
        String name = data.getOrDefault("name", "").trim();
        String email = data.getOrDefault("email", "").trim().toLowerCase();
        String password = data.getOrDefault("password", "");

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Name, email and password are required."));
            return;
        }

        String passwordHash = hash(password);
        String sql = "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')";
        try (PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, passwordHash);
            stmt.executeUpdate();
            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                int userId = keys.getInt(1);
                String token = JwtUtil.createToken(userId, name, email, "user");
                mapper.writeValue(response.getWriter(), Map.of("token", token, "user", Map.of("id", userId, "name", name, "email", email, "role", "user")));
                return;
            }
            throw new SQLException("Failed to create user");
        } catch (SQLException ex) {
            if (ex.getMessage().contains("Duplicate")) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                mapper.writeValue(response.getWriter(), Map.of("error", "Email already registered."));
            } else {
                throw ex;
            }
        }
    }

    private void handleLogin(HttpServletResponse response, Connection conn, Map<String, String> data) throws IOException, SQLException {
        String email = data.getOrDefault("email", "").trim().toLowerCase();
        String password = data.getOrDefault("password", "");

        String sql = "SELECT user_id, name, email, password_hash, role FROM users WHERE email = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (!rs.next()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                mapper.writeValue(response.getWriter(), Map.of("error", "Invalid login credentials."));
                return;
            }
            String storedHash = rs.getString("password_hash");
            if (!storedHash.equals(hash(password))) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                mapper.writeValue(response.getWriter(), Map.of("error", "Invalid login credentials."));
                return;
            }
            int userId = rs.getInt("user_id");
            String name = rs.getString("name");
            String role = rs.getString("role");
            String token = JwtUtil.createToken(userId, name, email, role);
            mapper.writeValue(response.getWriter(), Map.of("token", token, "user", Map.of("id", userId, "name", name, "email", email, "role", role)));
        }
    }

    private String readBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    private String hash(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(password.getBytes());
            StringBuilder builder = new StringBuilder();
            for (byte b : bytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
