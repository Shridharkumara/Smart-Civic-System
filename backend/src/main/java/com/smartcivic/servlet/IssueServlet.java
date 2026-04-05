package com.smartcivic.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartcivic.util.DbUtil;
import com.smartcivic.util.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/issues/*"})
@MultipartConfig
public class IssueServlet extends HttpServlet {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        String pathInfo = request.getPathInfo();
        try (Connection conn = DbUtil.getConnection()) {
            if (pathInfo != null && pathInfo.length() > 1) {
                int issueId = Integer.parseInt(pathInfo.substring(1));
                fetchIssueDetail(conn, response, issueId);
            } else {
                fetchIssueList(conn, request, response);
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), Map.of("error", "Database error"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        // Removed token check to allow public issue reporting
        int userId = 1; // Use admin user for anonymous reports
        try {
            String body = readBody(request);
            Map<String, String> data = mapper.readValue(body, Map.class);
            try (Connection conn = connFactory()) {
                createIssue(conn, response, userId, data);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Unable to process issue."));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        String pathInfo = request.getPathInfo();
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ") || pathInfo == null || !pathInfo.contains("/status")) {
            respondUnauthorized(response);
            return;
        }

        try {
            var claims = JwtUtil.parseToken(token.substring(7)).getBody();
            String role = (String) claims.get("role");
            if (!"admin".equalsIgnoreCase(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                mapper.writeValue(response.getWriter(), Map.of("error", "Admin access required."));
                return;
            }

            String[] segments = pathInfo.split("/");
            int issueId = Integer.parseInt(segments[1]);
            String body = readBody(request);
            Map<String, String> data = mapper.readValue(body, Map.class);
            String status = data.getOrDefault("status", "Pending");
            updateStatus(connFactory(), response, issueId, status);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Unable to update status."));
        }
    }

    private Connection connFactory() throws SQLException {
        return DbUtil.getConnection();
    }

    private void fetchIssueList(Connection conn, HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        String category = request.getParameter("category");
        String status = request.getParameter("status");
        String search = request.getParameter("search");
        String userIdParam = request.getParameter("user_id");

        StringBuilder sql = new StringBuilder("SELECT i.issue_id, i.title, i.description, i.category, i.image_path, i.image_data, i.video_data, i.status, i.location, i.created_at, u.user_id, u.name, COALESCE(v.vote_count, 0) AS votes FROM issues i JOIN users u ON i.user_id = u.user_id LEFT JOIN (SELECT issue_id, COUNT(*) AS vote_count FROM votes GROUP BY issue_id) v ON i.issue_id = v.issue_id WHERE 1=1");
        List<Object> params = new ArrayList<>();
        if (category != null && !category.isEmpty()) {
            sql.append(" AND i.category = ?");
            params.add(category);
        }
        if (status != null && !status.isEmpty()) {
            sql.append(" AND i.status = ?");
            params.add(status);
        }
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (i.title LIKE ? OR i.description LIKE ? OR i.location LIKE ?)");
            String wildcard = "%" + search + "%";
            params.add(wildcard);
            params.add(wildcard);
            params.add(wildcard);
        }
        if (userIdParam != null && !userIdParam.isEmpty()) {
            sql.append(" AND i.user_id = ?");
            params.add(Integer.parseInt(userIdParam));
        }
        sql.append(" ORDER BY i.created_at DESC");

        try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            ResultSet rs = stmt.executeQuery();
            List<ObjectNode> issues = new ArrayList<>();
            while (rs.next()) {
                ObjectNode item = mapper.createObjectNode();
                item.put("issue_id", rs.getInt("issue_id"));
                item.put("title", rs.getString("title"));
                item.put("description", rs.getString("description"));
                item.put("category", rs.getString("category"));
                item.put("status", rs.getString("status"));
                item.put("location", rs.getString("location"));
                item.put("image_path", rs.getString("image_path"));
                item.put("image_data", rs.getString("image_data"));
                item.put("video_data", rs.getString("video_data"));
                item.put("created_at", rs.getString("created_at"));
                item.put("votes", rs.getInt("votes"));
                ObjectNode author = mapper.createObjectNode();
                author.put("id", rs.getInt("user_id"));
                author.put("name", rs.getString("name"));
                item.set("author", author);
                issues.add(item);
            }
            mapper.writeValue(response.getWriter(), Map.of("issues", issues));
        }
    }

    private void fetchIssueDetail(Connection conn, HttpServletResponse response, int issueId) throws SQLException, IOException {
        String sql = "SELECT i.issue_id, i.title, i.description, i.category, i.image_path, i.image_data, i.video_data, i.status, i.location, i.created_at, u.user_id, u.name, COALESCE(v.vote_count,0) AS votes FROM issues i JOIN users u ON i.user_id = u.user_id LEFT JOIN (SELECT issue_id, COUNT(*) AS vote_count FROM votes GROUP BY issue_id) v ON i.issue_id = v.issue_id WHERE i.issue_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, issueId);
            ResultSet rs = stmt.executeQuery();
            if (!rs.next()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                mapper.writeValue(response.getWriter(), Map.of("error", "Issue not found."));
                return;
            }
            ObjectNode item = mapper.createObjectNode();
            item.put("issue_id", rs.getInt("issue_id"));
            item.put("title", rs.getString("title"));
            item.put("description", rs.getString("description"));
            item.put("category", rs.getString("category"));
            item.put("status", rs.getString("status"));
            item.put("location", rs.getString("location"));
            item.put("image_path", rs.getString("image_path"));
            item.put("image_data", rs.getString("image_data"));
            item.put("video_data", rs.getString("video_data"));
            item.put("created_at", rs.getString("created_at"));
            item.put("votes", rs.getInt("votes"));
            ObjectNode author = mapper.createObjectNode();
            author.put("id", rs.getInt("user_id"));
            author.put("name", rs.getString("name"));
            item.set("author", author);
            mapper.writeValue(response.getWriter(), item);
        }
    }

    private void createIssue(Connection conn, HttpServletResponse response, int userId, Map<String, String> data) throws SQLException, IOException {
        String title = data.getOrDefault("title", "").trim();
        String description = data.getOrDefault("description", "").trim();
        String category = data.getOrDefault("category", "General");
        String location = data.getOrDefault("location", "Unknown location");
        String imageData = data.getOrDefault("imageData", "");
        String videoData = data.getOrDefault("videoData", "");
        String imagePath = data.getOrDefault("imagePath", "");

        if (title.isEmpty() || description.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Title and description are required."));
            return;
        }

        String sql = "INSERT INTO issues (title, description, category, image_path, image_data, video_data, status, location, user_id) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setString(3, category);
            stmt.setString(4, imagePath);
            stmt.setString(5, imageData);
            stmt.setString(6, videoData);
            stmt.setString(7, location);
            stmt.setInt(8, userId);
            stmt.executeUpdate();
            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                int issueId = keys.getInt(1);
                mapper.writeValue(response.getWriter(), Map.of("issue_id", issueId, "status", "Pending"));
                return;
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), Map.of("error", "Unable to create issue."));
        }
    }

    private void updateStatus(Connection conn, HttpServletResponse response, int issueId, String status) throws SQLException, IOException {
        String sql = "UPDATE issues SET status = ? WHERE issue_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, issueId);
            if (stmt.executeUpdate() == 0) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                mapper.writeValue(response.getWriter(), Map.of("error", "Issue not found."));
                return;
            }
            mapper.writeValue(response.getWriter(), Map.of("issue_id", issueId, "status", status));
        }
    }

    private void respondUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        mapper.writeValue(response.getWriter(), Map.of("error", "Authorization token required."));
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
}
